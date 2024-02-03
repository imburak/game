import http from "http";
import { Server } from "socket.io";
import express from "express";
import cors from "cors";

const app = express();

app.use(cors());

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("connected");
});

httpServer.listen(4001);
