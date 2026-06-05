"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables first
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("express-async-errors"); // Handles async errors automatically
const db_1 = require("./config/db");
// Import Routes
const auth_1 = __importDefault(require("./routes/auth"));
const resume_1 = __importDefault(require("./routes/resume"));
const interview_1 = __importDefault(require("./routes/interview"));
const transcribe_1 = __importDefault(require("./routes/transcribe"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Database Connection
(0, db_1.connectDB)();
// Global Middlewares
app.use((0, cors_1.default)({
    origin: '*', // Allow all origins for dev/docker bridge networks
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve static uploads folder (if ever needed to view/retrieve uploaded resumes/audios)
app.use('/uploads', express_1.default.static('uploads'));
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});
// Mount Routes
app.use('/api/auth', auth_1.default);
app.use('/api/resume', resume_1.default);
app.use('/api/interview', interview_1.default);
app.use('/api/transcribe', transcribe_1.default);
// 404 Route handler
app.use((req, res) => {
    res.status(404).json({ message: `API route not found: ${req.method} ${req.url}` });
});
// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({
        message: err.message || 'An unexpected server error occurred.',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});
app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
