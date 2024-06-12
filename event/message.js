import { promises as fsPromises, watch, writeFileSync } from 'fs';
import { Command } from '../lib/handler.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { db, writeDB } from '../lib/database.js';
import { func } from '../lib/function.js';
import { format, inspect } from 'util';
import { exec } from 'child_process';
import { createRequire } from 'module';
import { Evacuation } from './machine/evacuation.js';
import { RXJS, CASE } from './modem/index.js';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);

let importedModule = null;

const file = __filename;

export async function onMessageUpsert({ m, store }, conn, prefix) {
  try {
    if (!m.key) {
      console.error('Error: m.key is not defined.');
      return;
    }

    if (m.key.remoteJid == 'status@broadcast') conn.readMessages([m.key]);
    else if (!m.isGroup && !db.config.auto.read) conn.readMessages([m.key]);
    if (!m.isOwner && db.config.self && !(m.key.fromMe || m.key.remoteJid == 'status@broadcast')) {
      return;
    } 
    if (m.message) {
      if (!db.config) { db.config = {}; }
      if (!db.config.autobcgcEnabled) { db.config.autobcgcEnabled = false; }
      if (!db.config.autobcText) { db.config.autobcText = undefined; }
      if (!db.config.analyzeTag) { db.config.analyzeTag = false; }
      if (!db.config.isEnable) { db.config.isEnable = true; }
      
      if (m.sender) {
        if (!db.user) { db.user = {}; }
        if (!db.user[m.sender]) {
          db.user[m.sender] = {
            product: [],
            level: 0,
            exp: 0,
            rank: 'Beginner',
            balance: 0,
            warning: 0,
          };
        }
      }

      if (m.isGroup) {
        db.group = db.group || {};
        if (!db.group[m.chat]) {
          db.group[m.chat] = {
            antisticker: false,
            antiimage: false,
            antivideo: false,
            mute: false,
            levelUpNotificationEnabled: false,
            autoRemovedParticipants: false,
            openCommandAsGroup: false,
            antilink: {},
            badword: {},
          };
        }
        
        if (Object.keys(db.group[m.chat].antilink).length === 0 && db.group[m.chat].antilink.constructor === Object) {
          db.group[m.chat].antilink = {
            whatsapp: false,
            youtube: false,
            instagram: false,
            telegram: false,
            facebook: false,
            twitter: false,
            threads: false,
            snackvideo: false,
            wame: false,
            bitly: false,
          };
        }
        if (Object.keys(db.group[m.chat].badword).length === 0 && db.group[m.chat].badword.constructor === Object) {
          db.group[m.chat].badword = { 
            status: false,
            database: [],
          }
        }
      }

      if (m.isGroup && db.group) {
        Object.keys(db.group).forEach((key) => {
          if (key.includes('@g.us')) {
            let group = db.group[key];
            group.antisticker = group.antisticker || false;
            group.antiimage = group.antiimage || false;
            group.antivideo = group.antivideo || false;
            group.antilink = group.antilink || {};
            group.antilink.whatsapp = group.antilink.whatsapp || false;
            group.antilink.youtube = group.antilink.youtube || false;
            group.antilink.instagram = group.antilink.instagram || false;
            group.antilink.telegram = group.antilink.telegram || false;
            group.antilink.facebook = group.antilink.facebook || false;
            group.antilink.twitter = group.antilink.twitter || false;
            group.antilink.threads = group.antilink.threads || false;
            group.antilink.snackvideo = group.antilink.snackvideo || false;
            group.antilink.wame = group.antilink.wame || false;
            group.antilink.bitly = group.antilink.bitly || false;
            
            group.badword = group.badword || {
              status: false,
              database: [],
            };
            group.mute = group.mute || false;
            group.levelUpNotificationEnabled = group.levelUpNotificationEnabled || false;
            group.autoRemovedParticipants = group.autoRemovedParticipants || false;
            group.openCommandAsGroup = group.openCommandAsGroup || false;
          }
        });
      } else if (!m.isGroup && db.user) {
        Object.keys(db.user).forEach((key) => {
          let user = db.user[key];
          user.product = user.product || [];
          user.level = user.level || 0;
          user.exp = user.exp || 0;
          user.rank = user.rank || 'Beginner';
          user.balance = user.balance || 0;
          user.warning = user.warning || 0;
        });
      }
      
      Object.entries(db.group).forEach(([key, value]) => {
        if (value.badword.database.length === 0) {
          value.badword.database.push("anjing", "babi", "pepek", "ngentot", "kontol", "asu", "ngentod", "puki", "nenen", "tetek", "tete", "ajg");
        }
      });
      
      m.blockList = (await conn.fetchBlocklist().catch(() => undefined)) || [];
      m.isOwner = [
        conn.decodeJid(conn.user.id === undefined ? conn.user.jid : conn.user.id),
        ...db.config.authorNumber.map(number => number),
      ].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

      m.isMods =
        m.isOwner ||
        db.config.mods
          .map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
          .includes(m.sender);

      m.isPremium =
        m.isOwner ||
        db.config.prems
          .map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
          .includes(m.sender);

      m.groupMetadata = (m.isGroup
        ? await conn.groupMetadata(m.chat).catch(() => undefined)
        : {}) || {};

      m.participants = (m.isGroup ? m.groupMetadata.participants : []) || [];
      m.user = (m.isGroup
        ? m.participants.find(u => conn.decodeJid(u.id) === m.sender)
        : {}) || {};

      m.bot = (m.isGroup
        ? m.participants.find(u => conn.decodeJid(u.id) == conn.decodeJid(conn.user.id === undefined ? conn.user.jid : conn.user.id))
        : {}) || {};

      m.isRAdmin = m.user?.admin == 'superadmin' || false;
      m.isAdmin = m.isRAdmin || m.user?.admin == 'admin' || false;
      m.isBotAdmin = m.bot?.admin || false;

      m.extendEntry = (entry, extension) => {
        if (entry && typeof entry === 'object' && extension && typeof extension === 'object') {
          return { ...entry, ...extension };
        }
        return entry;
      };
      
      new Evacuation({ m, db, conn, func, store }).CallRight();
      
      const pluginsPath = join(dirname(fileURLToPath(import.meta.url)), '../plugins');
      Command.initCommandsPath(pluginsPath);
      Command.reloadPlugins(pluginsPath);
      
      if (m.isCmd && m.command.length > 0) {
        new RXJS({ m, db, conn, func, store }).online()
        new CASE({ m, db, conn, func, store }).online()
      }
      
      writeDB();
    }
  } catch (error) {
    console.error(error);
  }
}

watch(file, async () => { 
  try {
    console.log('\x1b[1m\x1b[33m%s\x1b[0m', `New ${file}`);

    if (importedModule) {
      await import(file).then(module => {
        importedModule = module;
      });
    }
  } catch (error) {
    console.error('Error in watch:', error);
  }
});

import(file).then(module => {
  importedModule = module;
}).catch(error => {
  console.error('Error importing file:', error);
});

process.on("unhandledRejection", function(error) {
  if (error.Error === "rate-overlimit") { 
    return;
  } else {
    console.error(`[${new Date().toISOString()}] Unhandled Rejection:`, error);
  }
});
