import mongoose from "mongoose";

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("DB connected successfully");
  } catch (error) {
    console.log("DB connection error", error);
  }
}
