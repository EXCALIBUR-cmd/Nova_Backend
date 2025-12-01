// Import the Pinecone library
const { Pinecone } = require('@pinecone-database/pinecone')

// Initialize a Pinecone client with your API key
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const index = pc.Index('alpha');
async function creatememory({vectors, metadata, messageid}) {
    await index.upsert([{
id: messageid,
values: vectors,
metadata
    }])
}

async function querymemory({queryVector, limit=5, metadata}) {
    const data = await index.query({
        vector: queryVector,
        topK: limit,
        // Skip metadata filter for now—Pinecone requires proper filter syntax
        // TODO: implement proper metadata filtering with $eq operators
    })
return data.matches;
}
module.exports = { creatememory, querymemory };