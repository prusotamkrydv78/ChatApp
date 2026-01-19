import mongoose from "mongoose";
const MONGO_URI = process.env.MONGO_URI;
const connectDb = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error("Please provide MONGO_URI in the environment variables");
    }

    const conn = await mongoose.connect(MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("!! MongoDB connection error", error);
    process.exit(1);
  }
};

export default connectDb;
