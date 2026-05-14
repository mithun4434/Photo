import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";

let envConfig: any = {};
try {
  envConfig = dotenv.parse(fs.readFileSync('.env'));
} catch (e) {
  envConfig = dotenv.parse(fs.readFileSync('.env.example'));
}

for (const k in envConfig) {
  if (!process.env[k]) {
     process.env[k] = envConfig[k];
  }
}

let supabaseUrl = process.env.VITE_SUPABASE_URL || '';
if (!supabaseUrl.startsWith('http')) {
  supabaseUrl = `https://${supabaseUrl}.supabase.co`;
}
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, serviceRoleKey);
supabase.from('teamSettings').select('*').limit(1).then(console.log);
