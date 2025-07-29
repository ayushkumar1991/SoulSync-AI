"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMood = void 0;
const Mood_1 = require("../models/Mood");
const logger_1 = require("../utils/logger");
const inngestEvents_1 = require("../utils/inngestEvents");
// Create a new mood entry
const createMood = async (req, res, next) => {
    try {
        const { score, note, context, activities } = req.body;
        const userId = req.user?._id; // From auth middleware
        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        const mood = new Mood_1.Mood({
            userId,
            score,
            note,
            context,
            activities,
            timestamp: new Date(),
        });
        await mood.save();
        logger_1.logger.info(`Mood entry created for user ${userId}`);
        // Send mood update event to Inngest
        await (0, inngestEvents_1.sendMoodUpdateEvent)({
            userId,
            mood: score,
            note,
            context,
            activities,
            timestamp: mood.timestamp,
        });
        res.status(201).json({
            success: true,
            data: mood,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createMood = createMood;
