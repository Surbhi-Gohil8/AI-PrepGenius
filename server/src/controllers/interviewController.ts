import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Session } from '../models/Session';
import { User } from '../models/User';
import * as groqService from '../services/groqService';

export const startSession = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const user = await User.findById(req.user.id);
    if (!user || !user.resumeData) {
      res.status(400).json({ message: 'Please upload a resume first to start the interview setup.' });
      return;
    }

    const session = new Session({
      userId: req.user.id,
      domain,
      difficulty,
      resumeSnapshot: user.resumeData.rawText,
      status: 'ongoing'
    });

    await session.save();

    res.status(201).json(session);
  } catch (error: any) {
    console.error('Start Session Error:', error);
    res.status(500).json({ message: 'Server error starting session.', error: error.message });
  }
};

export const generateQuestions = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const user = await User.findById(req.user.id);
    if (!user || !user.resumeData) {
      res.status(400).json({ message: 'Resume data not found for user.' });
      return;
    }

    const session = await Session.findOne({ _id: sessionId, userId: req.user.id });
    if (!session) {
      res.status(404).json({ message: 'Interview session not found or access denied.' });
      return;
    }

    // Generate questions using Groq llama3
    const questions = await groqService.generateResumeQuestions(
      user.resumeData as any,
      domain,
      difficulty
    );

    session.generatedQuestions = questions as any;
    await session.save();

    res.status(200).json(questions);
  } catch (error: any) {
    console.error('Generate Questions Controller Error:', error);
    res.status(500).json({ message: 'Server error generating questions.', error: error.message });
  }
};

export const getSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized.' });
      return;
    }

    const session = await Session.findOne({ _id: id, userId: req.user.id });
    if (!session) {
      res.status(404).json({ message: 'Session not found or access denied.' });
      return;
    }

    res.status(200).json(session);
  } catch (error: any) {
    console.error('Get Session Error:', error);
    res.status(500).json({ message: 'Server error retrieving session details.', error: error.message });
  }
};

export const completeSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized.' });
      return;
    }

    const session = await Session.findOne({ _id: id, userId: req.user.id });
    if (!session) {
      res.status(404).json({ message: 'Session not found or access denied.' });
      return;
    }

    if (session.status === 'completed') {
      res.status(200).json(session);
      return;
    }

    const user = await User.findById(req.user.id);
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
    const matchResults = await groqService.calculateResumeMatch(
      user.resumeData as any,
      session.answers as any
    );

    // 3. Generate tips
    const tips = await groqService.generateResumeTips(
      user.resumeData as any,
      session.answers as any
    );

    // 4. Generate ideal answers for learning
    try {
      const suggestedMap = await groqService.generateSuggestedAnswers(
        session.answers as any,
        session.domain,
        session.difficulty,
        user.resumeData as any
      );
      for (const ans of session.answers) {
        const suggested = suggestedMap[ans.questionId];
        if (suggested) {
          ans.suggestedAnswer = suggested.suggestedAnswer;
          ans.keyPoints = suggested.keyPoints;
        }
      }
      session.markModified('answers');
    } catch (suggestedErr) {
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
  } catch (error: any) {
    console.error('Complete Session Error:', error);
    res.status(500).json({ message: 'Server error completing session.', error: error.message });
  }
};

export const generateSuggestedAnswers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized.' });
      return;
    }

    const session = await Session.findOne({ _id: id, userId: req.user.id });
    if (!session) {
      res.status(404).json({ message: 'Session not found.' });
      return;
    }

    if (session.answers.length === 0) {
      res.status(400).json({ message: 'No answers to generate suggestions for.' });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user?.resumeData) {
      res.status(400).json({ message: 'Resume data required.' });
      return;
    }

    const suggestedMap = await groqService.generateSuggestedAnswers(
      session.answers as any,
      session.domain,
      session.difficulty,
      user.resumeData as any
    );

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
  } catch (error: any) {
    console.error('Generate Suggested Answers Error:', error);
    res.status(500).json({ message: error.message || 'Failed to generate suggested answers.' });
  }
};

export const getHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized.' });
      return;
    }

    const history = await Session.find({ userId: req.user.id, status: 'completed' })
      .sort({ createdAt: -1 });

    res.status(200).json(history);
  } catch (error: any) {
    console.error('Get History Error:', error);
    res.status(500).json({ message: 'Server error retrieving history.', error: error.message });
  }
};
