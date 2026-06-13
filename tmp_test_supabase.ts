
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function testConnection() {
    console.log('Connecting to:', supabaseUrl);
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase.from('campaigns').select('*').limit(1);

    if (error) {
        console.error('Error connecting to Supabase:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    } else {
        console.log('Successfully connected to Supabase!');
        console.log('Sample Data:', data);
        process.exit(0);
    }
}

testConnection();
