import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT;
const ORIGIN = process.env.ORIGIN;

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: JSON.parse(ORIGIN),
  },
});

io.on("connection", (socket) => {
  socket.emit("currentUser", socket.id);
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit("userJoined", socket.id);
    const users = io.sockets.adapter.rooms.get(roomId);
    const remoteUsers = [];

    for (const u of users) {
      if (u !== socket.id) {
        remoteUsers.push(u);
      }
    }
    socket.emit("remoteUsers", remoteUsers);
  });

  socket.on("offer", (payload) => {
    io.to(payload.to).emit("offer", payload);
  });

  socket.on("answer", (payload) => {
    io.to(payload.to).emit("answer", payload);
  });

  socket.on("ice-candidate", (payload) => {
    io.to(payload.to).emit("ice-candidate", payload);
  });

  socket.on("remote-mic-toggle",payload=>{
    io.to(payload.to).emit("remote-mic-toggle",payload)
  })
  socket.on("remote-cam-toggle",payload=>{
    io.to(payload.to).emit("remote-cam-toggle",payload)
  })
  socket.on("call-end",payload=>{
    io.to(payload.to).emit("call-end",payload)
  })
  socket.on("disconnecting", () => {
    socket.broadcast.emit("userDisconnected", socket.id);
  });
});

httpServer.listen(PORT, () => console.log(`Listening on port ${PORT}`));
