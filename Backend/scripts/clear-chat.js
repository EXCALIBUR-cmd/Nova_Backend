require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/db/db');

async function clearChatHistory() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Delete all messages
    const messageResult = await mongoose.connection.collection('messages').deleteMany({});
    console.log(`Deleted ${messageResult.deletedCount} messages`);

    // Delete all chats
    const chatResult = await mongoose.connection.collection('chats').deleteMany({});
    console.log(`Deleted ${chatResult.deletedCount} chats`);

    console.log('✅ Chat history cleared. Start fresh!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing history:', error);
    process.exit(1);
  }
}

clearChatHistory();
