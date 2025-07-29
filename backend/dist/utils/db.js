"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("./logger");
const MONGODB_URI = process.env.MONGODB_URI ||
    "mongodb+srv://blocklinklabs:rKjw3YwImNAzgMzU@cluster0.znbgmwt.mongodb.net/ai-therapy";
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(MONGODB_URI);
        logger_1.logger.info("Connected to MongoDB Atlas");
    }
    catch (error) {
        logger_1.logger.error("MongoDB connection error:", error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
