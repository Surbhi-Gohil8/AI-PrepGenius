"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const uploadMiddleware_1 = require("../middleware/uploadMiddleware");
const router = (0, express_1.Router)();
// Wait, let's look at where we defined the handler. It was inside controllers/transcribeController.ts as transcribeResponse!
// Let's import it from transcribeController.
const transcribeController_1 = require("../controllers/transcribeController");
router.post('/', authMiddleware_1.authMiddleware, uploadMiddleware_1.audioUpload.single('audio'), transcribeController_1.transcribeResponse);
exports.default = router;
