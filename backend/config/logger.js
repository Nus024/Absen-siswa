import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const writeLog = (filename, level, message) => {
  try {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}\n`;
    fs.appendFileSync(path.join(LOG_DIR, filename), logMessage);
  } catch (err) {
    console.error('Gagal menulis log ke file:', err.message);
  }
};

export const logger = {
  info(message) {
    console.log(`\x1b[32m[INFO]\x1b[0m ${message}`);
    writeLog('combined.log', 'INFO', message);
  },
  warn(message) {
    console.warn(`\x1b[33m[WARN]\x1b[0m ${message}`);
    writeLog('combined.log', 'WARN', message);
  },
  error(message, errorStack = '') {
    console.error(`\x1b[31m[ERROR]\x1b[0m ${message}`, errorStack);
    writeLog('combined.log', 'ERROR', `${message} ${errorStack}`);
    writeLog('error.log', 'ERROR', `${message} ${errorStack}`);
  },
  audit(user, action, detail) {
    const message = `User: ${user} | Action: ${action} | Detail: ${detail}`;
    console.log(`\x1b[36m[AUDIT]\x1b[0m ${message}`);
    writeLog('audit.log', 'AUDIT', message);
    writeLog('combined.log', 'AUDIT', message);
  }
};
