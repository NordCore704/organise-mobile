import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ssjoprxvkmbforzmlmyn.supabase.co';

const SUPABASE_ANON_KEY = 'sb_publishable_0pKZE0a7LtkD1Tc5EGqLsQ_cmBoPm8Z';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export const MEDIA_BUCKET = 'family-media';