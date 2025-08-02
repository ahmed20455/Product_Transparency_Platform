// backend/src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js'; // Import createClient
import generateProductReport from './reportGenerator'; // Import the new module
import { createReadStream, existsSync, unlinkSync, mkdirSync } from 'fs'; // For file system operations
import path from 'path'; // For path manipulation


dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Initialize Supabase client for the backend
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;


if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase URL or Service Key not found in environment variables.');
  process.exit(1); // Exit if essential env vars are missing
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false, // Important for server-side
  }
});

// Test Supabase connection (by attempting a simple query)
async function testSupabaseConnection() {
    try {
        // Try to fetch something from a table, e.g., 'products'
        const { data, error } = await supabase.from('products').select('id').limit(1);
        if (error) {
            throw error;
        }
        console.log('Successfully connected to Supabase using client library!');
        // console.log('Test query data:', data); // Uncomment to see data if any
    } catch (err: any) {
        console.error('Supabase connection or test query error:', err.message);
        // process.exit(1); // Consider exiting if connection is critical
    }
}

testSupabaseConnection(); // Call the test function

app.use(cors());
app.use(express.json());

// Ensure a directory for reports exists
const reportsDir = path.join(__dirname, '../reports'); // 'reports' folder at the root of backend
if (!existsSync(reportsDir)) {
    mkdirSync(reportsDir);
}

app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

// Basic API to fetch products (updated to use Supabase client)
app.get('/api/products', async (req, res) => {
  try {
    const { data, error } = await supabase.from('products').select('id, name, description, created_at');
    if (error) {
      throw error;
    }
    res.json(data);
  } catch (err: any) {
    console.error('Error fetching products from Supabase:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// NEW: API to add a new product
app.post('/api/products', async (req, res) => {
  const { name, description } = req.body; // Expecting name and description in the request body

  // Basic validation (can be expanded later)
  if (!name) {
    return res.status(400).json({ error: 'Product name is required.' });
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .insert({ name, description }) // Supabase automatically handles 'id' and 'created_at' defaults
      .select(); // Use .select() to return the inserted data

    if (error) {
      console.error('Error inserting product into Supabase:', error);
      return res.status(500).json({ error: 'Failed to add product.' });
    }

    // Supabase insert typically returns an array of inserted rows
    res.status(201).json(data ? data[0] : {}); // Respond with the first inserted product object
  } catch (err: any) {
    console.error('Unexpected error adding product:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/products/:id/report', async (req, res) => {
  const productId = req.params.id;

  try {
    // 1. Fetch product data from Supabase
    const { data, error } = await supabase.from('products').select('*').eq('id', productId).single();

    if (error || !data) {
      console.error('Error fetching product for report:', error);
      return res.status(404).json({ error: 'Product not found.' });
    }

    // 2. Generate PDF report
    const reportFileName = `transparency_report_${productId}.pdf`;
    const filePath = path.join(reportsDir, reportFileName);

    await generateProductReport(data, filePath); // Use the new report generator

    // 3. Send the generated PDF file as a response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${reportFileName}"`);

    const fileStream = createReadStream(filePath);
    fileStream.pipe(res);

    // Optional: Clean up the file after sending
    fileStream.on('close', () => {
      if (existsSync(filePath)) {
        unlinkSync(filePath); // Delete the temporary PDF
      }
    });

  } catch (err: any) {
    console.error('Error generating or serving report:', err.message);
    res.status(500).json({ error: 'Failed to generate product report.' });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
