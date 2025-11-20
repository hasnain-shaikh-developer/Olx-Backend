import { Server } from "socket.io";

let io;

export default function handler(req, res) {
  if (!io) {
    // Create serverless socket instance
    io = new Server(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
      transports: ["websocket", "polling"]
    });

    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      socket.on("join_chat", (roomId) => {
        socket.join(roomId);
      });

      socket.on("send_message", (msg) => {
        io.to(msg.chatId).emit("receive_message", msg);
      });

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });

    res.socket.server.io = io;
  }

  res.end();
}
