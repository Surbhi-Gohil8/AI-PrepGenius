"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resumeUpload = exports.audioUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Ensure upload directories exist
const audioDir = path_1.default.join(__dirname, '../../uploads/audio');
const resumeDir = path_1.default.join(__dirname, '../../uploads/resumes');
if (!fs_1.default.existsSync(audioDir)) {
    fs_1.default.mkdirSync(audioDir, { recursive: true });
}
if (!fs_1.default.existsSync(resumeDir)) {
    fs_1.default.mkdirSync(resumeDir, { recursive: true });
}
// Storage configurations
const audioStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, audioDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `audio-${uniqueSuffix}${path_1.default.extname(file.originalname)}`);
    }
});
const resumeStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, resumeDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `resume-${uniqueSuffix}${path_1.default.extname(file.originalname)}`);
    }
});
// File filters
const audioFileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['audio/webm', 'audio/mp4', 'audio/wav', 'audio/mpeg', 'audio/ogg', 'audio/x-wav', 'video/webm'];
    if (allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('audio/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid audio format. Allowed types: webm, mp4, wav'), false);
    }
};
const resumeFileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword'
    ];
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    if (allowedMimeTypes.includes(file.mimetype) || ext === '.pdf' || ext === '.docx') {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid document format. Only PDF and DOCX are allowed.'), false);
    }
};
// Export middleware instances
exports.audioUpload = (0, multer_1.default)({
    storage: audioStorage,
    fileFilter: audioFileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});
exports.resumeUpload = (0, multer_1.default)({
    storage: resumeStorage,
    fileFilter: resumeFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});
