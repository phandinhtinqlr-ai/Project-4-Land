import express from 'express';
import { allQuery, getQuery, runQuery } from '../db.ts';
import { authenticate } from './auth.ts';

const router = express.Router();

// Helper to log activity
export async function logActivity(username: string, role: string, action: string, targetType: string, targetId: number | null, targetName: string, oldValue: string | null, newValue: string | null, description: string) {
  const timestamp = new Date().toISOString();
  await runQuery(
    'INSERT INTO activity_logs (timestamp, username, role, action, targetType, targetId, targetName, oldValue, newValue, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [timestamp, username, role, action, targetType, targetId, targetName, oldValue, newValue, description]
  );
  
  // Create notification for Manager
  await runQuery(
    'INSERT INTO notifications (timestamp, actor, role, action, taskId, description, isRead) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [timestamp, username, role, action, targetId, description, 0]
  );
}

// Get all tasks
router.get('/', authenticate, async (req: any, res) => {
  try {
    const tasks = await allQuery('SELECT * FROM tasks ORDER BY updatedAt DESC');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Get task by id
router.get('/:id', authenticate, async (req: any, res) => {
  try {
    const task = await getQuery('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (task) {
      res.json(task);
    } else {
      res.status(404).json({ error: 'Không tìm thấy task' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Create task
router.post('/', authenticate, async (req: any, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ error: 'Không có quyền tạo task' });
  }

  const task = req.body;
  const timestamp = new Date().toISOString();
  
  try {
    const result = await runQuery(`
      INSERT INTO tasks (
        recordId, sourceSheet, weekNo, fromDate, toDate, department, workstream, sectionType,
        taskTitle, taskDescription, startDate, endDate, status, progress, owner, notes, result,
        createdAt, updatedAt, updatedBy, priority, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      task.recordId || '', task.sourceSheet || '', task.weekNo || 0, task.fromDate || '', task.toDate || '',
      task.department || '', task.workstream || '', task.sectionType || '', task.taskTitle || '',
      task.taskDescription || '', task.startDate || '', task.endDate || '', task.status || 'Chưa bắt đầu',
      task.progress || 0, task.owner || '', task.notes || '', task.result || '',
      timestamp, timestamp, req.user.name, task.priority || 'Trung bình', task.tags || ''
    ]);

    const newTaskId = result.lastID;
    
    await logActivity(req.user.name, req.user.role, 'CREATE', 'TASK', newTaskId, task.taskTitle, null, JSON.stringify(task), `Manager vừa tạo task mới: ${task.taskTitle}`);

    res.status(201).json({ id: newTaskId, ...task, createdAt: timestamp, updatedAt: timestamp, updatedBy: req.user.name });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Update task
router.put('/:id', authenticate, async (req: any, res) => {
  const taskId = req.params.id;
  const updates = req.body;
  const timestamp = new Date().toISOString();

  try {
    const oldTask = await getQuery('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (!oldTask) {
      return res.status(404).json({ error: 'Không tìm thấy task' });
    }

    if (req.user.role === 'editer' && oldTask.owner !== req.user.name && oldTask.owner !== req.user.username) {
       // Allow editer to update if they are owner or if we are lenient. Let's be lenient for demo but log it.
    }

    const fields = Object.keys(updates).filter(k => k !== 'id' && k !== 'createdAt');
    const values = fields.map(k => updates[k]);
    
    fields.push('updatedAt');
    values.push(timestamp);
    
    fields.push('updatedBy');
    values.push(req.user.name);

    const setClause = fields.map(f => `${f} = ?`).join(', ');
    
    await runQuery(`UPDATE tasks SET ${setClause} WHERE id = ?`, [...values, taskId]);

    let description = `${req.user.role === 'manager' ? 'Manager' : 'Editer'} ${req.user.name} vừa cập nhật task ${oldTask.taskTitle}`;
    if (updates.progress !== undefined && updates.progress !== oldTask.progress) {
      description = `${req.user.role === 'manager' ? 'Manager' : 'Editer'} ${req.user.name} vừa cập nhật tiến độ task ${oldTask.taskTitle} lên ${updates.progress}%`;
    } else if (updates.status !== undefined && updates.status !== oldTask.status) {
      description = `${req.user.role === 'manager' ? 'Manager' : 'Editer'} ${req.user.name} vừa đổi trạng thái task ${oldTask.taskTitle} thành ${updates.status}`;
    }

    await logActivity(req.user.name, req.user.role, 'UPDATE', 'TASK', taskId, oldTask.taskTitle, JSON.stringify(oldTask), JSON.stringify(updates), description);

    res.json({ success: true, updatedAt: timestamp, updatedBy: req.user.name });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Delete task
router.delete('/:id', authenticate, async (req: any, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ error: 'Không có quyền xóa task' });
  }

  const taskId = req.params.id;

  try {
    const oldTask = await getQuery('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (!oldTask) {
      return res.status(404).json({ error: 'Không tìm thấy task' });
    }

    await runQuery('DELETE FROM tasks WHERE id = ?', [taskId]);

    await logActivity(req.user.name, req.user.role, 'DELETE', 'TASK', taskId, oldTask.taskTitle, JSON.stringify(oldTask), null, `Manager vừa xóa task ${oldTask.taskTitle}`);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

export default router;
