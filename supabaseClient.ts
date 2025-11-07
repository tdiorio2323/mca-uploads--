import { createClient } from '@supabase/supabase-js';
import { Database } from './types/supabase';

const supabaseUrl = 'https://crpalakzdzvtgvljlutd.supabase.co';
// This is the anon key, which is safe to expose in a browser client.
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNycGFsYWt6ZHp2dGd2bGpsdXRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0MTczMzAsImV4cCI6MjA3MTk5MzMzMH0.oAwkJGpM1rhF6GVav8XMaiZozrku-WUe9JHCYkcjmkI';

// The generic parameter `Database` provides type safety for your Supabase queries.
// You would generate this type from your database schema. For now, we'll use a placeholder.
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
