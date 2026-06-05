import mongoose from 'mongoose';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';

const seed = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mockinterview';
  console.log('Seeding database at:', mongoUri);

  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    // Check if test user exists
    const testEmail = 'candidate@example.com';
    const existing = await User.findOne({ email: testEmail });

    if (!existing) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);

      const testUser = new User({
        name: 'Demo Candidate',
        email: testEmail,
        password: hashedPassword,
        resumeData: {
          rawText: 'Demo Candidate Resume.\nExperience: Frontend developer with 3 years experience. Skills: React, Node.js, TypeScript, Express, MongoDB. Projects: Chat Application, E-commerce Portal.',
          skills: ['React', 'Node.js', 'TypeScript', 'Express', 'MongoDB'],
          experienceLevel: 'Mid',
          yearsOfExperience: 3,
          detectedDomains: ['Frontend', 'Backend', 'Full Stack'],
          projects: ['Chat Application', 'E-commerce Portal'],
          previousRoles: ['Frontend Developer', 'Intern'],
          education: 'Bachelor of Computer Science',
          uploadedAt: new Date()
        }
      });

      await testUser.save();
      console.log('Seeded a demo candidate user successfully.');
      console.log('Login credentials: candidate@example.com / password123');
    } else {
      console.log('Demo candidate already exists. Skipping user seed.');
    }

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
