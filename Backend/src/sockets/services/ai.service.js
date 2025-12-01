const Groq = require('groq-sdk');

// Log key presence for debugging
const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
    console.error('[AI] ERROR: GROQ_API_KEY is undefined in .env');
} else {
    console.log(`[AI] Groq API Key loaded: ${apiKey.slice(0, 6)}...${apiKey.slice(-6)}`);
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Fast model - llama-3.1-8b-instant is the quickest
const FAST_MODEL = 'llama-3.1-8b-instant';

async function resolveModel() {
    // Skip probing—use fast model directly for speed
    console.log('[AI] Using fast model:', FAST_MODEL);
    return FAST_MODEL;
}

async function generateResponse(chatHistory) {
    try {
        const modelName = await resolveModel();
        console.log('[AI] Resolved model:', modelName);
        console.log('[AI] Chat history length:', chatHistory?.length || 0);
        if (!modelName) throw new Error('No model resolved');

        // Convert chat history to Groq format (plain string content, not parts array)
        const messages = chatHistory.map(item => {
            let content = '';
            if (typeof item.content === 'string') {
                content = item.content;
            } else if (item.parts && Array.isArray(item.parts)) {
                content = item.parts.map(p => p.text || p).join(' ');
            } else {
                content = String(item.content || '');
            }
            return {
                role: item.role === 'user' ? 'user' : 'assistant',
                content
            };
        });

        console.log('[AI] Attempting Groq chat.completions with model:', modelName, 'messages:', messages.length);

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: `You are Nova, a helpful and friendly AI brainstorming companion. Your personality and guidelines:

1. **Helpful & Supportive**: You provide thoughtful, actionable advice and ideas. You're genuinely interested in helping the user succeed.

2. **Brainstorming Friend**: You encourage creative thinking, offer multiple perspectives, and help users explore ideas without judgment. You ask clarifying questions to better understand their needs.

3. **Friendly Tone**: You communicate warmly and conversationally. Use casual language, be approachable, and make the user feel comfortable sharing ideas with you.

4. **Multilingual**: 
   - Respond in **English** for most conversations and technical topics.
   - Switch to **Hindi** when the user asks in Hindi or when it makes complex topics more understandable for them.
   - Seamlessly blend both languages if the user mixes them.

5. **Your Name**: You are **Nova**. Feel free to introduce yourself naturally in conversations if asked.

6. **Context Aware**: Remember previous points in the conversation and build on them. Use context to provide relevant follow-ups.

7. **Concise yet Thorough**: Keep responses clear and organized. Use bullet points or numbered lists when helpful. Avoid unnecessary jargon unless the user uses it.

8. **Emoji & Personality**: Use occasional emojis to add warmth and personality (but not excessively).

Remember: You're a brainstorming partner, not a lecture. Engage collaboratively!`
                },
                ...messages
            ],
            model: modelName,
            max_tokens: 512,
            temperature: 0.7
        });

        const text = chatCompletion.choices[0]?.message?.content || '';
        console.log('[AI] Groq Response:', text.slice(0, 100));
        return text;

    } catch (error) {
        console.error('[AI] MAIN ERROR:', error.message, 'Status:', error.status);
        
        if (error.status === 429) {
            return 'I\'m at my request limit. Please wait a moment and retry.';
        }
        
        if (error.status === 401 || error.message?.includes('401')) {
            return 'Invalid Groq API key. Please check your GROQ_API_KEY in .env.';
        }

        if (error.message?.includes('model') || error.message?.includes('decommissioned')) {
            return `Selected model no longer available. Using fallback: ${PREFERRED_MODELS[0]}.`;
        }

        console.error('[AI] Full error:', error);
        return 'AI service unavailable right now. Please retry shortly.';
    }
}
async function generateVector(content) {
    try {
        // Groq does not provide embeddings; return 768-dim mock to match Pinecone index
        console.warn('[AI] Groq does not provide embeddings. Using 768-dimensional mock vector.');
        return Array(768).fill(0).map(() => Math.random());
    } catch (error) {
        console.error('[AI] Embedding Error:', error);
        throw error;
    }
}

module.exports = { generateResponse, generateVector };