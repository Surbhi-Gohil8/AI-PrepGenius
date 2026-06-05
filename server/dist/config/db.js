"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
// Force load from the local .env file regardless of any inherited shell/Docker env vars
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env'), override: true });
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI is not defined in environment variables.');
        }
        console.log(`Connecting to MongoDB at: ${mongoUri.replace(/:([^:@]+)@/, ':***@')}`);
        await mongoose_1.default.connect(mongoUri);
        console.log('MongoDB Connected Successfully');
    }
    catch (error) {
        console.error('MongoDB Connection Error:', error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
