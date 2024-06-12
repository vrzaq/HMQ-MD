/* Copyright C Arifi Razzaq 

  This Base Student Was Written By Arifi Razzaq
  Contact My WhatsApp https://wa.me/6283193905842
  Subscribe My YouTube Channel (Arifi Razzaq Ofc)
*/

import { of, from, interval } from 'rxjs';
import { concatMap, tap, map, catchError } from 'rxjs/operators';
import { db, writeDB } from './database.js';
import axios from 'axios';
import cheerio from 'cheerio';
import { watch } from 'fs';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);

let importedModule = null;

const file = __filename;
export const func = Object.create(null);

Object.defineProperties(func, {
  delay: {
    value: function (ms) {
      return from(new Promise(resolve => setTimeout(resolve, ms)));
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  getSenderName: {
    value: function (sender) {
      return sender.split("@")[0];
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  logMessage: {
    value: function (chatType, sender, message) {
      return of(`\x1b[1m${chatType} | \x1b[33m${func.getSenderName(sender)}\x1b[0m: ${message}`);
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  stringifyObject: {
    value: function (obj, depth = 0) {
      const indent = ' '.repeat(depth * 2);
      let result = '';

      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const value = obj[key];
          const valueType = typeof value;

          if (valueType === 'object' && value !== null) {
            result += `${indent}${key}:\n${func.stringifyObject(value, depth + 1)}`;
          } else {
            result += `${indent}${key}: ${value}\n`;
          }
        }
      }
      return result;
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  padEnd: {
    value: function (str, length) {
      return of(str).pipe(
        map(str => {
          const spacesToAdd = length - str.length;
          if (spacesToAdd <= 0) {
            return str;
          }
          return str + ' '.repeat(spacesToAdd);
        })
      );
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  increaseLevel: {
    value: function (db, m, conn) {
      const user = db.user[m.sender];
      const currentLevel = user.level;
      const expNeeded = func.expNeededForNextLevel(currentLevel);
      const top5Stats = func.getTop5Stats(currentLevel);
      const statsInfo = top5Stats.map((stat, index) => `${index + 1}. ${stat.stat}: ${stat.value}`).join("\n");

      if (!db.group[m.chat]) {
        db.group[m.chat] = { levelUpNotificationEnabled: false };
      }

      if (!db.group[m.chat].levelUpNotificationEnabled) {
        db.group[m.chat].levelUpNotificationEnabled = false;
      }

      while (user.exp >= expNeeded) {
        user.exp -= expNeeded;
        user.level++;
        const nextLevel = user.level + 1;
        const nextExpNeeded = func.expNeededForNextLevel(nextLevel);
        const nextTop5Stats = func.getTop5Stats(nextLevel);
        const nextStatsInfo = nextTop5Stats.map((stat, index) => `${index + 1}. ${stat.stat}: ${stat.value}`).join("\n");

        conn.sendMessage(m.chat, {
          text: `Selamat, kamu naik ke level ${user.level}!\n\nEXP: ${user.exp}/${expNeeded}\nRank: ${func.calculateRank(user.level)}\nEXP needed for next level: ${nextExpNeeded}\nNext Level: ${nextLevel}\n\nTop 5 Stats:\n${statsInfo}\n\nTop 5 Stats for next level:\n${nextStatsInfo}`,
        });
      }

      writeDB
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  getTop5Stats: {
    value: function (level) {
      return from([
        { stat: "Strength", value: level * 2 },
        { stat: "Agility", value: level * 1.5 },
        { stat: "Intelligence", value: level * 1.2 },
        { stat: "Vitality", value: level * 1.7 },
        { stat: "Luck", value: level * 1.3 }
      ]).pipe(
        map(stats => stats.sort((a, b) => b.value - a.value).slice(0, 5)),
        catchError(() => [])
      );
    },
    writable: false,
    enumerable: true,
    configurable: true
  },
  expNeededForNextLevel: {
    value: function (level) {
      return of(Math.floor(100 * Math.pow(1.5, level)));
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  calculateRank: {
    value: function (level) {
      if (level < 10) {
        return of("Beginner");
      } else if (level < 20) {
        return of("Intermediate");
      } else if (level < 30) {
        return of("Advanced");
      } else if (level < 40) {
        return of("Expert");
      } else if (level < 50) {
        return of("Elite");
      } else if (level < 60) {
        return of("Master");
      } else if (level < 70) {
        return of("Grandmaster");
      } else if (level < 80) {
        return of("Champion");
      } else if (level < 90) {
        return of("Legend");
      } else if (level < 100) {
        return of("Myth");
      } else if (level < 110) {
        return of("Immortal");
      } else if (level < 120) {
        return of("Godlike");
      } else if (level < 130) {
        return of("Celestial");
      } else if (level < 140) {
        return of("Eternal");
      } else if (level < 150) {
        return of("Divine");
      } else if (level < 160) {
        return of("Titan");
      } else if (level < 170) {
        return of("Archon");
      } else if (level < 180) {
        return of("Overlord");
      } else if (level < 190) {
        return of("Lord");
      } else if (level < 200) {
        return of("Deity");
      } else if (level < 210) {
        return of("Supreme");
      } else if (level < 220) {
        return of("Majesty");
      } else if (level < 230) {
        return of("Apex");
      } else if (level < 240) {
        return of("Paragon");
      } else if (level < 250) {
        return of("Ascendant");
      } else if (level < 260) {
        return of("Mythic");
      } else if (level < 270) {
        return of("Immortal");
      } else if (level < 280) {
        return of("Eternal");
      } else if (level < 290) {
        return of("Divine");
      } else if (level < 300) {
        return of("Titan");
      } else if (level < 310) {
        return of("Archangel");
      } else if (level < 320) {
        return of("Seraphim");
      } else if (level < 330) {
        return of("Astral");
      } else if (level < 340) {
        return of("Celestial Being");
      } else if (level < 350) {
        return of("Cosmic Entity");
      } else if (level < 360) {
        return of("Universal Deity");
      } else if (level < 370) {
        return of("Transcendent Being");
      } else if (level < 380) {
        return of("Supreme Entity");
      } else if (level < 390) {
        return of("Omnipotent Being");
      } else if (level < 400) {
        return of("Eternal Deity");
      } else {
        return of("Impossible");
      }
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  setLevelAndExp: {
    value: function (db, m, conn) {
      const args = m.text.trim().split(' ').slice(1);
      if (args.length < 3) {
        conn.reply(m.chat, 'Format pesan salah. Contoh: *!setlevel @user 50 5000*');
        return;
      }

      const target = args[0];
      const targetUser = db.user[target];
      if (!targetUser) {
        conn.reply(m.chat, 'Pengguna tidak ditemukan.');
        return;
      }

      const newLevel = parseInt(args[1]);
      const newExp = parseInt(args[2]);
      if (isNaN(newLevel) || isNaN(newExp)) {
        conn.reply(m.chat, 'Level dan EXP harus berupa angka.');
        return;
      }

      targetUser.level = newLevel;
      targetUser.exp = newExp;
      writeDB
      conn.reply(m.chat, `Level dan EXP ${target} berhasil diubah menjadi ${newLevel} dan ${newExp} secara manual.`);
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  showTopPlayers: {
    value: function (db, m, conn) {
      const topPlayers = Object.values(db.user).sort((a, b) => b.level - a.level).slice(0, 5);
      const topPlayersInfo = topPlayers.map((player, index) => `${index + 1}. @${player.id.split('@')[0]} (Level ${player.level})`).join('\n');
      conn.reply(m.chat, `Top 5 pemain dengan level tertinggi di grup ini:\n${topPlayersInfo}`);
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  toggleLevelUpNotification: {
    value: function (db, m, conn) {
      const chat = db.group[m.chat];
      if (!chat) {
        conn.reply(m.chat, 'Perintah ini hanya bisa digunakan di grup.');
        return;
      }

      chat.levelUpNotificationEnabled = !chat.levelUpNotificationEnabled;
      writeDB
      const status = chat.levelUpNotificationEnabled ? 'diaktifkan' : 'dinonaktifkan';
      conn.reply(m.chat, `Notifikasi naik level telah ${status} di grup ini.`);
    },
    writable: false,
    enumerable: true,
    configurable: true
  },
  
  showLeaderboard: {
    value: function (db, m, conn) {
      const leaderboard = Object.values(db.user).sort((a, b) => b.level - a.level);
      const leaderboardInfo = leaderboard.map((player, index) => `${index + 1}. @${player.id.split('@')[0]} (Level ${player.level})`).join('\n');
      conn.reply(m.chat, `Leaderboard:\n${leaderboardInfo}`);
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  checkLevel: {
    value: function (db, m, conn) {
      const user = db.user[m.sender];
      if (!user) return conn.reply(m.chat, 'Kamu belum terdaftar dalam database.');

      conn.reply(m.chat, `Level: ${user.level}\nXP: ${user.exp}/${func.expNeededForNextLevel(user.level)}`);
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  leaderboard: {
    value: function (db, m, conn, limit = 10) {
      const leaderboard = Object.values(db.user)
        .filter((user) => user.level && user.exp)
        .sort((a, b) => b.level - a.level || b.exp - a.exp)
        .slice(0, limit);

      const leaderboardInfo = leaderboard
        .map((user, index) => `${index + 1}. ${func.getSenderName(user.sender)} - Level: ${user.level}, EXP: ${user.exp}`)
        .join("\n");

      conn.sendMessage(m.chat, {
        text: `Leaderboard\n\n${leaderboardInfo}`,
      });
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  viewLeaderboard: {
    value: function (db, m, conn) {
      const users = Object.keys(db.user).map(userId => ({
          userId,
          level: db.user[userId].level
      }));

      users.sort((a, b) => b.level - a.level);

      let leaderboard = "Leaderboard\n";
      leaderboard += "=======================\n";

      for (let i = 0; i < 10 && i < users.length; i++) {
          leaderboard += `${i + 1}. ${conn.getName(users[i].userId)} - Level ${users[i].level}\n`;
      }

      conn.sendMessage(m.chat, { text: leaderboard });
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  findUser: {
    value: function (db, m, conn, query) {
      const users = Object.keys(db.user).map(userId => ({
          userId,
          name: conn.getName(userId),
          level: db.user[userId].level
      }));

      const foundUsers = users.filter(user => user.name.toLowerCase().includes(query.toLowerCase()));

      let result = "Search Result\n";
      result += "=======================\n";

      if (foundUsers.length > 0) {
          foundUsers.forEach((user, index) => {
              result += `${index + 1}. ${user.name} - Level ${user.level}\n`;
          });
      } else {
          result += "No user found\n";
      }

      conn.sendMessage(m.chat, { text: result });
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  viewUserStats: {
    value: function (db, m, conn, userId) {
      if (!(userId in db.user)) {
          conn.sendMessage(m.chat, { text: "User not found" });
          return;
      }

      const user = db.user[userId];
      const expNeeded = func.expNeededForNextLevel(user.level);
      const top5Stats = func.getTop5Stats(user.level);
      const statsInfo = top5Stats.map((stat, index) => `${index + 1}. ${stat.stat}: ${stat.value}`).join("\n");

      const nextLevel = user.level + 1;
      const nextExpNeeded = func.expNeededForNextLevel(nextLevel);
      const nextTop5Stats = func.getTop5Stats(nextLevel);
      const nextStatsInfo = nextTop5Stats.map((stat, index) => `${index + 1}. ${stat.stat}: ${stat.value}`).join("\n");

      conn.sendMessage(m.chat, {
          text: `User Stats\n\nEXP: ${user.exp}/${expNeeded}\nLevel: ${user.level}\nRank: ${func.calculateRank(user.level)}\n\nTop 5 Stats:\n${statsInfo}\n\nTop 5 Stats for next level:\n${nextStatsInfo}`,
      });
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  viewUserRank: {
    value: function (db, m, conn, userId) {
      if (!(userId in db.user)) {
          conn.sendMessage(m.chat, { text: "User not found" });
          return;
      }

      const user = db.user[userId];
      const rank = func.calculateRank(user.level);

      conn.sendMessage(m.chat, {
          text: `User Rank\n\nLevel: ${user.level}\nRank: ${rank}`,
      });
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  levelInfo: {
    value: function (db, m, conn, level) {
      if (isNaN(level) || level < 1) {
        conn.sendMessage(m.chat, { text: "Invalid level" });
        return;
      }

      const expNeeded = func.expNeededForNextLevel(level - 1).toPromise();

      conn.sendMessage(m.chat, {
        text: `Level Info\n\nLevel: ${level}\nExp Needed: ${expNeeded}`,
      });
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  rank: {
    value: async function (db, m, conn) {
      const userLevel = db.user[m.sender].level;
      const userRank = await func.calculateRank(userLevel).toPromise();

      conn.sendMessage(m.chat, {
        text: `Your Rank\n\nLevel: ${userLevel}\nRank: ${userRank}`,
      });
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  setLevelNotification: {
    value: function (db, m, conn, args) {
      const setting = args[0]?.toLowerCase();

      if (setting === 'on' || setting === 'off') {
        db.group[m.chat].levelUpNotificationEnabled = setting === 'on';
        writeDB
        conn.sendMessage(m.chat, {
          text: `Level up notification is now ${setting === 'on' ? 'enabled' : 'disabled'}`,
        });
      } else {
        conn.sendMessage(m.chat, {
          text: `Invalid command. Use !levelnotif [on|off]`,
        });
      }
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  viewMyStats: {
    value: function (db, m, conn) {
      const user = db.user[m.sender];

      const expNeeded = func.expNeededForNextLevel(user.level);
      const rank = func.calculateRank(user.level);

      func.getTop5Stats(user.level).subscribe(stats => {
        const top5Stats = stats.map((stat, index) => `${index + 1}. ${stat.stat}: ${stat.value}`).join("\n");

        conn.sendMessage(m.chat, {
          text: `Your Stats:\n\nLevel: ${user.level}\nEXP: ${user.exp}/${expNeeded}\nRank: ${rank}\n\nTop 5 Stats:\n${top5Stats}`,
        });
      });
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  increaseLevel: {
    value: function (db, m, conn) {
      const user = db.user[m.sender];
      const currentLevel = user.level;
      const expNeeded = func.expNeededForNextLevel(currentLevel);
      const top5Stats = func.getTop5Stats(currentLevel);
      const statsInfo = top5Stats.map((stat, index) => `${index + 1}. ${stat.stat}: ${stat.value}`).join("\n");

      if (!db.group[m.chat]) {
        db.group[m.chat] = { levelUpNotificationEnabled: false };
      }

      if (!db.group[m.chat].levelUpNotificationEnabled) {
        db.group[m.chat].levelUpNotificationEnabled = false;
      }

      while (user.exp >= expNeeded) {
        user.exp -= expNeeded;
        user.level++;
        const nextLevel = user.level + 1;
        const nextExpNeeded = func.expNeededForNextLevel(nextLevel);
        const nextTop5Stats = func.getTop5Stats(nextLevel);
        const nextStatsInfo = nextTop5Stats.map((stat, index) => `${index + 1}. ${stat.stat}: ${stat.value}`).join("\n");

        conn.sendMessage(m.chat, {
          text: `Selamat, kamu naik ke level ${user.level}!\n\nEXP: ${user.exp}/${expNeeded}\nRank: ${func.calculateRank(user.level)}\nEXP needed for next level: ${nextExpNeeded}\nNext Level: ${nextLevel}\n\nTop 5 Stats:\n${statsInfo}\n\nTop 5 Stats for next level:\n${nextStatsInfo}`,
        });
      }

      writeDB
    },
    writable: false,
    enumerable: true,
    configurable: true
  },
  
  upgradeStat: {
    value: function (db, m, conn, statName) {
      const user = db.user[m.sender];

      if (!user) {
        conn.sendMessage(m.chat, "User not found");
        return;
      }

      const stat = user.stats.find(s => s.name.toLowerCase() === statName.toLowerCase());

      if (!stat) {
        conn.sendMessage(m.chat, `Stat ${statName} not found`);
        return;
      }

      const expNeeded = func.expNeededForStatUpgrade(stat.level);

      if (user.exp < expNeeded) {
        conn.sendMessage(m.chat, `Not enough exp. Exp needed: ${expNeeded}`);
        return;
      }

      user.exp -= expNeeded;
      stat.level++;
      writeDB

      conn.sendMessage(m.chat, `Upgraded ${statName} to level ${stat.level}`);
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  expNeededForStatUpgrade: {
    value: function (level) {
      return Math.floor(100 * Math.pow(1.5, level));
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  viewStats: {
    value: function (db, m, conn) {
      const user = db.user[m.sender];

      if (!user) {
        conn.sendMessage(m.chat, "User not found");
        return;
      }

      const statsInfo = user.stats.map(stat => `${stat.name}: Level ${stat.level}`).join("\n");

      conn.sendMessage(m.chat, `Stats:\n${statsInfo}`);
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  getBuffer: {
    value: function (url, options = {}) {
      return from(
        axios({
          method: "get",
          url,
          headers: {
            'DNT': 1,
            'Upgrade-Insecure-Request': 1
          },
          ...options,
          responseType: 'arraybuffer'
        })
      );
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  fetchJson: {
    value: function (url, options = {}) {
      return from(
        axios({
          method: 'GET',
          url: url,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
          },
          ...options
        })
      );
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  scrapeWebsite: {
    value: async function (url) {
      try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        const title = $('title').text();
        const metaDescription = $('meta[name="description"]').attr('content');
        
        return { title, metaDescription };
      } catch (error) {
        console.error('Error scraping website:', error);
        return null;
      }
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  scrapeImages: {
    value: async function (url) {
      try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        const images = [];
        $('img').each((index, element) => {
          const imageUrl = $(element).attr('src');
          if (imageUrl) {
            images.push(imageUrl);
          }
        });
        
        return images;
      } catch (error) {
        console.error('Error scraping images:', error);
        return [];
      }
    },
    writable: false,
    enumerable: true,
    configurable: true
  },
  
  getHeaderScrape: {
    value: async function (url) {
      try {
        const response = await axios.head(url);
        const headers = response.headers;

        const header = {};
        Object.keys(headers).forEach(key => {
          header[key] = headers[key];
        });

        return header;
      } catch (error) {
        console.error('Error getting header:', error);
        return null;
      }
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  scrapeText: {
    value: async function (url) {
      try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        const text = $('body').text();
        return text;
      } catch (error) {
        console.error('Error scraping text:', error);
        return null;
      }
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  scrapeLinks: {
    value: async function (url) {
      try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        const links = [];
        $('a').each((index, element) => {
          const link = $(element).attr('href');
          if (link) {
            links.push(link);
          }
        });
        
        return links;
      } catch (error) {
        console.error('Error scraping links:', error);
        return [];
      }
    },
    writable: false,
    enumerable: true,
    configurable: true
  },
  
  scrapeElementContent: {
    value: async function (url, selector) {
      try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        const content = $(selector).text();
        return content;
      } catch (error) {
        console.error('Error scraping element content:', error);
        return null;
      }
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  scrapeElementAttribute: {
    value: async function (url, selector, attribute) {
      try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        const value = $(selector).attr(attribute);
        return value;
      } catch (error) {
        console.error('Error scraping element attribute:', error);
        return null;
      }
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  scrapeTitle: {
    value: async function (url) {
      try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        const title = $('title').text();
        return title;
      } catch (error) {
        console.error('Error scraping title:', error);
        return null;
      }
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  scrapeMetaDescription: {
    value: async function (url) {
      try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        const description = $('meta[name="description"]').attr('content');
        return description;
      } catch (error) {
        console.error('Error scraping meta description:', error);
        return null;
      }
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  runScraping: {
    value: async function (url) {
      try {
        const title = await func.scrapeTitle(url);
        const description = await func.scrapeMetaDescription(url);
        const links = await func.scrapeLinks(url);
        const images = await func.scrapeImages(url);

        return { title, description, links, images };
      } catch (error) {
        console.error('Error running scraping:', error);
        return null;
      }
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  ddosAttack: {
    value: async function (url, requests) {
      try {
        const attackPromises = [];
        for (let i = 0; i < requests; i++) {
          attackPromises.push(axios.get(url));
        }

        await Promise.all(attackPromises);
        return 'DDoS attack completed';
      } catch (error) {
        console.error('Error in DDoS attack:', error);
        return null;
      }
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  makeRequest: {
    value: async function (url) {
      try {
        const response = await axios.get(url);
        return response.data;
      } catch (error) {
        console.error('Error making request:', error);
        return null;
      }
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  scrapeEnteringData: {
    value: async function (url, header) {
      try {
        const response = await axios.get(url, { headers: header });
        const $ = cheerio.load(response.data);
        
        const formData = {};
        $('input').each((index, element) => {
          const name = $(element).attr('name');
          const value = $(element).val();
          if (name && value) {
            formData[name] = value;
          }
        });

        return formData;
      } catch (error) {
        console.error('Error scraping entering data:', error);
        return null;
      }
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  intToString: {
    value: function (num) {
      num = num.toString().replace(/[^0-9.]/g, '');
      if (num < 1000) {
        return num;
      }
      let si = [
        { v: 1E3, s: "ribu" },
        { v: 1E6, s: "juta" },
        { v: 1E9, s: "miliyar" },
        { v: 1E12, s: "triliun" },
        { v: 1E15, s: "P" },
        { v: 1E18, s: "E" }
      ];
      let index;
      for (index = si.length - 1; index > 0; index--) {
        if (num >= si[index].v) {
          break;
        }
      }
      return (
        (num / si[index].v).toFixed(2).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, "$1") +
        si[index].s
      );
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  addRespon: {
    value: function ({ id, title, price }, arr) {
      arr.push({ id, title, price });
      return arr;
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  getRespon: {
    value: function ({ id, arr, opts }) {
      const respon = arr.find(item => item.id === id);
      return respon ? respon : null;
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  delRespon: {
    value: function ({ id, arr }) {
      const index = arr.findIndex(item => item.id === id);
      if (index !== -1) {
        arr.splice(index, 1);
      }
      return arr;
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  isUrl: {
    value: function (url) {
      return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'));
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  formatNumber: {
    value: function (num) {
      return of(num).pipe(
        map(num => num >= 1000 ? (num / 1000).toFixed(1) + "k" : num.toString())
      );
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  sizeString: {
    value: function (des) {
      return of(des).pipe(
        map(des => {
          if (des === 0) return '0 Bytes';
          const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
          const i = Math.floor(Math.log(des) / Math.log(1024));
          return parseFloat((des / Math.pow(1024, i)).toFixed(0)) + ' ' + sizes[i];
        })
      );
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  formatMoney: {
    value: function (money) {
      return of(money).pipe(
        map(money => {
          const suffixes = ['', 'k', 'm', 'b', 't', 'q', 'Q', 's', 'S', 'o', 'n', 'd', 'U', 'D', 'Td', 'qd', 'Qd', 'sd', 'Sd', 'od', 'nd', 'V', 'Uv', 'Dv', 'Tv', 'qv', 'Qv', 'sv', 'Sv', 'ov', 'nv', 'T', 'UT', 'DT', 'TT', 'qt', 'QT', 'st', 'ST', 'ot', 'nt'];
          const suffixIndex = Math.floor(Math.log10(money) / 3);
          const suffix = suffixes[suffixIndex];
          const scaledmoney = money / Math.pow(10, suffixIndex * 3);
          return scaledmoney.toFixed(2) + suffix;
        })
      );
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  runtime: {
    value: function (seconds) {
      return of(seconds).pipe(
        map(seconds => {
          seconds = Number(seconds);
          var d = Math.floor(seconds / (3600 * 24));
          var h = Math.floor(seconds % (3600 * 24) / 3600);
          var m = Math.floor(seconds % 3600 / 60);
          var s = Math.floor(seconds % 60);
          var dDisplay = d > 0 ? d + (d == 1 ? "d, " : "d, ") : "";
          var hDisplay = h > 0 ? h + (h == 1 ? "h, " : "h, ") : "";
          var mDisplay = m > 0 ? m + (m == 1 ? "m, " : "m, ") : "";
          var sDisplay = s > 0 ? s + (s == 1 ? "s" : "s ") : "";
          return dDisplay + hDisplay + mDisplay + sDisplay;
        })
      );
    },
    writable: false,
    enumerable: true,
    configurable: true
  },

  pickRandom: {
    value: function (list) {
      return of(list).pipe(
        map(list => list[Math.floor(Math.random() * list.length)])
      );
    },
    writable: false,
    enumerable: true,
    configurable: true
  },
  
  parseMention: {
    value: function (text = '') {
      return of(text).pipe(
        map(text => [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net'))
      );
    },
    writable: false,
    enumerable: true,
    configurable: true
  }
});

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
