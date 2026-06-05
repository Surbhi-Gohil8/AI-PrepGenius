import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { audioUpload } from '../middleware/uploadMiddleware';

const router = Router();

// Wait, let's look at where we defined the handler. It was inside controllers/transcribeController.ts as transcribeResponse!
// Let's import it from transcribeController.
import { transcribeResponse as transcribeResponseHandler } from '../controllers/transcribeController';

router.post('/', authMiddleware, audioUpload.single('audio'), transcribeResponseHandler);

export default router;
