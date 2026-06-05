import { Types } from 'mongoose';

export interface ResumeData {
  rawText: string;
  skills: string[];
  experienceLevel: 'Junior' | 'Mid' | 'Senior';
  yearsOfExperience: number;
  detectedDomains: string[];
  projects: string[];
  previousRoles: string[];
  education: string;
  uploadedAt: Date;
}

export interface ATSIssue {
  category: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
}

export interface ATSAnalysis {
  score: number;
  summary: string;
  strengths: string[];
  issues: ATSIssue[];
  improvements: string[];
  keywordsFound: string[];
  keywordsMissing: string[];
}

export interface GeneratedQuestion {
  id: string;
  question: string;
  context: string;
  expectedTopics: string[];
  difficulty: string;
}

export interface Answer {
  questionId: string;
  question: string;
  context: string;
  transcript: string;
  followUpQuestion: string;
  scores: {
    technicalAccuracy: number;
    communicationClarity: number;
    problemSolvingApproach: number;
    confidenceAndStructure: number;
    overallScore: number;
  };
  feedback: {
    technicalAccuracy: string;
    communicationClarity: string;
    problemSolvingApproach: string;
    confidenceAndStructure: string;
    summary: string;
  };
  suggestedAnswer?: string;
  keyPoints?: string[];
}

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  resumeData?: ResumeData | null;
  createdAt: Date;
}

export interface ISession {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  domain: string;
  difficulty: string;
  resumeSnapshot: string;
  generatedQuestions: GeneratedQuestion[];
  answers: Answer[];
  overallScore: number;
  resumeMatchScore: number;
  resumeMatchAnalysis: string;
  resumeTips: string[];
  status: 'ongoing' | 'completed';
  createdAt: Date;
  completedAt?: Date;
}
