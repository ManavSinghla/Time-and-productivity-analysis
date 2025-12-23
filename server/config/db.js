import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected Successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        if (process.env.NODE_ENV !== 'production') {
            process.exit(1);
        }
    }
};

export default connectDB;
