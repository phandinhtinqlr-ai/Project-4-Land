import express from 'express';
import { allQuery, runQuery } from '../db.ts';
import { authenticate } from './auth.ts';

const router = express.Router();

router.get('/', authenticate, async (req: any, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ error: 'Không có quyền xem thông báo' });
  }

  try {
    const notifications = await allQuery('SELECT * FROM notifications ORDER BY timestamp DESC LIMIT 50');
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

router.post('/:id/read', authenticate, async (req: any, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ error: 'Không có quyền' });
  }

  try {
    await runQuery('UPDATE notifications SET isRead = 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

export default router;
