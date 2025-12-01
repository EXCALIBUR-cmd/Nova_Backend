require('dotenv').config();
const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

async function main() {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) {
    console.error('Missing GOOGLE_API_KEY');
    process.exit(1);
  }
  const url = `https://generativelanguage.googleapis.com/v1/models?key=${key}`;
  console.log('GET', url.replace(key, '***')); // mask key
  const resp = await get(url);
  console.log('Status:', resp.status);
  try {
    const json = JSON.parse(resp.body);
    console.log('Keys in response:', Object.keys(json));
    if (json.models) {
      json.models.forEach(m => console.log(`${m.name} methods=[${(m.supportedGenerationMethods||[]).join(',')}]`));
    } else {
      console.log('No models field returned:', json);
    }
  } catch (e) {
    console.error('Failed to parse JSON:', e.message);
    console.log(resp.body.slice(0,400));
  }
}

main();