
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://xynlsyvpubhjcfpoplno.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5bmxzeXZwdWJoamNmcG9wbG5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxODYwNTQsImV4cCI6MjA2MDc2MjA1NH0.wspVAPIbygTAdSqFICpDXU54wQ3LcKSNDEMn4KK4UzQ";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY, 
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: localStorage
    }
  }
);
