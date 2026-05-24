import mongoose, { Schema, Document as DocType } from "mongoose";

export interface IDocument extends DocType {
  userId: string;
  title: string;
  docId: string;
  content: string;
}

const DocumentSchema = new Schema({
  userId: { type: String, required: true },
  title: { type: String, default: "Untitled Document" },
  docId: { type: String, required: true, unique: true },
  content: { type: String, default: "" },
});

export const DocumentModel = mongoose.model<IDocument>(
  "Document",
  DocumentSchema,
);
