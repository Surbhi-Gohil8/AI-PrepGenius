"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractResumeText = exports.extractTextFromDOCX = exports.extractTextFromPDF = void 0;
const fs_1 = __importDefault(require("fs"));
const pdf_parse_1 = require("pdf-parse");
const mammoth_1 = __importDefault(require("mammoth"));
const extractTextFromPDF = async (filePath) => {
    const dataBuffer = fs_1.default.readFileSync(filePath);
    const parser = new pdf_parse_1.PDFParse({ data: dataBuffer });
    try {
        const result = await parser.getText();
        const text = result.text || '';
        if (!text.trim()) {
            throw new Error('PDF appears to be image-based or contains no extractable text. Please upload a text-based PDF.');
        }
        return text;
    }
    catch (error) {
        throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
    finally {
        await parser.destroy();
    }
};
exports.extractTextFromPDF = extractTextFromPDF;
const extractTextFromDOCX = async (filePath) => {
    try {
        const dataBuffer = fs_1.default.readFileSync(filePath);
        const result = await mammoth_1.default.extractRawText({ buffer: dataBuffer });
        return result.value || '';
    }
    catch (error) {
        throw new Error(`Failed to extract text from DOCX: ${error.message}`);
    }
};
exports.extractTextFromDOCX = extractTextFromDOCX;
const extractResumeText = async (filePath, mimetype) => {
    if (mimetype === 'application/pdf' || filePath.endsWith('.pdf')) {
        return (0, exports.extractTextFromPDF)(filePath);
    }
    else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimetype === 'application/msword' ||
        filePath.endsWith('.docx') ||
        filePath.endsWith('.doc')) {
        return (0, exports.extractTextFromDOCX)(filePath);
    }
    else {
        throw new Error(`Unsupported resume file type: ${mimetype}`);
    }
};
exports.extractResumeText = extractResumeText;
