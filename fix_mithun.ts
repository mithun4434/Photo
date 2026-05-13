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
   const { data: { users }, error } = await supabase.auth.admin.listUsers();
   console.log("Found users:", users?.length);
   
   let mithun = users?.find((u: any) => 
     u.email === "mithun@example.com" || 
     u.email === "lname3427@gmail.com" ||
     u.user_metadata?.name === "Mithun"
   );
   
   if (mithun) {
      console.log("Found Mithun:", mithun.email, "id:", mithun.id);
      const { data, error: updateError } = await supabase.auth.admin.updateUserById(mithun.id, {
         email: "lname3427@gmail.com",
         password: "Mithun123",
         email_confirm: true
      });
      console.log("Update Mithun auth:", updateError || "Success");
      
      const { error: e2 } = await supabase.from('users').update({
         email: "lname3427@gmail.com"
      }).eq('id', mithun.id);
      console.log("Update Mithun public:", e2 || "Success");
   } else {
      console.log("Could not find Mithun. Creating user...");
      const { data: newAuthData, error: createError } = await supabase.auth.admin.createUser({
        email: "lname3427@gmail.com",
        password: "Mithun123",
        email_confirm: true,
        user_metadata: { name: "Mithun", role: "co-lead" }
      });
      if (createError) {
        console.error("Failed to create", createError);
        return;
      }
      console.log("Created Mithun:", newAuthData.user.id);
      await supabase.from('users').insert({
        id: newAuthData.user.id,
        email: "lname3427@gmail.com",
        name: "Mithun",
        role: "co-lead",
        createdAt: Date.now(),
        driveFolderId: process.env.MITHUN_DRIVE_FOLDER_ID || "",
        uploadedCount: 0
      });
      console.log("Inserted Mithun into public.users");
   }
}
run();
