import 'dotenv/config';
import { google } from 'googleapis';

async function verify() {
  try {
     let credentials;
     console.log('Value starts with:', process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.substring(0, 20));
     
     if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON!.trim().startsWith('{')) {
       credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!);
     } else {
       const buff = Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!, 'base64');
       credentials = JSON.parse(buff.toString('utf8'));
     }
     console.log('Service account:', credentials.client_email);

     const auth = new google.auth.GoogleAuth({
       credentials,
       scopes: ["https://www.googleapis.com/auth/drive"]
     });

     const drive = google.drive({ version: "v3", auth });

     const folders = [
       { name: 'Yogesh', id: process.env.YOGESH_DRIVE_FOLDER_ID },
       { name: 'Mithun', id: process.env.MITHUN_DRIVE_FOLDER_ID },
       { name: 'Nishanth', id: process.env.NISHANTH_DRIVE_FOLDER_ID },
       { name: 'Farhan', id: process.env.FARHAN_DRIVE_FOLDER_ID },
       { name: 'Renuga', id: process.env.RENUGA_DRIVE_FOLDER_ID },
       { name: 'Gokul', id: process.env.GOKUL_DRIVE_FOLDER_ID }
     ];

     for (const f of folders) {
        if (!f.id) {
           console.log(`Missing folder ID for ${f.name}`);
           continue;
        }
        try {
           const res = await drive.files.get({ fileId: f.id, fields: 'id, name' });
           console.log(`✅ ${f.name} folder verified: ${res.data.name}`);
        } catch (e: any) {
           console.log(`❌ ${f.name} folder failed: ${e.message}`);
        }
     }
  } catch (e: any) {
     console.log('Error:', e.message);
  }
}
verify();
