import { Command } from '../../lib/handler.js';
import { performance } from 'perf_hooks';
import { sizeFormatter } from 'human-readable';
import { promises } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import moment from 'moment-timezone';

Command.create({
  name: 'ping',
  category: 'other',
  run: async ({ db, m, conn }) => {
    const startTime = performance.now();

    const packagePath = join(dirname(fileURLToPath(import.meta.url)), '../../package.json');
    const packageData = JSON.parse(await promises.readFile(packagePath, 'utf-8'));

    const uptime = os.uptime();
    const totalmem = os.totalmem();
    const freemem = os.freemem();
    const platform = os.platform();
    const arch = os.arch();
    const cpus = os.cpus();

    const chats = Object.entries(conn.chats).filter(([id, data]) => id && data.jid.endsWith('@g.us'));
    const groupsIn = chats.filter(([id]) => id.endsWith('@g.us'));
    
    const date = moment.tz('Asia/Jakarta').format("dddd, Do MMMM, YYYY");
    const time = moment.tz('Asia/Jakarta').format('HH:mm:ss');
    
    const endTime = performance.now();
    const responseTime = (endTime - startTime).toFixed(1);

    const formatBytes = (bytes) => sizeFormatter({ std: 'IEC', decimalPlaces: 2 })(bytes);

    const formatUptime = (uptime) => {
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      const milliseconds = Math.floor((uptime % 1) * 1000);
      
      return `${hours} jam ${minutes} menit ${seconds} detik ${milliseconds} milidetik`;
    }; 

    const [cpuUsage] = await Promise.all([
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(process.cpuUsage());
        }, 0);
      })
    ]);

    let capti = `ℹ️ Info Bot:\n` +
      `1️⃣ Nama: ${packageData.name}\n` +
      `2️⃣ Versi: ${packageData.version}\n` +
      `3️⃣ Deskripsi: ${packageData.description}\n\n` +
      `⏳ Uptime: ${formatUptime(uptime)}\n` +
      `💾 Database: ${formatNumber(Object.keys(db.user)?.length)} Pengguna\n\n` +
      `📅 Tanggal: ${date}\n` +
      `🕰️ Waktu: ${time} (GMT+5:30)\n\n` +
      `ℹ️ Info Server:\n` +
      `   - Ping: ${responseTime} Ms\n` +
      `   - RAM: ${formatBytes(totalmem - freemem)} / ${formatBytes(totalmem)}\n` +
      `   - Sistem Operasi: ${platform} ${arch}\n` +
      `   - Total CPU Usage: ${cpuUsage.user + cpuUsage.system} Core(s)\n\n` +
      `📱 Status WhatsApp:\n` +
      `   - Group Chats: ${groupsIn.length}\n` +
      `   - Groups Joined: ${groupsIn.length}\n` +
      `   - Groups Left: ${groupsIn.length - groupsIn.length}\n` +
      `   - Personal Chats: ${chats.length - groupsIn.length}\n` +
      `   - Total Chats: ${chats.length}\n\n` +
      `*Thanks To 'Arifi Razzaq' Base Maker on this WhatsApp bot*\n`;

    m.reply(`${capti}`);
  },
  description: 'Mengecek waktu respon bot dan informasi lainnya.'
});

function formatNumber(number) {
  return Number(number).toLocaleString('en-US');
}
