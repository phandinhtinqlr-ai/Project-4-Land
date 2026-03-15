import express from 'express';
import { allQuery, getQuery } from '../db.ts';
import { authenticate } from './auth.ts';

const router = express.Router();

router.get('/', authenticate, async (req: any, res) => {
  try {
    const tasks = await allQuery('SELECT * FROM tasks');
    
    const total = tasks.length;
    const inProgress = tasks.filter(t => t.status === 'Đang thực hiện').length;
    const completed = tasks.filter(t => t.status === 'Hoàn thành').length;
    
    // Simple overdue logic: if endDate < today and not completed
    const today = new Date().toISOString().split('T')[0];
    const overdue = tasks.filter(t => t.endDate && t.endDate < today && t.status !== 'Hoàn thành').length;
    
    const avgProgress = total > 0 ? Math.round(tasks.reduce((sum, t) => sum + (t.progress || 0), 0) / total) : 0;
    
    // Top workstreams
    const workstreams: Record<string, number> = {};
    tasks.forEach(t => {
      if (t.workstream) {
        workstreams[t.workstream] = (workstreams[t.workstream] || 0) + 1;
      }
    });
    
    // Status counts
    const statusCounts: Record<string, number> = {};
    tasks.forEach(t => {
      if (t.status) {
        statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
      }
    });

    // Weekly trend (simplified)
    const weeklyTrend: Record<string, number> = {};
    tasks.forEach(t => {
      if (t.weekNo) {
        weeklyTrend[`Tuần ${t.weekNo}`] = (weeklyTrend[`Tuần ${t.weekNo}`] || 0) + 1;
      }
    });

    res.json({
      total,
      inProgress,
      completed,
      overdue,
      avgProgress,
      workstreams: Object.entries(workstreams).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
      statusCounts: Object.entries(statusCounts).map(([name, value]) => ({ name, value })),
      weeklyTrend: Object.entries(weeklyTrend).map(([name, value]) => ({ name, value })).sort((a, b) => a.name.localeCompare(b.name)),
      riskTasks: tasks.filter(t => t.endDate && t.endDate < today && t.status !== 'Hoàn thành').slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

export default router;
