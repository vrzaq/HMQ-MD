/* Copyright C Arifi Razzaq 

  This Base Student Was Written By Arifi Razzaq
  Contact My WhatsApp https://wa.me/6283193905842
  Subscribe My YouTube Channel (Arifi Razzaq Ofc)
*/

import { promises as fs, constants, watch } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { myEmitter } from './emitter.js';
import util from 'util';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const databaseDir = join(__dirname, '../database');

let importedModule = null;

const file = __filename;
const filePaths = Object.fromEntries(
  ['config', 'user', 'group', 'chats'].map(key => [key, join(databaseDir, `${key}.json`)])
);

function getRandomColorCode() {
  const rgbToAnsi = (r, g, b) => {
    if (r === g && g === b) {
      if (r < 8) {
        return 16;
      }
      if (r > 248) {
        return 231;
      }
      return Math.round(((r - 8) / 247) * 24) + 232;
    }
    return 16 + (36 * Math.round(r / 255 * 5)) + (6 * Math.round(g / 255 * 5)) + Math.round(b / 255 * 5);
  };

  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `38;5;${rgbToAnsi(r, g, b)}`;
}

async function logError(message) {
  const color = getRandomColorCode();
  console.error(`\x1b[1m\x1b[47m\x1b[37m- ERROR: ${message}\x1b[0m`);
}

async function logInfo(message) {
  const color = getRandomColorCode();
  const bgColor = '42';
  
  console.log(`\x1b[1m\x1b[${bgColor}m\x1b[${color}m- INFO: ${message}\x1b[0m`);
}

async function ensureFile(file) {
  try {
    await fs.access(file, constants.F_OK);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.mkdir(dirname(file), { recursive: true }); // Membuat direktori secara rekursif jika tidak ada
      await fs.writeFile(file, JSON.stringify({}, null, 2));
    } else {
      throw err;
    }
  }
}

async function mergeDatabase(dbName, file, db) {
  try {
    const fileData = await fs.readFile(file, 'utf8');
    const data = JSON.parse(fileData);
    db[dbName] = { ...db[dbName], ...data };
    await fs.writeFile(file, JSON.stringify(db[dbName], null, 2));
    await logInfo(`Merged ${dbName} Database`);
    return `${dbName} database merged successfully!`;
  } catch (error) {
    await logError(util.format('\x1b[37m%s\x1b[0m', error));
    return `Error merging ${dbName} database. Please check the logs for details.`;
  }
}

async function saveDatabase(dbName, db) {
  try {
    const backupFile = `${filePaths[dbName]}.bak`;
    await fs.copyFile(filePaths[dbName], backupFile); // Backup database
    await fs.writeFile(filePaths[dbName], JSON.stringify(db[dbName], null, 2));
    await logInfo(`Saved ${dbName} Database`);
  } catch (error) {
    await logError(util.format('\x1b[37m%s\x1b[0m', error));
    const backupFile = `${filePaths[dbName]}.bak`;
    await fs.copyFile(backupFile, filePaths[dbName]);
    await logInfo(`Restored ${dbName} Database from Backup`);
  }
}

export async function writeDB() {
  try {
    const backupFiles = {};
    Object.keys(filePaths).forEach(async(dbName) => {
      backupFiles[dbName] = `${filePaths[dbName]}.bak`;
      await fs.copyFile(filePaths[dbName], backupFiles[dbName]); // Backup database
      await fs.writeFile(filePaths[dbName], JSON.stringify(db[dbName], null, 2));
    });
    await logInfo('Updated and wrote db successfully');
  } catch (error) {
    await logError(util.format('\x1b[37m%s\x1b[0m', error));
    Object.keys(backupFiles).forEach(async(dbName) => {
      await fs.copyFile(backupFiles[dbName], filePaths[dbName]);
      await logInfo(`Restored ${dbName} Database from Backup`);
    });
  }
}

async function initialize(filePaths, db) {
  try {
    for (const [dbName, filePath] of Object.entries(filePaths)) {
      await ensureFile(filePath);
      if (!db[dbName]) {
        db[dbName] = {};
        await saveDatabase(dbName, db);
      }
    }

    setInterval(async () => {
      for (const dbName of Object.keys(filePaths)) {
        await saveDatabase(dbName, db);
      }
      await writeDB(filePaths, db);
    }, 60 * 60 * 1000);

    await logInfo('Database initialized successfully');
  } catch (error) {
    await logError(util.format('\x1b[37m%s\x1b[0m', error));
    Object.keys(filePaths).forEach(async(dbName) => {
      const backupFile = `${filePaths[dbName]}.bak`;
      await fs.copyFile(backupFile, filePaths[dbName]);
      await logInfo(`Restored ${dbName} Database from Backup`);
    });
  }
}

export const db = {
  config: JSON.parse(await fs.readFile(filePaths.config, 'utf8')),
  user: JSON.parse(await fs.readFile(filePaths.user, 'utf8')),
  group: JSON.parse(await fs.readFile(filePaths.group, 'utf8')),
  chats: JSON.parse(await fs.readFile(filePaths.chats, 'utf8')),
};

myEmitter.on('event', () => {
  initialize(filePaths, db);
  writeDB();
});

initialize(filePaths, db);
watch(file, async () => { 
  console.log('\x1b[1m\x1b[33m%s\x1b[0m', `New ${file}`);
  if (importedModule) {
    await import(file).then(module => {
      importedModule = module;
    });
  }
});

import(file).then(module => {
  importedModule = module;
});
