# AI Mock Interview Platform

A complete, resume-aware technical mock interview platform built with **Next.js 14 (App Router)**, **Node.js/Express**, **MongoDB**, and **Groq Cloud AI Services**.

---

## Technical Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Recharts, Framer Motion
- **Backend**: Express.js, TypeScript, Mongoose
- **Database**: MongoDB 7
- **AI Integrations**: 
  - **Whisper (whisper-large-v3)**: Verbal answer transcription
  - **LLaMA 3 (llama3-70b-8192)**: Resume parsing, question tailoring, answer grading, follow-ups, and resume match analysis.
- **Parsers**: `pdf-parse` (PDF extraction) + `mammoth` (DOCX extraction)
- **Voice Uploads**: Multi-segmented file transfers handled by Multer.

---

## Environment Setup

### Server Environment Configuration (`server/.env`)
Create a file named `.env` inside the `server/` directory and configure the following parameters:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/mockinterview
JWT_SECRET=your_jwt_secret_here
GROQ_API_KEY=your_groq_api_key_here
NODE_ENV=development
```

### Client Environment Configuration (`client/.env.local`)
Create a file named `.env.local` inside the `client/` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## Running the Application

### 1. Locally (Development Mode)

#### Starting Backend Server:
```bash
cd server
npm install
npm run dev
```

#### Seeding Database:
Seeding populates a demo user profile `candidate@example.com` (password: `password123`) containing a pre-parsed resume to let you test features instantly:
```bash
cd server
npm run seed
```

#### Starting Frontend Client:
```bash
cd client
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

### 2. Using Docker (Containerized Stack)
Ensure Docker and Docker Compose are installed on your machine. Start the entire container network (Next.js, Express, MongoDB):
```bash
docker compose up --build
```
- Frontend will be accessible at: [http://localhost:3000](http://localhost:3000)
- Backend API will be accessible at: [http://localhost:5000](http://localhost:5000)
- MongoDB is exposed at: `27017`

---

## Platform Workflow
1. **Resume Submission**: Upload your PDF/DOCX. LLaMA3 extracts your skills, projects, and experience level.
2. **Setup Stepper**: Select domain (matched with resume) and difficulty level.
3. **Mock Interview**: Practice answering 5 customized questions. Record your voice naturally; Whisper transcribes speech on submission.
4. **Follow-up Questions**: Respond to contextual AI follow-up drills generated from your previous answers.
5. **Dashboard & Results**: View detailed radar maps, rubric sub-scores, overall grades, alignment ratios, and resume tips.
