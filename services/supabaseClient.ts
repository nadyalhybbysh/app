
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wvcuyjqndlybbtlvxdrn.supabase.co';
const supabaseKey = 'sb_publishable_-g15do39did5mMoaQGITBw_VxxlcMg0';

export const supabase = createClient(supabaseUrl, supabaseKey);
