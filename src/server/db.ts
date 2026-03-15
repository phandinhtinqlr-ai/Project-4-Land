import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../../database.sqlite');

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Database connected');
  }
});

export function runQuery(sql: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

export function getQuery(sql: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function allQuery(sql: string, params: any[] = []): Promise<any[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

export async function initDb() {
  await runQuery(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT,
      name TEXT
    )
  `);

  await runQuery(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recordId TEXT,
      sourceSheet TEXT,
      weekNo INTEGER,
      fromDate TEXT,
      toDate TEXT,
      department TEXT,
      workstream TEXT,
      sectionType TEXT,
      taskTitle TEXT,
      taskDescription TEXT,
      startDate TEXT,
      endDate TEXT,
      status TEXT,
      progress INTEGER,
      owner TEXT,
      notes TEXT,
      result TEXT,
      createdAt TEXT,
      updatedAt TEXT,
      updatedBy TEXT,
      priority TEXT,
      tags TEXT
    )
  `);

  await runQuery(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT,
      actor TEXT,
      role TEXT,
      action TEXT,
      taskId INTEGER,
      description TEXT,
      isRead INTEGER DEFAULT 0
    )
  `);

  await runQuery(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT,
      username TEXT,
      role TEXT,
      action TEXT,
      targetType TEXT,
      targetId INTEGER,
      targetName TEXT,
      oldValue TEXT,
      newValue TEXT,
      description TEXT
    )
  `);

  await runQuery(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);

  // Seed data
  const manager = await getQuery('SELECT * FROM users WHERE username = ?', ['manager']);
  if (!manager) {
    await runQuery('INSERT INTO users (username, password, role, name) VALUES (?, ?, ?, ?)', ['manager', 'manager123', 'manager', 'Manager']);
  }

  const editer = await getQuery('SELECT * FROM users WHERE username = ?', ['editer']);
  if (!editer) {
    await runQuery('INSERT INTO users (username, password, role, name) VALUES (?, ?, ?, ?)', ['editer', 'editer2026', 'editer', 'Editer']);
  }

  const headerInfo = await getQuery('SELECT * FROM settings WHERE key = ?', ['headerInfo']);
  if (!headerInfo) {
    await runQuery('INSERT INTO settings (key, value) VALUES (?, ?)', ['headerInfo', 'TRẦN THỊ THU PHƯƠNG']);
  }

  const workstreams = await getQuery('SELECT * FROM settings WHERE key = ?', ['workstreams']);
  if (!workstreams) {
    await runQuery('INSERT INTO settings (key, value) VALUES (?, ?)', ['workstreams', JSON.stringify(['Vận hành', 'Xây dựng', 'Kỹ thuật', 'Kinh doanh', 'Nhân sự'])]);
  }

  const departments = await getQuery('SELECT * FROM settings WHERE key = ?', ['departments']);
  if (!departments) {
    await runQuery('INSERT INTO settings (key, value) VALUES (?, ?)', ['departments', JSON.stringify(['Phòng Kỹ thuật', 'Phòng Vận hành', 'Phòng Dự án', 'Ban Giám đốc'])]);
  }

  const owners = await getQuery('SELECT * FROM settings WHERE key = ?', ['owners']);
  if (!owners) {
    await runQuery('INSERT INTO settings (key, value) VALUES (?, ?)', ['owners', JSON.stringify(['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C'])]);
  }
}
