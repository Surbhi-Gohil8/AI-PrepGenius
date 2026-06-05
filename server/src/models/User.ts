import { Schema, model } from 'mongoose';

const resumeDataSchema = new Schema({
  rawText: { type: String, default: '' },
  skills: { type: [String], default: [] },
  experienceLevel: { type: String, enum: ['Junior', 'Mid', 'Senior'], default: 'Junior' },
  yearsOfExperience: { type: Number, default: 0 },
  detectedDomains: { type: [String], default: [] },
  projects: { type: [String], default: [] },
  previousRoles: { type: [String], default: [] },
  education: { type: String, default: '' },
  uploadedAt: { type: Date, default: Date.now }
}, { _id: false });

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resumeData: { type: resumeDataSchema, default: null },
  createdAt: { type: Date, default: Date.now }
});

export const User = model('User', userSchema);
