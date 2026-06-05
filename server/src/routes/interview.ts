import { Router } from 'express';
import {
  startSession,
  generateQuestions,
  getSession,
  completeSession,
  generateSuggestedAnswers,
  getHistory
} from '../controllers/interviewController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/start', authMiddleware, startSession);
router.post('/generate-questions', authMiddleware, generateQuestions);
router.get('/session/:id', authMiddleware, getSession);
router.post('/complete/:id', authMiddleware, completeSession);
router.post('/session/:id/suggested-answers', authMiddleware, generateSuggestedAnswers);
router.get('/history', authMiddleware, getHistory);

export default router;
