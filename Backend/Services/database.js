import mongoose from "mongoose";
import config from "../config.js";

const { mongo_uri } = config;

export const ConnectToDB = () => {
    mongoose
        .connect(mongo_uri)
        .then(() => {
            console.log("Connected to Database successfully");
        })
        .catch((err) => {
            console.error("Error connecting to Database:", err);
        });

};