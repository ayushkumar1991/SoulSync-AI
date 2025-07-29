"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const activityController_1 = require("../controllers/activityController");
const router = express_1.default.Router();
// All routes are protected with authentication
router.use(auth_1.auth);
// Log a new activity
router.post("/", activityController_1.logActivity);
exports.default = router;
