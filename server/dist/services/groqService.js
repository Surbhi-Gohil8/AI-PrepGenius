"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeResumeATS = exports.generateResumeTips = exports.calculateResumeMatch = exports.generateFollowUp = exports.generateSuggestedAnswers = exports.scoreAnswer = exports.generateResumeQuestions = exports.parseResume = exports.transcribeAudio = void 0;
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
4. Match question style to the domain (technical, clinical, design, business, etc.).
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
const generateSuggestedAnswers = async (answers, domain, difficulty, resumeData) => {
    if (answers.length === 0)
        return {};
    const qaBlock = answers
        .map((a, i) => `[${a.questionId}] Q${i + 1}: ${a.question}\nContext: ${a.context || 'N/A'}\nCandidate answered: ${a.transcript || '(no response)'}`)
        .join('\n\n');
    const prompt = `You are an expert interview coach. The candidate finished a ${difficulty} mock interview for "${domain}".

Resume background: ${resumeData.experienceLevel}, ${resumeData.yearsOfExperience} years. Skills: ${resumeData.skills.slice(0, 12).join(', ')}.

For EACH question below, write:
1. suggestedAnswer: A strong model answer (150-250 words) they can study—clear structure (e.g. situation → approach → outcome), professional tone, specific to the question and their background where relevant.
2. keyPoints: Exactly 4 short bullets on how to deliver this answer well.

${qaBlock}

Return ONLY valid JSON:
{
  "items": [
    {
      "questionId": "1",
      "suggestedAnswer": "full model answer text",
      "keyPoints": ["point 1", "point 2", "point 3", "point 4"]
    }
  ]
}

Include one item per questionId listed above.`;
    try {
        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: 'You write exemplary interview answers for learning. Return ONLY JSON.' },
                { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' }
        });
        const content = response.choices[0]?.message?.content || '{"items":[]}';
        const parsed = JSON.parse(content);
        const map = {};
        if (Array.isArray(parsed.items)) {
            for (const item of parsed.items) {
                if (item.questionId) {
                    map[item.questionId] = {
                        suggestedAnswer: item.suggestedAnswer || '',
                        keyPoints: Array.isArray(item.keyPoints) ? item.keyPoints.slice(0, 4) : []
                    };
                }
            }
        }
        return map;
    }
    catch (error) {
        console.error('Error generating suggested answers:', error);
        throw new Error(`Suggested answer generation failed: ${error.message}`);
    }
};
exports.generateSuggestedAnswers = generateSuggestedAnswers;
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
const analyzeResumeATS = async (resumeData, targetRole) => {
    const roleHint = targetRole?.trim()
        ? `Target role: ${targetRole.trim()}`
        : 'Infer a suitable target role from the resume (e.g. field of study or most recent role).';
    const prompt = `You are an ATS (Applicant Tracking System) resume expert. Analyze this resume for ATS compatibility, clarity, and keyword optimization.

${roleHint}

Structured profile:
- Skills: ${resumeData.skills.join(', ') || 'None listed'}
- Experience: ${resumeData.experienceLevel}, ${resumeData.yearsOfExperience} years
- Projects: ${resumeData.projects.join('; ') || 'None listed'}
- Roles: ${resumeData.previousRoles.join('; ') || 'None listed'}
- Education: ${resumeData.education || 'Not specified'}
- Domains: ${resumeData.detectedDomains.join(', ') || 'None'}

Resume text (excerpt):
${resumeData.rawText.slice(0, 8000)}

Evaluate: formatting/parseability, section structure, action verbs, quantified achievements, keyword coverage for the target role, contact info presence, length, and common ATS blockers (tables, images-only content, vague bullets).

Return ONLY valid JSON:
{
  "score": 75,
  "summary": "2-3 sentence overall ATS assessment",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "issues": [
    { "category": "Keywords", "severity": "high", "message": "specific issue" }
  ],
  "improvements": ["actionable fix 1", "actionable fix 2", "actionable fix 3", "actionable fix 4", "actionable fix 5"],
  "keywordsFound": ["keyword1", "keyword2"],
  "keywordsMissing": ["missing1", "missing2"]
}

Rules:
- score is 0-100 integer
- exactly 3 strengths
- 3-6 issues with severity high|medium|low
- exactly 5 improvements (specific, rewrite-style suggestions)
- 5-10 keywordsFound and 5-10 keywordsMissing relevant to the target role`;
    try {
        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: 'You are an ATS resume analyst. Return ONLY JSON.' },
                { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' }
        });
        const content = response.choices[0]?.message?.content || '{}';
        const parsed = JSON.parse(content);
        return {
            score: Math.min(100, Math.max(0, Math.round(Number(parsed.score) || 0))),
            summary: parsed.summary || 'ATS analysis completed.',
            strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 3) : [],
            issues: Array.isArray(parsed.issues)
                ? parsed.issues.slice(0, 6).map((i) => ({
                    category: i.category || 'General',
                    severity: ['high', 'medium', 'low'].includes(i.severity) ? i.severity : 'medium',
                    message: i.message || ''
                }))
                : [],
            improvements: Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 5) : [],
            keywordsFound: Array.isArray(parsed.keywordsFound) ? parsed.keywordsFound.slice(0, 10) : [],
            keywordsMissing: Array.isArray(parsed.keywordsMissing) ? parsed.keywordsMissing.slice(0, 10) : []
        };
    }
    catch (error) {
        console.error('Error analyzing resume ATS:', error);
        throw new Error(`ATS analysis failed: ${error.message}`);
    }
};
exports.analyzeResumeATS = analyzeResumeATS;
