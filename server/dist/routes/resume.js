"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const resumeController_1 = require("../controllers/resumeController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const uploadMiddleware_1 = require("../middleware/uploadMiddleware");
const router = (0, express_1.Router)();
router.post('/upload', authMiddleware_1.authMiddleware, (req, res, next) => {
    uploadMiddleware_1.resumeUpload.single('resume')(req, res, (err) => {
        if (err) {
            console.error('[resume/upload] Multer error:', err.message, '| code:', err.code);
            res.status(400).json({ message: err.message, code: err.code });
            return;
        }
        if (!req.file) {
            console.error('[resume/upload] req.file is undefined. Content-Type received:', req.headers['content-type']);
            res.status(400).json({ message: 'No resume file received by the server. Ensure the file field is named "resume" and Content-Type is multipart/form-data.' });
            return;
        }
        console.log('[resume/upload] File received:', req.file.originalname, '| mimetype:', req.file.mimetype, '| size:', req.file.size);
        next();
    });
}, resumeController_1.uploadResume);
router.post('/ats-analyze', authMiddleware_1.authMiddleware, resumeController_1.analyzeResumeATSHandler);
router.get('/me', authMiddleware_1.authMiddleware, resumeController_1.getResume);
router.delete('/me', authMiddleware_1.authMiddleware, resumeController_1.deleteResume);
exports.default = router;
