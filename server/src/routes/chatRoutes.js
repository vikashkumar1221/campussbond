import { Router } from 'express';
import {
  openConversation,
  respondToChatRequest,
  getConversations,
  getMessages,
  sendMessage,
  getCampusStudents,
} from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/users', getCampusStudents);
router.post('/open', openConversation);
router.patch('/conversations/:id/respond', respondToChatRequest);
router.get('/conversations', getConversations);
router.get('/conversations/:id/messages', getMessages);
router.post('/conversations/:id/messages', sendMessage);

export default router;
