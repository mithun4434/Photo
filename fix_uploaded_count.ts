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
async function run() {
  const { data: users } = await supabase.from('users').select('*');
  for (const u of (users || [])) {
    const { count } = await supabase.from('uploads').select('*', { count: 'exact', head: true }).eq('userId', u.id);
    await supabase.from('users').update({ uploadedCount: Math.max(u.uploadedCount || 0, count || 0) }).eq('id', u.id);
  }
  
  const { data: updatedUsers } = await supabase.from('users').select('*');
  let total = 0;
  for (const u of (updatedUsers || [])) {
    total += (u.uploadedCount || u.uploaded_count || 0);
  }
  await supabase.from('teamSettings').update({ 
     totalUploaded: total,
     total_uploaded: total,
     updatedAt: Date.now()
  }).eq('id', 'info');
  console.log("Updated team stats:", total);
}
run();
