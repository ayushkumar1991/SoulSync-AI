"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatSession = void 0;
const mongoose_1 = require("mongoose");
const chatMessageSchema = new mongoose_1.Schema({
    role: { type: String, required: true, enum: ["user", "assistant"] },
    content: { type: String, required: true },
    timestamp: { type: Date, required: true },
    metadata: {
        analysis: mongoose_1.Schema.Types.Mixed,
        currentGoal: String,
        progress: {
            emotionalState: String,
            riskLevel: Number,
        },
    },
});
const chatSessionSchema = new mongoose_1.Schema({
    sessionId: { type: String, required: true, unique: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    startTime: { type: Date, required: true },
    status: {
        type: String,
        required: true,
        enum: ["active", "completed", "archived"],
    },
    messages: [chatMessageSchema],
});
exports.ChatSession = (0, mongoose_1.model)("ChatSession", chatSessionSchema);
