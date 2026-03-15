import express from 'express';
import jwt from 'jsonwebtoken';
import { getQuery } from '../db.ts';

const router = express.Router();
const SECRET = 'banaprojectsecret2026';

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const user = await getQuery('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
    
    if (user) {
      const token = jwt.sign({ id: user.id, username: user.username, role: user.role, name: user.name }, SECRET, { expiresIn: '24h' });
      res.json({ token, user: { id: user.id, username: user.username, role: user.role, name: user.name } });
    } else {
      res.status(401).json({ error: 'Tài khoản hoặc mật khẩu không đúng' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

export const authenticate = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, SECRET, (err: any, user: any) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

router.get('/me', authenticate, (req: any, res) => {
  res.json({ user: req.user });
});

export default router;
