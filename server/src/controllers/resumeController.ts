import { Response } from 'express';
import fs from 'fs';
import { AuthRequest } from '../middleware/authMiddleware';
import { User } from '../models/User';
import { extractResumeText } from '../services/resumeParserService';
import { parseResume, analyzeResumeATS } from '../services/groqService';

export const uploadResume = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No resume file uploaded.' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized.' });
      return;
    }

    const filePath = req.file.path;
    const mimetype = req.file.mimetype;

    // 1. Extract raw text from file
    let rawText = '';
    try {
      rawText = await extractResumeText(filePath, mimetype);
    } catch (parseError: any) {
      const errMsg = parseError.message || 'Unknown parse error';
      console.error('Resume parse error:', errMsg);
      res.status(400).json({ message: errMsg });
      return;
    } finally {
      // Clean up uploaded resume file from uploads/resumes to keep disk clean
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    if (!rawText.trim()) {
      res.status(400).json({ message: 'Resume text content is empty or unreadable. If this is a scanned PDF, please convert it to a text-based PDF.' });
      return;
    }

    // 2. Parse text with Groq LLaMA3
    const parsedResumeData = await parseResume(rawText);

    // 3. Save parsed data to user document
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { resumeData: parsedResumeData },
      { new: true }
    );

    if (!updatedUser) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    res.status(200).json({
      message: 'Resume parsed and saved successfully.',
      resumeData: updatedUser.resumeData
    });
  } catch (error: any) {
    console.error('Resume Upload Controller Error:', error);
    res.status(500).json({ message: 'Server error processing resume.', error: error.message });
  }
};

export const getResume = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized.' });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    res.status(200).json({ resumeData: user.resumeData || null });
  } catch (error: any) {
    console.error('Get Resume Error:', error);
    res.status(500).json({ message: 'Server error fetching resume info.', error: error.message });
  }
};

export const analyzeResumeATSHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized.' });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user?.resumeData?.rawText) {
      res.status(400).json({ message: 'Upload a resume before running ATS analysis.' });
      return;
    }

    const targetRole = typeof req.body?.targetRole === 'string' ? req.body.targetRole : undefined;
    const analysis = await analyzeResumeATS(user.resumeData, targetRole);

    res.status(200).json({ analysis });
  } catch (error: any) {
    console.error('ATS Analysis Error:', error);
    res.status(500).json({ message: error.message || 'Server error during ATS analysis.' });
  }
};

export const deleteResume = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized.' });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { resumeData: null },
      { new: true }
    );

    if (!updatedUser) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    res.status(200).json({ message: 'Resume data cleared successfully.', resumeData: null });
  } catch (error: any) {
    console.error('Delete Resume Error:', error);
    res.status(500).json({ message: 'Server error clearing resume info.', error: error.message });
  }
};
