import { Schema, model, Types } from 'mongoose';

const generatedQuestionSchema = new Schema({
  id: { type: String, required: true },
  question: { type: String, required: true },
  context: { type: String, default: '' },
  expectedTopics: { type: [String], default: [] },
  difficulty: { type: String, required: true }
}, { _id: false });

const answerSchema = new Schema({
  questionId: { type: String, required: true },
  question: { type: String, required: true },
  context: { type: String, default: '' },
  transcript: { type: String, default: '' },
  followUpQuestion: { type: String, default: '' },
  scores: {
    technicalAccuracy: { type: Number, default: 0 },
    communicationClarity: { type: Number, default: 0 },
    problemSolvingApproach: { type: Number, default: 0 },
    confidenceAndStructure: { type: Number, default: 0 },
    overallScore: { type: Number, default: 0 }
  },
  feedback: {
    technicalAccuracy: { type: String, default: '' },
    communicationClarity: { type: String, default: '' },
    problemSolvingApproach: { type: String, default: '' },
    confidenceAndStructure: { type: String, default: '' },
    summary: { type: String, default: '' }
  },
  suggestedAnswer: { type: String, default: '' },
  keyPoints: { type: [String], default: [] }
}, { _id: false });

const sessionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  domain: { type: String, required: true },
  difficulty: { type: String, required: true },
  resumeSnapshot: { type: String, default: '' },
  generatedQuestions: { type: [generatedQuestionSchema], default: [] },
  answers: { type: [answerSchema], default: [] },
  overallScore: { type: Number, default: 0 },
  resumeMatchScore: { type: Number, default: 0 },
  resumeMatchAnalysis: { type: String, default: '' },
  resumeTips: { type: [String], default: [] },
  status: { type: String, enum: ['ongoing', 'completed'], default: 'ongoing' },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

export const Session = model('Session', sessionSchema);
export { GeneratedQuestion, Answer } from '../types/dbTypes'; // For type checking inside backend
