import mongoose from "mongoose";

export default async function connectToDatabase(): Promise<void> {
  const mongoURI = process.env.MONGODB_URI || "mongodb://db:27017/loganalyzer";
  console.log("Connecting to MongoDB ....");
  console.log(mongoURI);

  try {
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}

