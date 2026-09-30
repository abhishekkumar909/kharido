import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("MONGODB connection successfully");
    } catch (error) {
        console.error(`mongodb connection failed ${error}`);
        throw error;
    }
};

export default connectDB;