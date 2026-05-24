import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name?: string;
  email: string;
  password?: string;
  otp?: string;
  otpExpiry?: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: false, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: false, trim: true },
    otp: { type: String },
    otpExpiry: { type: Date },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);