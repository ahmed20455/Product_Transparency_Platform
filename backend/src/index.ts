// backend/src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import generateProductReport from './reportGenerator';
import { createReadStream, existsSync, unlinkSync, mkdirSync } from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase URL or Service Key not found in environment variables.');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  }
});

async function testSupabaseConnection() {
    try {
        const { data, error } = await supabaseAdmin.from('products').select('id').limit(1);
        if (error) {
            throw error;
        }
        console.log('Successfully connected to Supabase using client library!');
    } catch (err: any) {
        console.error('Supabase connection or test query error:', err.message);
    }
}

testSupabaseConnection();

app.use(cors());
app.use(express.json());

const reportsDir = path.join(__dirname, '../reports');
if (!existsSync(reportsDir)) {
    mkdirSync(reportsDir);
}

const upsertQuestions = async (questions: any[]) => {
    const questionsToUpsert = questions.map(q => ({
        id: q.id,
        text: q.text,
        type: q.type,
        options: q.options || null,
    }));

    try {
        const { error } = await supabaseAdmin.from('questions').upsert(questionsToUpsert);
        if (error) {
            console.error('Error upserting questions:', error);
            throw error;
        }
    } catch (e) {
        console.error('Exception during question upsert:', e);
        throw e;
    }
};

const getAuthUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header is missing.' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token is missing.' });
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }

    (req as any).user = user;
    (req as any).token = token;
    next();
};

app.get('/api/products', async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin.from('products').select('*').order('created_at', { ascending: false });
        if (error) {
            throw error;
        }
        res.json(data);
    } catch (err: any) {
        console.error('Error fetching products from Supabase:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/products', getAuthUser, async (req, res) => {
    const { name, description, questions: dynamicQuestions, ...dynamicAnswers } = req.body;
    const user = (req as any).user;
    const token = (req as any).token;

    if (!name || !description) {
      return res.status(400).json({ error: 'Product name and description are required.' });
    }
  
    const supabaseForUser = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
    supabaseForUser.auth.setSession({
        access_token: token,
        refresh_token: token
    });
  
    try {
        const { data: companyData, error: companyError } = await supabaseForUser
            .from('companies')
            .select('id')
            .eq('owner_id', user.id)
            .single();

        if (companyError || !companyData) {
            console.error('Error finding company for user:', companyError);
            return res.status(403).json({ error: 'User does not belong to a company.' });
        }
        const companyId = companyData.id;

        if (dynamicQuestions && dynamicQuestions.length > 0) {
            await upsertQuestions(dynamicQuestions);
        }

        const { data: productData, error: productError } = await supabaseForUser
            .from('products')
            .insert({ name, description, company_id: companyId }) // <-- This is the crucial fix
            .select();
  
        if (productError || !productData || productData.length === 0) {
            console.error('Error inserting product into Supabase:', productError);
            return res.status(500).json({ error: 'Failed to add product.' });
        }
  
        const newProductId = productData[0].id;
        
        if (Object.keys(dynamicAnswers).length > 0) {
            const answersToInsert = Object.keys(dynamicAnswers).map(questionId => ({
                product_id: newProductId,
                question_id: questionId,
                value: String(dynamicAnswers[questionId]),
            }));

            const { error: answersError } = await supabaseForUser
                .from('answers')
                .insert(answersToInsert);

            if (answersError) {
                console.error('Error inserting answers into Supabase:', answersError);
            }
        }
  
        res.status(201).json(productData[0]);
    } catch (err: any) {
      console.error('Unexpected error adding product:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
});


app.get('/api/products/:id/report', async (req, res) => {
    const productId = req.params.id;

    try {
        const { data: product, error: productError } = await supabaseAdmin
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();

        if (productError || !product) {
            console.error('Error fetching product for report:', productError);
            return res.status(404).json({ error: 'Product not found.' });
        }

        const { data: answersWithQuestions, error: answersError } = await supabaseAdmin
            .from('answers')
            .select(`
                value,
                questions (id, text, type, options)
            `)
            .eq('product_id', productId);

        if (answersError) {
            console.error('Error fetching answers for report:', answersError);
            return res.status(500).json({ error: 'Failed to fetch answers for report.' });
        }

        const reportFileName = `transparency_report_${productId}.pdf`;
        const filePath = path.join(reportsDir, reportFileName);

        await generateProductReport(product, answersWithQuestions, filePath);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${reportFileName}"`);

        const fileStream = createReadStream(filePath);
        fileStream.pipe(res);

        fileStream.on('close', () => {
          if (existsSync(filePath)) {
            unlinkSync(filePath);
          }
        });

    } catch (err: any) {
        console.error('Error generating or serving report:', err.message);
        res.status(500).json({ error: 'Failed to generate product report.' });
        return;
    }
});


app.get('/api/products/:id/transparency-score', async (req, res) => {
    const productId = req.params.id;

    try {
        const { data: product, error: productError } = await supabaseAdmin
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();

        if (productError || !product) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        const { data: answersWithQuestions, error: answersError } = await supabaseAdmin
            .from('answers')
            .select(`
                value,
                questions (text, type)
            `)
            .eq('product_id', productId);

        if (answersError) {
            return res.status(500).json({ error: 'Failed to fetch answers for scoring.' });
        }

        type AnswerWithQuestion = {
            value: string;
            questions: { text: string; type: string } | { text: string; type: string }[] | null;
        };

const q_and_a_data = (answersWithQuestions as AnswerWithQuestion[] | null)?.map(item => ({
    question_text: Array.isArray(item.questions)
        ? (item.questions.length > 0 ? item.questions[0]?.text : undefined)
        : item.questions?.text,
    answer_value: item.value
})) || [];

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

const aiResponse = await fetch(`${AI_SERVICE_URL}/transparency-score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        product_name: product.name,
        description: product.description,
        questions_and_answers: q_and_a_data
    })
});

        if (!aiResponse.ok) {
            throw new Error('AI service failed to provide a score.');
        }

        const scoreData = await aiResponse.json();
        res.json(scoreData);

    } catch (err: any) {
        console.error('Error fetching score:', err.message);
        res.status(500).json({ error: 'Failed to generate transparency score.' });
    }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
