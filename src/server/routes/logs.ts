import express from 'express';
import { allQuery } from '../db.ts';
import { authenticate } from './auth.ts';

const router = express.Router();

router.get('/', authenticate, async (req: any, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ error: 'Không có quyền xem log' });
  }

  try {
    const logs = await allQuery('SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 100');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

export default router;
