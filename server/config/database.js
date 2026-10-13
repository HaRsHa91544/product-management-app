import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const { MONGO_DB_URI } = process.env;

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_DB_URI);
        console.log('Connected to the MongoDB Cluster!');
    } catch (error) {
        console.log('Error occurred while connecting to dB, ', error);
        process.exit(1);
    }
};

export default connectDB;