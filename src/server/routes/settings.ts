import express from 'express';
import { getQuery, runQuery } from '../db.ts';
import { authenticate } from './auth.ts';

const router = express.Router();

router.get('/headerInfo', authenticate, async (req: any, res) => {
  try {
    const info = await getQuery('SELECT * FROM settings WHERE key = ?', ['headerInfo']);
    res.json({ value: info ? info.value : 'TRẦN THỊ THU PHƯƠNG' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

router.post('/headerInfo', authenticate, async (req: any, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ error: 'Không có quyền' });
  }

  try {
    await runQuery('UPDATE settings SET value = ? WHERE key = ?', [req.body.value, 'headerInfo']);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

router.get('/config', authenticate, async (req: any, res) => {
  try {
    const workstreams = await getQuery('SELECT * FROM settings WHERE key = ?', ['workstreams']);
    const departments = await getQuery('SELECT * FROM settings WHERE key = ?', ['departments']);
    const owners = await getQuery('SELECT * FROM settings WHERE key = ?', ['owners']);
    res.json({ 
      workstreams: workstreams ? JSON.parse(workstreams.value) : [],
      departments: departments ? JSON.parse(departments.value) : [],
      owners: owners ? JSON.parse(owners.value) : []
    });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

router.post('/config', authenticate, async (req: any, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ error: 'Không có quyền' });
  }

  try {
    const { workstreams, departments, owners } = req.body;
    if (workstreams) {
      await runQuery('UPDATE settings SET value = ? WHERE key = ?', [JSON.stringify(workstreams), 'workstreams']);
    }
    if (departments) {
      await runQuery('UPDATE settings SET value = ? WHERE key = ?', [JSON.stringify(departments), 'departments']);
    }
    if (owners) {
      await runQuery('UPDATE settings SET value = ? WHERE key = ?', [JSON.stringify(owners), 'owners']);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

export default router;
