import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Session } from '../models/Session';
import { User } from '../models/User';
import * as groqService from '../services/groqService';

export const transcribeResponse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No audio response file uploaded.' });
      return;
    }

    const { questionId, sessionId } = req.body;
    if (!questionId || !sessionId) {
      res.status(400).json({ message: 'questionId and sessionId are required.' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized.' });
      return;
    }

    // 1. Fetch Session
    const session = await Session.findOne({ _id: sessionId, userId: req.user.id });
    if (!session) {
      res.status(404).json({ message: 'Interview session not found or access denied.' });
      return;
    }

    // Find the corresponding generated question
    const questionObj = session.generatedQuestions.find(q => q.id === questionId);
    if (!questionObj) {
      res.status(404).json({ message: 'Question not found in this session.' });
      return;
    }

    // 2. Fetch User Resume context
    const user = await User.findById(req.user.id);
    if (!user || !user.resumeData) {
      res.status(400).json({ message: 'User resume data not found.' });
      return;
    }

    const filePath = req.file.path;

    // 3. Transcribe Audio (Whisper v3)
    const transcriptText = await groqService.transcribeAudio(filePath);

    if (!transcriptText || !transcriptText.trim()) {
      res.status(400).json({ message: 'Could not hear any response. Please try recording again.' });
      return;
    }

    // 4. Score Answer (llama3-70b-8192)
    const scoringResults = await groqService.scoreAnswer(
      questionObj.question,
      transcriptText,
      user.resumeData as any
    );

    // 5. Generate Follow Up (llama3-70b-8192)
    const followUpQuestionText = await groqService.generateFollowUp(
      questionObj.question,
      transcriptText,
      user.resumeData as any
    );

    // 6. Save Answer
    const answerIndex = session.answers.findIndex(ans => ans.questionId === questionId);
    
    const answerData = {
      questionId,
      question: questionObj.question,
      context: questionObj.context,
      transcript: transcriptText,
      followUpQuestion: followUpQuestionText,
      scores: {
        technicalAccuracy: scoringResults.scores?.technicalAccuracy || 0,
        communicationClarity: scoringResults.scores?.communicationClarity || 0,
        problemSolvingApproach: scoringResults.scores?.problemSolvingApproach || 0,
        confidenceAndStructure: scoringResults.scores?.confidenceAndStructure || 0,
        overallScore: scoringResults.scores?.overallScore || 0
      },
      feedback: {
        technicalAccuracy: scoringResults.feedback?.technicalAccuracy || '',
        communicationClarity: scoringResults.feedback?.communicationClarity || '',
        problemSolvingApproach: scoringResults.feedback?.problemSolvingApproach || '',
        confidenceAndStructure: scoringResults.feedback?.confidenceAndStructure || '',
        summary: scoringResults.feedback?.summary || ''
      }
    };

    if (answerIndex > -1) {
      session.answers[answerIndex] = answerData as any;
    } else {
      session.answers.push(answerData as any);
    }

    await session.save();

    res.status(200).json({
      message: 'Audio transcript parsed and scored successfully.',
      answer: answerData
    });
  } catch (error: any) {
    console.error('Transcribe Audio Controller Error:', error);
    res.status(500).json({ message: 'Server error transcribing response.', error: error.message });
  }
};
