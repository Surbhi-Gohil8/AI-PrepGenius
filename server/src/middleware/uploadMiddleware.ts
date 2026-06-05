import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const audioDir = path.join(__dirname, '../../uploads/audio');
const resumeDir = path.join(__dirname, '../../uploads/resumes');

if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}
if (!fs.existsSync(resumeDir)) {
  fs.mkdirSync(resumeDir, { recursive: true });
}

// Storage configurations
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, audioDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `audio-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, resumeDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `resume-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// File filters
const audioFileFilter = (req: any, file: any, cb: any) => {
  const allowedMimeTypes = ['audio/webm', 'audio/mp4', 'audio/wav', 'audio/mpeg', 'audio/ogg', 'audio/x-wav', 'video/webm'];
  
  if (allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid audio format. Allowed types: webm, mp4, wav'), false);
  }
};

const resumeFileFilter = (req: any, file: any, cb: any) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ];
  
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedMimeTypes.includes(file.mimetype) || ext === '.pdf' || ext === '.docx') {
    cb(null, true);
  } else {
    cb(new Error('Invalid document format. Only PDF and DOCX are allowed.'), false);
  }
};

// Export middleware instances
export const audioUpload = multer({
  storage: audioStorage,
  fileFilter: audioFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

export const resumeUpload = multer({
  storage: resumeStorage,
  fileFilter: resumeFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});
