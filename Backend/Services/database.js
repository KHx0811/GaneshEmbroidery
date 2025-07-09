import mongoose from "mongoose";
import config from "../config.js";

const { mongo_uri } = config;

export const ConnectToDB = async () => {
    try {
        console.log("Attempting to connect to MongoDB...");
        console.log("MongoDB URI:", mongo_uri ? "URI is set" : "URI is missing");
        
        await mongoose.connect(mongo_uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000, // 30 seconds
            socketTimeoutMS: 45000, // 45 seconds
            bufferMaxEntries: 0,
            maxPoolSize: 10,
            minPoolSize: 5,
        });
        
        console.log("Connected to Database successfully");
    } catch (err) {
        console.error("Error connecting to Database:", err);
        console.error("MongoDB URI being used:", mongo_uri);
        process.exit(1); // Exit the process if database connection fails
    }
};