"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const Document_1 = require("../models/Document");
const router = express_1.default.Router();
router.get("/", auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        console.log("Checking User", req.user.userId);
        const documents = await Document_1.DocumentModel.find({
            userId: req.user.userId,
        });
        res.status(200).json({ documents });
    }
    catch {
        console.log("err");
    }
});
// Delete API
router.delete("/:docId", auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const { docId } = req.params;
        const document = await Document_1.DocumentModel.findOneAndDelete({ docId });
        console.log(document);
        if (!document)
            return res.status(400).json({ message: "Failed to delete the document" });
        return res.status(200).json({ message: "document deleted successfully" });
    }
    catch {
        return res.status(400).json({ message: "Failed to delete the document" });
    }
});
router.patch("/update/:docId", auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const { docId } = req.params;
        const { title } = req.body;
        const document = await Document_1.DocumentModel.findOneAndUpdate({ docId }, { title });
        console.log("document", document);
        if (!document)
            return res.status(400).json({ message: "Invalid Error" });
        return res
            .status(200)
            .json({ message: "Document title updated successfully" });
    }
    catch {
        return res.status(400).json({ message: "Failed to update title" });
    }
});
exports.default = router;
