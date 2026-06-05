import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: 'Please fill in all fields.' });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists with this email.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET || 'your_jwt_secret_here',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        resumeData: newUser.resumeData
      }
    });
  } catch (error: any) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error during registration.', error: error.message });
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Please provide email and password.' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials.' });
      return;
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'your_jwt_secret_here',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        resumeData: user.resumeData
      }
    });
  } catch (error: any) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized.' });
      return;
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      resumeData: user.resumeData
    });
  } catch (error: any) {
    console.error('Get User Error:', error);
    res.status(500).json({ message: 'Server error retrieving profile info.', error: error.message });
  }
};
