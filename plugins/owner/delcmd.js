import { Command } from '../../lib/handler.js';
import fs from 'fs';

Command.create({
  name: 'delcmd',
  category: 'owner',
  run({ m, db }) {
    if (m.isOwner) {
      if (m.query) {
        try {
          fs.unlinkSync(`./plugins/${m.query}`);
          return m.reply(`*Berhasil!*\n\nPerintah ${m.prefix + m.query.split("/")[1].split(".")[0]} berhasil dihapus.`);
        } catch (error) {
          if (String(error).includes('no such file or directory')) {
            return m.reply(`Maaf, perintah yang kamu cari tidak ditemukan.`);
          } else {
            if (!m.query.split('/')[0]) return m.reply(error.message)
            return m.reply(`Maaf folder ${m.query.split('/')[0]} tidak di temukan, silakan buat folder tersebut terlebih dahulu`)
          }
        }
      } else {
        return m.reply(`Kirim perintah ${m.prefix + m.command} kategori/perintah.js (reply code)\n\nContoh : ${m.prefix + m.command} Other/ping.js (reply code)`);
      }
    }
  }
});
