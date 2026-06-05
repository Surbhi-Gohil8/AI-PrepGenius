"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateResumeTips = exports.calculateResumeMatch = exports.generateFollowUp = exports.scoreAnswer = exports.generateResumeQuestions = exports.parseResume = exports.transcribeAudio = void 0;
const groq_sdk_1 = require("groq-sdk");
const fs_1 = __importDefault(require("fs"));
const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
    console.warn('WARNING: GROQ_API_KEY is not defined in the environment variables.');
}
const groq = new groq_sdk_1.Groq({ apiKey: apiKey || 'dummy_key' });
const transcribeAudio = async (filePath) => {
    try {
        if (!fs_1.default.existsSync(filePath)) {
            throw new Error(`Audio file not found at: ${filePath}`);
        }
        const transcription = await groq.audio.transcriptions.create({
            file: fs_1.default.createReadStream(filePath),
            model: 'whisper-large-v3',
        });
        return transcription.text || '';
    }
    catch (error) {
        console.error('Error transcribing audio:', error);
        throw new Error(`Audio transcription failed: ${error.message}`);
    }
    finally {
        // Delete file after done
        try {
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
        }
        catch (cleanupError) {
            console.error('Error deleting temp audio file:', cleanupError);
        }
    }
};
exports.transcribeAudio = transcribeAudio;
const parseResume = async (resumeText) => {
    try {
        const prompt = `You are a resume parser. Extract structured information from the resume text and return ONLY valid JSON.
The output MUST be a JSON object matching this schema:
{
  "skills": ["React", "Node.js", "TypeScript"],
  "experienceLevel": "Mid", // must be "Junior" | "Mid" | "Senior"
  "yearsOfExperience": 3,
  "detectedDomains": ["JavaScript", "React", "System Design"],
  "projects": ["E-commerce app", "Chat application"],
  "previousRoles": ["Frontend Developer", "Full Stack Intern"],
  "education": "B.Tech Computer Science"
}

Ensure experienceLevel is exactly one of "Junior", "Mid", or "Senior" based on their years of experience and role titles (Junior: < 2 years, Mid: 2-5 years, Senior: > 5 years).
Resume text:
${resumeText}`;
        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: 'You are a resume parser that outputs ONLY structured JSON.' },
                { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' }
        });
        const content = response.choices[0]?.message?.content || '{}';
        const parsedData = JSON.parse(content);
        return {
            rawText: resumeText,
            skills: parsedData.skills || [],
            experienceLevel: parsedData.experienceLevel || 'Junior',
            yearsOfExperience: parsedData.yearsOfExperience || 0,
            detectedDomains: parsedData.detectedDomains || [],
            projects: parsedData.projects || [],
            previousRoles: parsedData.previousRoles || [],
            education: parsedData.education || '',
            uploadedAt: new Date()
        };
    }
    catch (error) {
        console.error('Error parsing resume with LLaMA3:', error);
        throw new Error(`Resume parsing failed: ${error.message}`);
    }
};
exports.parseResume = parseResume;
const generateResumeQuestions = async (resumeData, domain, difficulty) => {
    try {
        const skillsList = resumeData.skills.join(', ');
        const projectsList = resumeData.projects.join(', ');
        const rolesList = resumeData.previousRoles.join(', ');
        const prompt = `Candidate Resume Summary:
- Skills: ${skillsList}
- Experience Level: ${resumeData.experienceLevel} (${resumeData.yearsOfExperience} years)
- Projects: ${projectsList}
- Previous Roles: ${rolesList}
- Education: ${resumeData.education}

Generate exactly 5 interview questions for the domain: ${domain}
Difficulty: ${difficulty}

Rules:
1. At least 2 questions must directly reference their projects.
2. At least 1 question must be about a specific skill they listed on their resume.
3. Questions must match the difficulty level: ${difficulty}.
4. If HR domain: ask about their specific experience, roles, or teamwork style.
5. Make questions feel like a real interviewer read their resume and is asking targeted questions.

Return a JSON object containing a "questions" key which is an array of exactly 5 questions matching this format:
{
  "questions": [
    {
      "id": "1",
      "question": "I see you built a chat application. How did you handle real-time messaging at scale? What tech did you use and why?",
      "context": "Based on project: Chat application",
      "expectedTopics": ["WebSockets", "Redis", "scaling"],
      "difficulty": "Medium"
    }
  ]
}`;
        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert technical interviewer at a top tech company. Generate personalized questions from a resume. Return ONLY a valid JSON object.'
                },
                { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' }
        });
        const content = response.choices[0]?.message?.content || '{"questions": []}';
        const parsed = JSON.parse(content);
        return parsed.questions || [];
    }
    catch (error) {
        console.error('Error generating questions with LLaMA3:', error);
        throw new Error(`Question generation failed: ${error.message}`);
    }
};
exports.generateResumeQuestions = generateResumeQuestions;
const scoreAnswer = async (question, transcript, resumeData) => {
    try {
        const skillsList = resumeData.skills.join(', ');
        const projectsList = resumeData.projects.join(', ');
        const prompt = `You are an expert technical interviewer. Score the candidate's response to the interview question.
The candidate claimed these skills: ${skillsList}
and worked on these projects: ${projectsList}.
Score their answer considering what they should know given their background, experience level (${resumeData.experienceLevel}), and projects.

Question: "${question}"
Candidate's Response: "${transcript}"

Assess using these 4 rubrics on a scale of 1-10:
1. Technical Accuracy (correct use of concepts, architecture, technologies)
2. Communication Clarity (articulateness, pacing, structured speaking)
3. Problem Solving Approach (how they structure solutions, deal with constraints, reason about trade-offs)
4. Confidence and Structure (professionalism, tone, logical format)

Provide detailed feedback for each rubric and a summary.
The overall score should be a weighted average out of 10.

Return ONLY a valid JSON object matching this schema:
{
  "scores": {
    "technicalAccuracy": 8,
    "communicationClarity": 7,
    "problemSolvingApproach": 8,
    "confidenceAndStructure": 7,
    "overallScore": 8
  },
  "feedback": {
    "technicalAccuracy": "...",
    "communicationClarity": "...",
    "problemSolvingApproach": "...",
    "confidenceAndStructure": "...",
    "summary": "..."
  }
}`;
        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: 'You are an interview scoring system. Assess answers and return ONLY JSON.' },
                { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' }
        });
        const content = response.choices[0]?.message?.content || '{}';
        return JSON.parse(content);
    }
    catch (error) {
        console.error('Error scoring answer with LLaMA3:', error);
        throw new Error(`Answer scoring failed: ${error.message}`);
    }
};
exports.scoreAnswer = scoreAnswer;
const generateFollowUp = async (question, transcript, resumeData) => {
    try {
        const skillsList = resumeData.skills.join(', ');
        const projectsList = resumeData.projects.join(', ');
        const prompt = `You are a technical interviewer. The candidate has just answered an interview question.
Candidate Resume Context:
- Skills: ${skillsList}
- Projects: ${projectsList}

Initial Question: "${question}"
Candidate Answer: "${transcript}"

Generate a single, sharp follow-up question based on their answer and their resume context. It should drill deeper into their technical response or challenge their design decisions. Keep the follow-up concise (1-2 sentences).

Return a JSON object containing a "followUp" key:
{
  "followUp": "..."
}`;
        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: 'You generate sharp follow-up questions. Return ONLY JSON.' },
                { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' }
        });
        const content = response.choices[0]?.message?.content || '{"followUp": ""}';
        const parsed = JSON.parse(content);
        return parsed.followUp || 'Could you expand on the technical trade-offs you made in that scenario?';
    }
    catch (error) {
        console.error('Error generating follow-up with LLaMA3:', error);
        return 'Could you expand on the technical trade-offs you made in that scenario?';
    }
};
exports.generateFollowUp = generateFollowUp;
const calculateResumeMatch = async (resumeData, answers) => {
    try {
        const skillsList = resumeData.skills.join(', ');
        const projectsList = resumeData.projects.join(', ');
        const answersText = answers
            .map((a, i) => `Q${i + 1}: ${a.question}\nAns: ${a.transcript}`)
            .join('\n\n');
        const prompt = `You are an expert recruiter and technical assessor. Compare the candidate's claims on their resume against the actual answers they gave during the interview.
Resume Claims:
- Skills: ${skillsList}
- Projects: ${projectsList}

Interview Q&A:
${answersText}

Task:
Calculate a Resume Match Score (0 to 100%) indicating how well the candidate's demonstrated knowledge and responses align with the skills and experiences they claimed on their resume.
If they claimed advanced React or Node.js skills but struggled to explain basic concepts, the match score should be lower. If their answers accurately reflect their claimed project details and technical capabilities, the score should be higher.

Provide a match score (number) and a brief analysis paragraph (2-3 sentences).
Return ONLY a valid JSON object:
{
  "score": 85,
  "analysis": "The candidate demonstrates a solid match with their resume claims, discussing the WebSockets implementation from their Chat App with clarity. However, they showed minor hesitation when answering database-scaling questions, which is a key skill listed on their resume."
}`;
        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: 'You evaluate resume match scores. Return ONLY JSON.' },
                { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' }
        });
        const content = response.choices[0]?.message?.content || '{"score": 70, "analysis": ""}';
        return JSON.parse(content);
    }
    catch (error) {
        console.error('Error calculating resume match with LLaMA3:', error);
        return {
            score: 70,
            analysis: 'Could not perform detailed resume match assessment due to API limitations, but overall responses demonstrate reasonable alignment.'
        };
    }
};
exports.calculateResumeMatch = calculateResumeMatch;
const generateResumeTips = async (resumeData, answers) => {
    try {
        const skillsList = resumeData.skills.join(', ');
        const answersText = answers
            .map((a, i) => `Q${i + 1}: ${a.question}\nAns: ${a.transcript}`)
            .join('\n\n');
        const prompt = `You are a resume consultant and developer coach. Suggest improvements to the candidate's resume based on their performance in the mock interview.
Resume Skills: ${skillsList}

Interview Q&A:
${answersText}

Generate exactly 3 actionable tips (as plain text strings) to help them improve their resume or bridge the gaps between what they wrote and how they answer.
For example: "Your answers suggest strong React skills but you struggled with Node.js — consider adding more backend projects to your resume."

Return a JSON object containing a "tips" key which is an array of exactly 3 strings:
{
  "tips": [
    "Tip 1...",
    "Tip 2...",
    "Tip 3..."
  ]
}`;
        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: 'You generate resume improvement tips. Return ONLY JSON.' },
                { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' }
        });
        const content = response.choices[0]?.message?.content || '{"tips": []}';
        const parsed = JSON.parse(content);
        return parsed.tips && parsed.tips.length === 3
            ? parsed.tips
            : [
                'Highlight specific technical architectures and trade-offs of your projects on your resume to back up your verbal descriptions.',
                'Add key metrics or scaling parameters to your project descriptions (e.g. concurrent users or payload sizes).',
                'Include and detail standard system design patterns (like caching or event streams) next to your core programming languages.'
            ];
    }
    catch (error) {
        console.error('Error generating resume tips with LLaMA3:', error);
        return [
            'Highlight specific technical architectures and trade-offs of your projects on your resume to back up your verbal descriptions.',
            'Add key metrics or scaling parameters to your project descriptions (e.g. concurrent users or payload sizes).',
            'Include and detail standard system design patterns (like caching or event streams) next to your core programming languages.'
        ];
    }
};
exports.generateResumeTips = generateResumeTips;
