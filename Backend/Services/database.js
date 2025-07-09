import mongoose from "mongoose";
import config from "../config.js";

const { mongo_uri } = config;

export const ConnectToDB = async () => {
    try {
        let connectionUri = mongo_uri;
        if (mongo_uri && mongo_uri.endsWith('mongodb.net/')) {
            connectionUri = mongo_uri + 'ganesh-embroidery';
        }
        
        await mongoose.connect(connectionUri, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            minPoolSize: 5,
        });
        
        console.log("Connected to Database successfully");
    } catch (err) {
        console.error("Error connecting to Database:", err);
        process.exit(1);
    }
};