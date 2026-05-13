import "dotenv/config";
import fs from "fs";
import dotenv from "dotenv";

try {
  const envConfig = dotenv.parse(fs.readFileSync('.env'));
  for (const k in envConfig) {
    if (k === 'GOOGLE_SERVICE_ACCOUNT_JSON') {
       process.env[k] = envConfig[k];
    }
  }
} catch(e) {}

import { google } from "googleapis";

async function run() {
  const buff = Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_JSON, 'base64');
  let credentials = JSON.parse(buff.toString('utf8'));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive"]
  });
  const drive = google.drive({ version: "v3", auth });
  
  try {
     const res = await drive.files.get({ fileId: '1rXGrS4VN8WZZzeGME3Q_B0YzdI0TZaAO', fields: 'id, name' });
     console.log("Successfully got Yogesh folder: ", res.data);
  } catch (e: any) {
     console.error("Yogesh error: ", e);
  }
}
run();
