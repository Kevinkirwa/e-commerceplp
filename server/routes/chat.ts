
import { Router } from 'express';
import { handleCustomerQuery } from '../services/chat';

const router = Router();

router.post('/chat', async (req, res) => {
  try {
    const { query } = req.body;
    const userId = req.session?.userId;
    
    const response = await handleCustomerQuery(query, userId);
    res.json({ response });
  } catch (error) {
    console.error('Chat route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
