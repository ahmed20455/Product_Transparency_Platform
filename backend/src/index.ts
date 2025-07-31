// backend/src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js'; // Import createClient

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

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
