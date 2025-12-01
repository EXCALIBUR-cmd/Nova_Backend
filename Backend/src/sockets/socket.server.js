const { Server } = require("socket.io");
const aiService = require("./services/ai.service");
const messageModel = require("../models/message.model");
const { creatememory, querymemory } = require("./services/vector.service");

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:5174"],
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ["polling"],
    pingInterval: 25000,
    pingTimeout: 60000
  });

  console.log("✅ Socket.IO initialized (polling only)");

  io.on("connection", (socket) => {
    console.log("🎉 CLIENT CONNECTED - Socket ID:", socket.id);
    
    socket.on("askAI", async (messagePayload) => {
      try {
        console.log("📨 Received askAI event");

        const [message, vectors] = await Promise.all([
          messageModel.create({
            chat: messagePayload.chat,
            user: socket.id,
            content: messagePayload.content,
            role: "user"
          }),
          aiService.generateVector(messagePayload.content)
        ]);

        await creatememory({
          vectors,
          messageid: message._id,
          metadata: {
            userId: socket.id,
            chatId: messagePayload.chat,
            text: messagePayload.content
          }
        });

        const [memory, chatHistory] = await Promise.all([
          querymemory({
            queryVector: vectors,
            limit: 3,
            metadata: { user: socket.id }
          }),
          messageModel
            .find({ chat: messagePayload.chat })
            .sort({ createdAt: -1 })
            .limit(25)
            .lean()
            .then((messages) => messages.reverse())
        ]);

        const stm = chatHistory.map((item) => ({
          role: item.role,
          parts: [item.content]
        }));

        const memoryText = memory
          .map((m) => {
            try {
              return m.metadata?.text || "";
            } catch (e) {
              return "";
            }
          })
          .filter(Boolean)
          .join(" ||| ");

        const ltm = [
          {
            role: "system",
            parts: [
              {
                text: `these are the relevant pieces of past conversation memory between the user and the AI model to help provide contextually relevant responses: ${memoryText}`
              }
            ]
          }
        ];

        const response = await aiService.generateResponse([...ltm, ...stm]);

        console.log("📤 Sending AI response");
        socket.emit("aiResponse", {
          content: response,
          chat: messagePayload.chat
        });

        const [responseMessage, responseVectors] = await Promise.all([
          messageModel.create({
            chat: messagePayload.chat,
            user: socket.id,
            content: response,
            role: "model"
          }),
          aiService.generateVector(response)
        ]);

        await creatememory({
          vectors: responseVectors,
          messageid: responseMessage._id,
          metadata: {
            userId: socket.id,
            chatId: messagePayload.chat,
            text: response
          }
        });
      } catch (error) {
        console.error("❌ Error:", error.message);
        socket.emit("aiError", {
          message: error.message || "Failed to generate AI response",
          chat: messagePayload.chat
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("👋 CLIENT DISCONNECTED - Socket ID:", socket.id);
    });
  });

  return io;
}

module.exports = initSocketServer;
