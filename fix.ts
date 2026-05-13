import * as fs from "fs";

let content = fs.readFileSync(".env", "utf8");

let startIdx = content.indexOf(`GOOGLE_SERVICE_ACCOUNT_JSON="`);
let endIdx = content.indexOf(`"universe_domain": "googleapis.com""`);

let jsonPart = content.substring(startIdx + `GOOGLE_SERVICE_ACCOUNT_JSON="`.length, endIdx + `"universe_domain": "googleapis.com""`.length);

// It starts with "type", we need to wrap it with { } and fix quotes
// The user pasted:
/*
"type": "service_account",
  ...
  "universe_domain": "googleapis.com""
*/

if (jsonPart.startsWith(`"type"`)) {
  jsonPart = "{" + jsonPart;
}
if (jsonPart.endsWith(`""`)) {
  jsonPart = jsonPart.substring(0, jsonPart.length - 1) + "}";
} else if (jsonPart.endsWith(`"`)) {
  jsonPart = jsonPart + "}";
}

try {
  JSON.parse(jsonPart);
  const base64 = Buffer.from(jsonPart).toString("base64");
  
  content = content.substring(0, startIdx) + 
            `GOOGLE_SERVICE_ACCOUNT_JSON="${base64}"` + 
            content.substring(endIdx);
            
  fs.writeFileSync(".env", content);
  console.log("Fixed successfully.");
} catch(e) {
  console.error("jsonPart: ", jsonPart);
  console.error("Parse Error: ", e);
}
