import express from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { DocumentModel } from "../models/Document";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    console.log("Checking User", (req as any).user.userId);

    const documents = await DocumentModel.find({
      userId: (req as any).user.userId,
    });

    res.status(200).json({ documents });
  } catch {
    console.log("err");
  }
});

// Delete API
router.delete("/:docId", authMiddleware, async (req, res) => {
  try {
    const { docId } = req.params;

    const document = await DocumentModel.findOneAndDelete({ docId });

    console.log(document);

    if (!document)
      return res.status(400).json({ message: "Failed to delete the document" });

    return res.status(200).json({ message: "document deleted successfully" });
  } catch {
    return res.status(400).json({ message: "Failed to delete the document" });
  }
});

router.patch("/update/:docId", authMiddleware, async (req, res) => {
  try {
    const { docId } = req.params;
    const { title } = req.body;

    const document = await DocumentModel.findOneAndUpdate({ docId }, { title });

    console.log("document", document);

    if (!document) return res.status(400).json({ message: "Invalid Error" });

    return res
      .status(200)
      .json({ message: "Document title updated successfully" });
  } catch {
    return res.status(400).json({ message: "Failed to update title" });
  }
});

export default router;
