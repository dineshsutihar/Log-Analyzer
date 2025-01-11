import mongoose from "mongoose";


export default function connectToDatabase() {
  const mongoURI = process.env.MONGODB_URI || "mongodb://db:27017/loganalyzer";
  console.log("Connecting to MongoDB ....");
  console.log(mongoURI);
  mongoose.connect(mongoURI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));
}
