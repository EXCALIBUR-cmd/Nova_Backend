require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function main() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error('GOOGLE_API_KEY missing in environment');
    process.exit(1);
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  if (!genAI.listModels) {
    console.log('SDK does not expose listModels; version may be outdated');
    process.exit(0);
  }
  try {
    const listed = await genAI.listModels();
    const models = listed.models || [];
    console.log(`Found ${models.length} models`);
    models.forEach(m => {
      console.log(`${m.name.replace(/^models\//,'')}: methods=[${(m.supportedGenerationMethods||[]).join(',')}] inputTokens=${m.inputTokenLimit} outputTokens=${m.outputTokenLimit}`);
    });
  } catch (e) {
    console.error('Error listing models:', e);
  }
}

main();
