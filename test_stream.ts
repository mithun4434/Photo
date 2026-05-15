import { google } from "googleapis";
import dotenv from "dotenv";
import fs from "fs";

let envConfig: any = {};
try {
  envConfig = dotenv.parse(fs.readFileSync('.env'));
} catch (e) {}

for (const k in envConfig) {
  if (!process.env[k]) {
     process.env[k] = envConfig[k];
  }
}

async function getDriveClient() {
  const accountStr = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || "";
  const credentials = JSON.parse(accountStr.trim().startsWith('{') ? accountStr : Buffer.from(accountStr, 'base64').toString('utf8'));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive"]
  });
  return google.drive({ version: "v3", auth });
}

async function run() {
  const drive = await getDriveClient();
  const res = await drive.files.get({ fileId: '1rEUHIYm8IbYWOdklojQjE-_-Pvh_hr7e', alt: 'media' }, { responseType: 'stream' });
  console.log(res.headers);
}
run();
