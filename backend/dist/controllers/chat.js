"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChatHistory = exports.getChatSession = exports.getSessionHistory = exports.sendMessage = exports.createChatSession = void 0;
const ChatSession_1 = require("../models/ChatSession");
const generative_ai_1 = require("@google/generative-ai");
const uuid_1 = require("uuid");
const logger_1 = require("../utils/logger");
const client_1 = require("../inngest/client");
const User_1 = require("../models/User");
const mongoose_1 = require("mongoose");
// Initialize Gemini API
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyBCBz3wQu9Jjd_icCDZf-17CUO_O8IynwI");
// Create a new chat session
const createChatSession = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user || !req.user.id) {
            return res
                .status(401)
                .json({ message: "Unauthorized - User not authenticated" });
        }
        const userId = new mongoose_1.Types.ObjectId(req.user.id);
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Generate a unique sessionId
        const sessionId = (0, uuid_1.v4)();
        const session = new ChatSession_1.ChatSession({
            sessionId,
            userId,
            startTime: new Date(),
            status: "active",
            messages: [],
        });
        await session.save();
        res.status(201).json({
            message: "Chat session created successfully",
            sessionId: session.sessionId,
        });
    }
    catch (error) {
        logger_1.logger.error("Error creating chat session:", error);
        res.status(500).json({
            message: "Error creating chat session",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.createChatSession = createChatSession;
// Send a message in the chat session
const sendMessage = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { message } = req.body;
        const userId = new mongoose_1.Types.ObjectId(req.user.id);
        logger_1.logger.info("Processing message:", { sessionId, message });
        // Find session by sessionId
        const session = await ChatSession_1.ChatSession.findOne({ sessionId });
        if (!session) {
            logger_1.logger.warn("Session not found:", { sessionId });
            return res.status(404).json({ message: "Session not found" });
        }
        if (session.userId.toString() !== userId.toString()) {
            logger_1.logger.warn("Unauthorized access attempt:", { sessionId, userId });
            return res.status(403).json({ message: "Unauthorized" });
        }
        // Create Inngest event for message processing
        const event = {
            name: "therapy/session.message",
            data: {
                message,
                history: session.messages,
                memory: {
                    userProfile: {
                        emotionalState: [],
                        riskLevel: 0,
                        preferences: {},
                    },
                    sessionContext: {
                        conversationThemes: [],
                        currentTechnique: null,
                    },
                },
                goals: [],
                systemPrompt: `You are an AI therapist assistant. Your role is to:
        1. Provide empathetic and supportive responses
        2. Use evidence-based therapeutic techniques
        3. Maintain professional boundaries
        4. Monitor for risk factors
        5. Guide users toward their therapeutic goals`,
            },
        };
        logger_1.logger.info("Sending message to Inngest:", { event });
        // Send event to Inngest for logging and analytics
        await client_1.inngest.send(event);
        // Process the message directly using Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        // Analyze the message
        const analysisPrompt = `Analyze this therapy message and provide insights. Return ONLY a valid JSON object with no markdown formatting or additional text.
    Message: ${message}
    Context: ${JSON.stringify({
            memory: event.data.memory,
            goals: event.data.goals,
        })}
    
    Required JSON structure:
    {
      "emotionalState": "string",
      "themes": ["string"],
      "riskLevel": number,
      "recommendedApproach": "string",
      "progressIndicators": ["string"]
    }`;
        const analysisResult = await model.generateContent(analysisPrompt);
        const analysisText = analysisResult.response.text().trim();
        const cleanAnalysisText = analysisText
            .replace(/```json\n|\n```/g, "")
            .trim();
        const analysis = JSON.parse(cleanAnalysisText);
        logger_1.logger.info("Message analysis:", analysis);
        // Generate therapeutic response
        const responsePrompt = `${event.data.systemPrompt}
    
    Based on the following context, generate a therapeutic response:
    Message: ${message}
    Analysis: ${JSON.stringify(analysis)}
    Memory: ${JSON.stringify(event.data.memory)}
    Goals: ${JSON.stringify(event.data.goals)}
    
    Provide a response that:
    1. Addresses the immediate emotional needs
    2. Uses appropriate therapeutic techniques
    3. Shows empathy and understanding
    4. Maintains professional boundaries
    5. Considers safety and well-being`;
        const responseResult = await model.generateContent(responsePrompt);
        const response = responseResult.response.text().trim();
        logger_1.logger.info("Generated response:", response);
        // Add message to session history
        session.messages.push({
            role: "user",
            content: message,
            timestamp: new Date(),
        });
        session.messages.push({
            role: "assistant",
            content: response,
            timestamp: new Date(),
            metadata: {
                analysis,
                progress: {
                    emotionalState: analysis.emotionalState,
                    riskLevel: analysis.riskLevel,
                },
            },
        });
        // Save the updated session
        await session.save();
        logger_1.logger.info("Session updated successfully:", { sessionId });
        // Return the response
        res.json({
            response,
            message: response,
            analysis,
            metadata: {
                progress: {
                    emotionalState: analysis.emotionalState,
                    riskLevel: analysis.riskLevel,
                },
            },
        });
    }
    catch (error) {
        logger_1.logger.error("Error in sendMessage:", error);
        res.status(500).json({
            message: "Error processing message",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.sendMessage = sendMessage;
// Get chat session history
const getSessionHistory = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = new mongoose_1.Types.ObjectId(req.user.id);
        const session = (await ChatSession_1.ChatSession.findById(sessionId).exec());
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }
        if (session.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        res.json({
            messages: session.messages,
            startTime: session.startTime,
            status: session.status,
        });
    }
    catch (error) {
        logger_1.logger.error("Error fetching session history:", error);
        res.status(500).json({ message: "Error fetching session history" });
    }
};
exports.getSessionHistory = getSessionHistory;
const getChatSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        logger_1.logger.info(`Getting chat session: ${sessionId}`);
        const chatSession = await ChatSession_1.ChatSession.findOne({ sessionId });
        if (!chatSession) {
            logger_1.logger.warn(`Chat session not found: ${sessionId}`);
            return res.status(404).json({ error: "Chat session not found" });
        }
        logger_1.logger.info(`Found chat session: ${sessionId}`);
        res.json(chatSession);
    }
    catch (error) {
        logger_1.logger.error("Failed to get chat session:", error);
        res.status(500).json({ error: "Failed to get chat session" });
    }
};
exports.getChatSession = getChatSession;
const getChatHistory = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = new mongoose_1.Types.ObjectId(req.user.id);
        // Find session by sessionId instead of _id
        const session = await ChatSession_1.ChatSession.findOne({ sessionId });
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }
        if (session.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        res.json(session.messages);
    }
    catch (error) {
        logger_1.logger.error("Error fetching chat history:", error);
        res.status(500).json({ message: "Error fetching chat history" });
    }
};
exports.getChatHistory = getChatHistory;
