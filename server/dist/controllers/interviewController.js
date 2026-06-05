"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHistory = exports.generateSuggestedAnswers = exports.completeSession = exports.getSession = exports.generateQuestions = exports.startSession = void 0;
const Session_1 = require("../models/Session");
const User_1 = require("../models/User");
const groqService = __importStar(require("../services/groqService"));
const startSession = async (req, res) => {
    try {
        const { domain, difficulty } = req.body;
        if (!domain || !difficulty) {
            res.status(400).json({ message: 'Domain and difficulty are required.' });
            return;
        }
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized.' });
            return;
        }
        const user = await User_1.User.findById(req.user.id);
        if (!user || !user.resumeData) {
            res.status(400).json({ message: 'Please upload a resume first to start the interview setup.' });
            return;
        }
        const session = new Session_1.Session({
            userId: req.user.id,
            domain,
            difficulty,
            resumeSnapshot: user.resumeData.rawText,
            status: 'ongoing'
        });
        await session.save();
        res.status(201).json(session);
    }
    catch (error) {
        console.error('Start Session Error:', error);
        res.status(500).json({ message: 'Server error starting session.', error: error.message });
    }
};
exports.startSession = startSession;
const generateQuestions = async (req, res) => {
    try {
        const { domain, difficulty, sessionId } = req.body;
        if (!domain || !difficulty || !sessionId) {
            res.status(400).json({ message: 'Domain, difficulty, and sessionId are required.' });
            return;
        }
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized.' });
            return;
        }
        const user = await User_1.User.findById(req.user.id);
        if (!user || !user.resumeData) {
            res.status(400).json({ message: 'Resume data not found for user.' });
            return;
        }
        const session = await Session_1.Session.findOne({ _id: sessionId, userId: req.user.id });
        if (!session) {
            res.status(404).json({ message: 'Interview session not found or access denied.' });
            return;
        }
        // Generate questions using Groq llama3
        const questions = await groqService.generateResumeQuestions(user.resumeData, domain, difficulty);
        session.generatedQuestions = questions;
        await session.save();
        res.status(200).json(questions);
    }
    catch (error) {
        console.error('Generate Questions Controller Error:', error);
        res.status(500).json({ message: 'Server error generating questions.', error: error.message });
    }
};
exports.generateQuestions = generateQuestions;
const getSession = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized.' });
            return;
        }
        const session = await Session_1.Session.findOne({ _id: id, userId: req.user.id });
        if (!session) {
            res.status(404).json({ message: 'Session not found or access denied.' });
            return;
        }
        res.status(200).json(session);
    }
    catch (error) {
        console.error('Get Session Error:', error);
        res.status(500).json({ message: 'Server error retrieving session details.', error: error.message });
    }
};
exports.getSession = getSession;
const completeSession = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized.' });
            return;
        }
        const session = await Session_1.Session.findOne({ _id: id, userId: req.user.id });
        if (!session) {
            res.status(404).json({ message: 'Session not found or access denied.' });
            return;
        }
        if (session.status === 'completed') {
            res.status(200).json(session);
            return;
        }
        const user = await User_1.User.findById(req.user.id);
        if (!user || !user.resumeData) {
            res.status(400).json({ message: 'User resume data not found.' });
            return;
        }
        // 1. Calculate overall score
        let overallScore = 0;
        if (session.answers.length > 0) {
            const sum = session.answers.reduce((acc, ans) => acc + (ans.scores?.overallScore || 0), 0);
            overallScore = Math.round((sum / session.answers.length) * 10) / 10;
        }
        // 2. Calculate resume match score & analysis
        const matchResults = await groqService.calculateResumeMatch(user.resumeData, session.answers);
        // 3. Generate tips
        const tips = await groqService.generateResumeTips(user.resumeData, session.answers);
        // 4. Generate ideal answers for learning
        try {
            const suggestedMap = await groqService.generateSuggestedAnswers(session.answers, session.domain, session.difficulty, user.resumeData);
            for (const ans of session.answers) {
                const suggested = suggestedMap[ans.questionId];
                if (suggested) {
                    ans.suggestedAnswer = suggested.suggestedAnswer;
                    ans.keyPoints = suggested.keyPoints;
                }
            }
            session.markModified('answers');
        }
        catch (suggestedErr) {
            console.error('Suggested answers generation skipped:', suggestedErr);
        }
        session.overallScore = overallScore;
        session.resumeMatchScore = matchResults.score;
        session.resumeMatchAnalysis = matchResults.analysis;
        session.resumeTips = tips;
        session.status = 'completed';
        session.completedAt = new Date();
        await session.save();
        res.status(200).json(session);
    }
    catch (error) {
        console.error('Complete Session Error:', error);
        res.status(500).json({ message: 'Server error completing session.', error: error.message });
    }
};
exports.completeSession = completeSession;
const generateSuggestedAnswers = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized.' });
            return;
        }
        const session = await Session_1.Session.findOne({ _id: id, userId: req.user.id });
        if (!session) {
            res.status(404).json({ message: 'Session not found.' });
            return;
        }
        if (session.answers.length === 0) {
            res.status(400).json({ message: 'No answers to generate suggestions for.' });
            return;
        }
        const user = await User_1.User.findById(req.user.id);
        if (!user?.resumeData) {
            res.status(400).json({ message: 'Resume data required.' });
            return;
        }
        const suggestedMap = await groqService.generateSuggestedAnswers(session.answers, session.domain, session.difficulty, user.resumeData);
        for (const ans of session.answers) {
            const suggested = suggestedMap[ans.questionId];
            if (suggested) {
                ans.suggestedAnswer = suggested.suggestedAnswer;
                ans.keyPoints = suggested.keyPoints;
            }
        }
        session.markModified('answers');
        await session.save();
        res.status(200).json(session);
    }
    catch (error) {
        console.error('Generate Suggested Answers Error:', error);
        res.status(500).json({ message: error.message || 'Failed to generate suggested answers.' });
    }
};
exports.generateSuggestedAnswers = generateSuggestedAnswers;
const getHistory = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized.' });
            return;
        }
        const history = await Session_1.Session.find({ userId: req.user.id, status: 'completed' })
            .sort({ createdAt: -1 });
        res.status(200).json(history);
    }
    catch (error) {
        console.error('Get History Error:', error);
        res.status(500).json({ message: 'Server error retrieving history.', error: error.message });
    }
};
exports.getHistory = getHistory;
