require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const MODELS = [
  'gemini-1.5-flash','gemini-1.5-flash-latest','gemini-1.5-pro','gemini-1.5-pro-latest',
  'gemini-1.0-pro','gemini-1.0-pro-latest','gemini-pro-vision','chat-bison-001','text-bison-001','gemini-pro'
];

async function main() {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) { console.error('Missing GOOGLE_API_KEY'); process.exit(1); }
  const genAI = new GoogleGenerativeAI(key);
  console.log('Probing models...');
  for (const name of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: name });
      const res = await model.generateContent('ping');
      const text = res?.response?.text();
      console.log(`[OK] ${name} -> ${text?.slice(0,40)}`);
    } catch (e) {
      console.log(`[FAIL] ${name} status=${e.status || ''} msg=${e.message}`);
    }
  }
}

main();