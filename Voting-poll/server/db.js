import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DatabaseSync } from 'node:sqlite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jsonPath = path.join(__dirname, 'server-data.json');
const dbPath = path.join(__dirname, 'server.sqlite');

let db;
let usingSqlite = false;

try {
  db = new DatabaseSync(dbPath);
  usingSqlite = true;

  db.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS app_state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
} catch (error) {
  console.warn('SQLite unavailable, falling back to JSON.', error.message);
  usingSqlite = false;
}

const defaultState = {
  polls: [],
  users: [],
  hasVotedByUser: {},
  auditLog: [],
  invites: [],
};

function readJsonState() {
  if (!fs.existsSync(jsonPath)) {
    fs.writeFileSync(jsonPath, JSON.stringify(defaultState, null, 2));
    return { ...defaultState };
  }

  try {
    const raw = fs.readFileSync(jsonPath, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to read JSON state, resetting', error);
    fs.writeFileSync(jsonPath, JSON.stringify(defaultState, null, 2));
    return { ...defaultState };
  }
}

export function initDb() {
  return usingSqlite ? db : null;
}

export function readState() {
  if (usingSqlite && db) {
    const row = db.prepare('SELECT value FROM app_state WHERE key = ?').get('state');
    if (row?.value) {
      try {
        return JSON.parse(row.value);
      } catch (error) {
        console.error('Failed to parse persisted state', error);
      }
    }
    return { ...defaultState };
  }

  return readJsonState();
}

export function writeState(state) {
  const payload = {
    ...defaultState,
    ...state,
    polls: Array.isArray(state?.polls) ? state.polls : defaultState.polls,
    users: Array.isArray(state?.users) ? state.users : defaultState.users,
    hasVotedByUser: state?.hasVotedByUser || defaultState.hasVotedByUser,
    auditLog: Array.isArray(state?.auditLog) ? state.auditLog : defaultState.auditLog,
    invites: Array.isArray(state?.invites) ? state.invites : defaultState.invites,
  };

  if (usingSqlite && db) {
    db.prepare('INSERT INTO app_state(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run('state', JSON.stringify(payload));
    return;
  }

  try {
    fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2));
  } catch (error) {
    console.error('Failed to write JSON state', error);
  }
}
