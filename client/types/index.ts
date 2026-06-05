export interface ResumeData {
  rawText: string;
  skills: string[];
  experienceLevel: 'Junior' | 'Mid' | 'Senior';
  yearsOfExperience: number;
  detectedDomains: string[];
  projects: string[];
  previousRoles: string[];
  education: string;
  uploadedAt: string;
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
  scores: RubricScores;
  feedback: RubricFeedback;
  suggestedAnswer?: string;
  keyPoints?: string[];
}

export interface RubricScores {
  technicalAccuracy: number;
  communicationClarity: number;
  problemSolvingApproach: number;
  confidenceAndStructure: number;
  overallScore: number;
}

export interface RubricFeedback {
  technicalAccuracy: string;
  communicationClarity: string;
  problemSolvingApproach: string;
  confidenceAndStructure: string;
  summary: string;
}

export interface Session {
  _id: string;
  domain: string;
  difficulty: string;
  generatedQuestions: GeneratedQuestion[];
  answers: Answer[];
  overallScore: number;
  resumeMatchScore: number;
  resumeMatchAnalysis: string;
  resumeTips: string[];
  status: 'ongoing' | 'completed';
  createdAt: string;
  completedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  resumeData?: ResumeData | null;
}
