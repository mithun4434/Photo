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
    const query = `
      -- Create phases table
      create table if not exists public.phases (
        id uuid default gen_random_uuid() primary key,
        name text not null,
        description text,
        "startDate" bigint,
        "endDate" bigint,
        "createdBy" uuid references public.users(id),
        "createdAt" bigint
      );

      alter table public.phases enable row level security;
      
      -- Policies
      drop policy if exists "Anyone can view phases" on public.phases;
      create policy "Anyone can view phases" on public.phases for select using (true);
      
      drop policy if exists "Anyone can insert phases" on public.phases;
      create policy "Anyone can insert phases" on public.phases for insert with check (auth.uid() is not null);
      
      drop policy if exists "Anyone can update phases" on public.phases;
      create policy "Anyone can update phases" on public.phases for update using (auth.uid() is not null);
      
      drop policy if exists "Anyone can delete phases" on public.phases;
      create policy "Anyone can delete phases" on public.phases for delete using (auth.uid() is not null);
    `;

    // Wait, using supabase.auth.admin or normal supabase js, can we run raw SQL?
    // Supabase JS doesn't have a reliable way to run raw SQL unless there's an rpc that executes it.
    console.log("We can't run raw SQL from supabase-js directly without an RPC function.");
}
run();
