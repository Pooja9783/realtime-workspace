"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const db_1 = require("./config/db");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const auth_middleware_1 = require("./middleware/auth.middleware");
const Document_1 = require("./models/Document");
const documents_routes_1 = __importDefault(require("./routes/documents.routes"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
    },
});
app.use((req, res, next) => {
    console.log("BODY CHECK:", req.body);
    next();
});
app.get("/protected", auth_middleware_1.authMiddleware, (req, res) => {
    res.json({ message: "Protect Route accessed", user: req.user });
});
app.get("/heath-check", (req, res) => {
    return res.status(200).json({ message: "Health Checking" });
});
app.use("/api/auth", auth_routes_1.default);
app.use("/api/documents", documents_routes_1.default);
(0, db_1.connectDB)();
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log("Server is running on", PORT);
});
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token)
        return next(new Error("Token is not provided"));
    try {
        const decode = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
        socket.user = decode;
        next();
    }
    catch {
        console.log("Token is not provided");
    }
});
io.on("connection", (socket) => {
    console.log("User connected", socket.id);
    socket.on("join_document", async ({ userId, docId }) => {
        socket.join(docId);
        const document = await Document_1.DocumentModel.findOneAndUpdate({ docId }, { $setOnInsert: { userId, docId, content: "" } }, { new: true, upsert: true });
        socket.emit("load_document", document.content);
    });
    socket.on("send_changes", ({ docId, content }) => {
        socket.to(docId).emit("receive_changes", content);
    });
    socket.on("save_document", async ({ docId, content }) => {
        await Document_1.DocumentModel.findOneAndUpdate({ docId }, { content }, { upsert: true });
        console.log("Document saved:", content);
    });
});
