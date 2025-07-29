"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chat_1 = require("../controllers/chat");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Apply auth middleware to all routes
router.use(auth_1.auth);
// Create a new chat session
router.post("/sessions", chat_1.createChatSession);
// Get a specific chat session
router.get("/sessions/:sessionId", chat_1.getChatSession);
// Send a message in a chat session
router.post("/sessions/:sessionId/messages", chat_1.sendMessage);
// Get chat history for a session
router.get("/sessions/:sessionId/history", chat_1.getChatHistory);
exports.default = router;
// let response = pm.response.json()
// pm.globals.set("access_token", response.access_token)
