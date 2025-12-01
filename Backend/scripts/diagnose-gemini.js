require('dotenv').config();
const https = require('https');

function request(path, method = 'GET', bodyObj) {
  const key = process.env.GOOGLE_API_KEY;
  return new Promise((resolve, reject) => {
    const data = bodyObj ? JSON.stringify(bodyObj) : null;
    const opts = {
      method,
      hostname: 'generativelanguage.googleapis.com',
      path: path + `?key=${key}`,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data ? Buffer.byteLength(data) : 0
      }
    };
    const req = https.request(opts, res => {
      let buf = '';
      res.on('data', c => buf += c);
      res.on('end', () => resolve({ status: res.statusCode, body: buf }));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function mask(key) { return key ? key.slice(0,6) + '...' + key.slice(-6) : '(none)'; }

async function main() {
  const key = process.env.GOOGLE_API_KEY;
  console.log('Key length:', key ? key.length : 0, 'mask:', mask(key));
  if (!key) { console.error('Missing GOOGLE_API_KEY'); process.exit(1); }

  console.log('\nStep 1: Listing models (v1)...');
  const listResp = await request('/v1/models');
  console.log('List status:', listResp.status);
  let modelsJson;
  try { modelsJson = JSON.parse(listResp.body); } catch { console.log('Raw list body:', listResp.body.slice(0,300)); }
  if (modelsJson && modelsJson.models) {
    console.log('Model count:', modelsJson.models.length);
    console.log(modelsJson.models.slice(0,10).map(m => m.name).join(', '));
  } else {
    console.log('No models array returned');
  }

  const testModel = 'gemini-1.5-flash';
  console.log(`\nStep 2: Test generateContent on ${testModel} (v1)...`);
  const genResp = await request(`/v1/models/${testModel}:generateContent`, 'POST', {
    contents: [{ role: 'user', parts: [{ text: 'ping' }] }]
  });
  console.log('Generate status:', genResp.status);
  try { console.log('Generate JSON keys:', Object.keys(JSON.parse(genResp.body))); } catch { console.log('Generate raw:', genResp.body.slice(0,300)); }

  console.log('\nStep 3: If list and generate both fail with 404:');
  console.log('- Ensure Generative Language API is enabled for this Cloud project');
  console.log('- Confirm key created in AI Studio vs generic Google Cloud API key restrictions');
  console.log('- Remove API restrictions or re-create unrestricted key');
  console.log('- If status=400 API_KEY_INVALID -> key revoked/expired, regenerate');
}

main();