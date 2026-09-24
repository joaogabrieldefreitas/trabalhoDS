import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

export const SUPABASE_URL = 'https://qcdadjcwaardjvflfaar.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_mwDGPcrH8wOP6XO7QP54-Q_K2Ah2lUI';
export const SUPABASE_SECRET_KEY = 'sb_secret_TuDLTuvwf4HxCIyztS0BFQ_BTEzPzgu';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
