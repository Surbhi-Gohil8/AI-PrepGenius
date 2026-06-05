"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ message: 'Please fill in all fields.' });
            return;
        }
        const existingUser = await User_1.User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists with this email.' });
            return;
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        const newUser = new User_1.User({
            name,
            email,
            password: hashedPassword
        });
        await newUser.save();
        const token = jsonwebtoken_1.default.sign({ id: newUser._id, email: newUser.email }, process.env.JWT_SECRET || 'your_jwt_secret_here', { expiresIn: '7d' });
        res.status(201).json({
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                resumeData: newUser.resumeData
            }
        });
    }
    catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error during registration.', error: error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: 'Please provide email and password.' });
            return;
        }
        const user = await User_1.User.findOne({ email });
        if (!user) {
            res.status(400).json({ message: 'Invalid credentials.' });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: 'Invalid credentials.' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || 'your_jwt_secret_here', { expiresIn: '7d' });
        res.status(200).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                resumeData: user.resumeData
            }
        });
    }
    catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login.', error: error.message });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Not authorized.' });
            return;
        }
        const user = await User_1.User.findById(req.user.id).select('-password');
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
    }
    catch (error) {
        console.error('Get User Error:', error);
        res.status(500).json({ message: 'Server error retrieving profile info.', error: error.message });
    }
};
exports.getMe = getMe;
