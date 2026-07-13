import crypto from 'crypto';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { initDb, readState, writeState } from './server/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-please-change';
const JWT_EXPIRES = 60 * 60 * 24; // 1 day
const app = express();
const activeEvents = new Set();
const rateLimitMap = new Map();

initDb();

const sanitizeUser = ({ passwordHash, verificationCode, resetToken, ...user }) => ({
  ...user,
  isBanned: Boolean(user.isBanned),
  emailVerified: Boolean(user.emailVerified),
});

const verifyPassword = (password, user) => {
  if (user.passwordHash) return bcrypt.compareSync(password, user.passwordHash);
  return false;
};

const signToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

const getUserFromReq = (req) => {
  try {
    const token = req.cookies?.token || (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};

const isRateLimited = (ip) => {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  if (entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  if (entry.count >= 10) {
    return true;
  }
  entry.count += 1;
  return false;
};

const appendAuditLog = (state, actorEmail, action, details) => {
  const entry = {
    id: crypto.randomUUID(),
    actorEmail,
    action,
    details,
    createdAt: new Date().toISOString(),
  };
  const nextLog = [...(state.auditLog || []), entry];
  state.auditLog = nextLog.slice(-25);
  return entry;
};

const broadcastState = () => {
  const payload = JSON.stringify({ type: 'state', payload: readState() });
  activeEvents.forEach((res) => {
    try {
      res.write(`data: ${payload}\n\n`);
    } catch {
      activeEvents.delete(res);
    }
  });
};

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.get('/api/state', (req, res) => {
  const state = readState();
  res.json({ polls: state.polls, users: state.users.map(sanitizeUser), hasVotedByUser: state.hasVotedByUser, auditLog: state.auditLog || [] });
});

app.post('/api/state', (req, res) => {
  const { polls, users, hasVotedByUser, auditLog, invites } = req.body;
  if (!Array.isArray(polls) || !Array.isArray(users)) return res.status(400).json({ error: 'Invalid state payload' });
  const nextState = { polls, users, hasVotedByUser: hasVotedByUser || {}, auditLog: auditLog || [], invites: invites || [] };
  writeState(nextState);
  broadcastState();
  res.json({ polls: nextState.polls, users: nextState.users.map(sanitizeUser), hasVotedByUser: nextState.hasVotedByUser, auditLog: nextState.auditLog });
});

app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.write(': connected\n\n');
  activeEvents.add(res);
  req.on('close', () => activeEvents.delete(res));
});

app.post('/api/register', (req, res) => {
  const ip = req.ip || 'unknown';
  if (isRateLimited(ip)) return res.status(429).json({ error: 'Too many requests, please wait a moment.' });

  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required.' });

  const state = readState();
  if (state.users.some((u) => u.email === email)) return res.status(409).json({ error: 'A user with that email already exists.' });

  const verificationCode = crypto.randomInt(100000, 999999).toString();
  const passwordHash = bcrypt.hashSync(password, 10);
  const newUser = {
    email,
    name,
    role: 'user',
    isBanned: false,
    createdAt: new Date().toISOString(),
    passwordHash,
    emailVerified: false,
    verificationCode,
    locale: 'en',
  };

  const nextState = {
    ...state,
    polls: state.polls || [],
    users: [...(state.users || []), newUser],
    hasVotedByUser: state.hasVotedByUser || {},
    auditLog: state.auditLog || [],
    invites: state.invites || [],
  };
  writeState(nextState);
  broadcastState();

  const token = signToken({ email: newUser.email, name: newUser.name, role: newUser.role });
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: JWT_EXPIRES * 1000 });
  res.json({ ...sanitizeUser(newUser), verificationCode, needsVerification: true });
});

app.post('/api/login', (req, res) => {
  const ip = req.ip || 'unknown';
  if (isRateLimited(ip)) return res.status(429).json({ error: 'Too many requests, please wait a moment.' });

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

  const state = readState();
  const user = state.users.find((u) => u.email === email);
  if (!user || !verifyPassword(password, user)) return res.status(401).json({ error: 'Invalid email or password.' });
  if (user.isBanned) return res.status(403).json({ error: 'This account is banned.' });

  const token = signToken({ email: user.email, name: user.name, role: user.role });
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: JWT_EXPIRES * 1000 });
  res.json(sanitizeUser(user));
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

app.post('/api/verify-email', (req, res) => {
  const { email, code } = req.body;
  const state = readState();
  const user = state.users.find((u) => u.email === email);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  if (user.emailVerified) return res.json(sanitizeUser(user));
  if (!code || user.verificationCode !== String(code)) return res.status(400).json({ error: 'Invalid verification code.' });

  user.emailVerified = true;
  user.verificationCode = null;
  writeState({ ...state, users: state.users.map((item) => (item.email === email ? user : item)) });
  broadcastState();
  res.json(sanitizeUser(user));
});

app.post('/api/request-reset', (req, res) => {
  const { email } = req.body;
  const state = readState();
  const user = state.users.find((u) => u.email === email);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  const resetToken = crypto.randomBytes(4).toString('hex');
  user.resetToken = resetToken;
  writeState({ ...state, users: state.users.map((item) => (item.email === email ? user : item)) });
  broadcastState();
  res.json({ resetToken });
});

app.post('/api/reset-password', (req, res) => {
  const { email, token, password } = req.body;
  const state = readState();
  const user = state.users.find((u) => u.email === email);
  if (!user || user.resetToken !== token) return res.status(400).json({ error: 'Invalid reset code.' });

  user.passwordHash = bcrypt.hashSync(password, 10);
  user.resetToken = null;
  writeState({ ...state, users: state.users.map((item) => (item.email === email ? user : item)) });
  broadcastState();
  res.json({ ok: true });
});

app.post('/api/invites', (req, res) => {
  const actor = getUserFromReq(req);
  if (!actor) return res.status(401).json({ error: 'Not authenticated' });
  const { email } = req.body;
  const state = readState();
  const token = crypto.randomBytes(6).toString('hex');
  const invite = { email, token, createdAt: new Date().toISOString() };
  const nextState = { ...state, invites: [...(state.invites || []), invite] };
  writeState(nextState);
  broadcastState();
  res.json({ token, link: `${process.env.APP_URL || 'http://localhost:5173'}?invite=${token}` });
});

app.get('/api/me', (req, res) => {
  const auth = getUserFromReq(req);
  if (!auth) return res.status(401).json({ error: 'Not authenticated' });
  const state = readState();
  const user = state.users.find((u) => u.email === auth.email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(sanitizeUser(user));
});

app.patch('/api/users/:email', (req, res) => {
  const actor = getUserFromReq(req);
  if (!actor) return res.status(401).json({ error: 'Not authenticated' });
  if (actor.role !== 'admin') return res.status(403).json({ error: 'Requires admin' });

  const { email } = req.params;
  const { role, isBanned, locale } = req.body;
  const state = readState();
  const existing = state.users.find((u) => u.email === email);
  if (!existing) return res.status(404).json({ error: 'User not found' });

  const updated = {
    ...existing,
    ...(role ? { role } : {}),
    ...(typeof isBanned === 'boolean' ? { isBanned } : {}),
    ...(locale ? { locale } : {}),
  };
  const nextState = { ...state, users: state.users.filter((u) => u.email !== email).concat(updated) };
  appendAuditLog(nextState, actor.email, 'user-updated', `${email} updated`);
  writeState(nextState);
  broadcastState();
  res.json(sanitizeUser(updated));
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Poll backend listening at http://localhost:${port}`);
});
