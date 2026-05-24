import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/db";
import authRoute from "./routes/auth.routes";
import { authMiddleware } from "./middleware/auth.middleware";
import { DocumentModel } from "./models/Document";
import documentRoute from "./routes/documents.routes";
import jwt from "jsonwebtoken";

dotenv.config();
const app = express();
app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use((req, res, next) => {
  console.log("BODY CHECK:", req.body);
  next();
});

app.get("/protected", authMiddleware, (req, res) => {
  res.json({ message: "Protect Route accessed", user: (req as any).user });
});

app.get("/health-check", (req, res) => {
  return res.status(200).json({ message: "Health Checking" });
});

app.use("/api/auth", authRoute);
app.use("/api/documents", documentRoute);
connectDB();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("Server is running on", PORT);
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) return next(new Error("Token is not provided"));
  try {
    const decode = jwt.verify(token, process.env.SECRET_KEY as string);
    (socket as any).user = decode;
    next();
  } catch {
    console.log("Token is not provided");
  }
});

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  socket.on("join_document", async ({ userId, docId }) => {
    socket.join(docId);

    const document = await DocumentModel.findOneAndUpdate(
      { docId },
      { $setOnInsert: { userId, docId, content: "" } },
      { new: true, upsert: true },
    );

    socket.emit("load_document", document.content);
  });

  socket.on("send_changes", ({ docId, content }) => {
    socket.to(docId).emit("receive_changes", content);
  });

  socket.on("save_document", async ({ docId, content }) => {
    await DocumentModel.findOneAndUpdate(
      { docId },
      { content },
      { upsert: true },
    );

    console.log("Document saved:", content);
  });
});
