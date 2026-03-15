import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

import { initDb } from './src/server/db.ts';
import authRoutes from './src/server/routes/auth.ts';
import taskRoutes from './src/server/routes/tasks.ts';
import dashboardRoutes from './src/server/routes/dashboard.ts';
import notificationRoutes from './src/server/routes/notifications.ts';
import logRoutes from './src/server/routes/logs.ts';
import settingRoutes from './src/server/routes/settings.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Initialize DB
  await initDb();

  // API Routes
  app.get('/api/test', (req, res) => res.json({ ok: true }));
  app.use('/api/settings', settingRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/logs', logRoutes);
  app.use('/api', authRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
