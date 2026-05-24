"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        // 1. Check token exists
        if (!authHeader) {
            return res.status(401).json({ message: "No Token Provided" });
        }
        // 2. Extract token
        const token = authHeader.split(" ")[1];
        // 3. Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
        // 4. attach User to request
        req.user = decoded;
        next(); // move to next
    }
    catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};
exports.authMiddleware = authMiddleware;
