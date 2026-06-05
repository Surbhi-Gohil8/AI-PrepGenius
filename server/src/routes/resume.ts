import { Router } from 'express';
import { uploadResume, getResume, deleteResume, analyzeResumeATSHandler } from '../controllers/resumeController';
import { authMiddleware } from '../middleware/authMiddleware';
import { resumeUpload } from '../middleware/uploadMiddleware';

const router = Router();

router.post('/upload', authMiddleware, (req, res, next) => {
  resumeUpload.single('resume')(req, res, (err) => {
    if (err) {
      console.error('[resume/upload] Multer error:', err.message, '| code:', err.code);
      res.status(400).json({ message: err.message, code: err.code });
      return;
    }
    if (!req.file) {
      console.error('[resume/upload] req.file is undefined. Content-Type received:', req.headers['content-type']);
      res.status(400).json({ message: 'No resume file received by the server. Ensure the file field is named "resume" and Content-Type is multipart/form-data.' });
      return;
    }
    console.log('[resume/upload] File received:', req.file.originalname, '| mimetype:', req.file.mimetype, '| size:', req.file.size);
    next();
  });
}, uploadResume);
router.post('/ats-analyze', authMiddleware, analyzeResumeATSHandler);
router.get('/me', authMiddleware, getResume);
router.delete('/me', authMiddleware, deleteResume);

export default router;
