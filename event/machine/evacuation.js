import { Command } from '../../lib/handler.js';
import moment from 'moment-timezone';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class Evacuation {
  constructor({ m, db, conn, func, store }) {
    this.m = m;
    this.db = db;
    this.conn = conn;
    this.func = func;
    this.store = store;
    this.colors = {
      'reset': '\x1b[0m',
      'bright': '\x1b[1m',
      'dim': '\x1b[2m',
      'underscore': '\x1b[4m',
      'blink': '\x1b[5m',
      'reverse': '\x1b[7m',
      'hidden': '\x1b[8m',
      'black': '\x1b[30m',
      'red': '\x1b[31m',
      'green': '\x1b[32m',
      'yellow': '\x1b[33m',
      'blue': '\x1b[34m',
      'magenta': '\x1b[35m',
      'cyan': '\x1b[36m',
      'white': '\x1b[37m',
      'bgBlack': '\x1b[40m',
      'bgRed': '\x1b[41m',
      'bgGreen': '\x1b[42m',
      'bgYellow': '\x1b[43m',
      'bgBlue': '\x1b[44m',
      'bgMagenta': '\x1b[45m',
      'bgCyan': '\x1b[46m',
      'bgWhite': '\x1b[47m'
    };
  }

  CallRight() {
    try {
      this.showLog();
      this.AutoBroadcast();
      this.AutoPost();
      this.AntiMedia();
      this.OpenCommandAsGroup();
      this.isMuteCommand();
      this.IsCallCommand();
    } catch (error) {
      console.error(error);
    }
  }

  IsCallCommand() {
    try {
      this.executeCommand('eval');
      this.executeCommand('antilink');
      this.executeCommand('badword');

      if (this.db.config.auto.response) {
        this.executeCommand('getrespon');
      }
    } catch (error) {
      console.error(error);
    }
  }

  isMuteCommand() {
    try {
      if (this.m.isCmd && this.m.command.length > 0) {
        if (!this.mute(this.m.chat, this.m)) {
          const exists = Command.run(this.m.command, {
            m: this.m,
            db: this.db,
            conn: this.conn,
            func: this.func,
            store: this.store
          });

          if (!exists && !this.db.config.noCommandNotice) {
            this.m.reply(`Maaf, Perintah ${this.m.command} tidak ditemukan.`);
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  async OpenCommandAsGroup() {
    try {
      if (this.m.isCmd && this.m.command.length > 0) {
        if (this.m.isGroup) {
          if (this.db.group[this.m.chat].openCommandAsGroup) {
            const isSenderInGroup = await this.conn.groupMetadata(this.db.config.storeGID)
              .then((metadata) => metadata.participants.map((participant) => participant.id).includes(this.m.sender));

            if (!isSenderInGroup && this.mute(this.m.chat, this.m)) {
              this.m.reply(`Maaf, Kamu harus bergabung dalam grup terlebih dahulu untuk menggunakan perintah ini.\n\nSilakan bergabung dalam grup untuk mendapatkan akses.\n\n${this.db.config.storeGLink}`);
            }
          } 
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  AntiMedia() {
    try {
      if (this.db.group[this.m.chat]?.antisticker || this.db.group[this.m.chat]?.antiimage || this.db.group[this.m.chat]?.antivideo) {
        if (this.m.type === 'stickerMessage' || this.m.type === 'imageMessage' || this.m.type === 'videoMessage' || this.m.type === 'viewOnceMessageV2') {
          let message = '';
          let warnData = this.db.user[this.m.sender] || {};

          if (this.m.type === 'stickerMessage') {
            message = "Anti stiker diaktifkan di grup ini, Maaf stiker kamu dihapus!";
            warnData.warningSticker = warnData.warningSticker || 0;
          } else if (this.m.type === 'imageMessage') {
            message = "Anti gambar diaktifkan di grup ini, Maaf gambar kamu dihapus!";
            warnData.warningImage = warnData.warningImage || 0;
          } else if (this.m.type === 'videoMessage') {
            message = "Anti video diaktifkan di grup ini, Maaf video kamu dihapus!";
            warnData.warningVideo = warnData.warningVideo || 0;
          } else if (this.m.type === 'viewOnceMessageV2') {
            return;
          }

          if (!(this.m.sender === this.conn.user.jid && this.m.key.fromMe || this.m.isOwner || this.m.isAdmin)) {
            warnData[this.m.sender] = warnData[this.m.sender] || 0;
            if (warnData[this.m.sender] < 5) {
              warnData[this.m.sender]++;
              this.conn.sendMessage(this.m.chat, { delete: this.m.key })
                .then(() => this.conn.sendMessage(this.m.chat, { text: `Maaf @${this.m.sender.split("@")[0]}, Anda telah melanggar aturan anti-stiker/gambar/video sebanyak ${warnData[this.m.sender]} kali. Anda akan dikeluarkan dari grup setelah melanggar 5 kali.`, mentions: [this.m.sender] }));
            } else if (warnData[this.m.sender] === 5) {
              this.conn.sendMessage(this.m.chat, { delete: this.m.key })
                .then(() => this.conn.sendMessage(this.m.chat, { text: `Maaf @${this.m.sender.split("@")[0]}, Anda telah dihapus dari grup karena melanggar aturan anti-stiker/gambar/video sebanyak 5 kali.`, mentions: [this.m.sender] }))
                .then(() => this.conn.groupParticipantsUpdate(this.m.chat, [this.m.sender], 'remove'));
            }
            this.m.reply(message);
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  AutoPost() {
    try {
      if (this.m.sender && this.db.config.auto.post) {
        delay(3000).then(() => {
          this.conn.sendMessage(this.m.sender, {
            text: `Halo kak ${this.m.pushname}, Yuk gabung dengan kami di *${this.db.config.storeName}*, Disini kamu bisa menghasilkan uang lebih cepat dan penjualan kamu juga bakal lebih laris nantinya, Yuk daftar sekarang!\n\nUntuk melakukan pendaftaran kamu cukup melakukan registrasi dengan cara ketik *${this.m.prefix}reg nama toko*\n\nContoh : ${this.m.prefix}reg ${this.db.config.storeName}`,
          })
        })
      }
    } catch (error) {
      console.error(error);
    }
  }

  async AutoBroadcast() {
    try {
      if (this.db.config.autobcgcEnabled) {
        if (this.db.config.autobcText === undefined) {
          return this.m.reply("Text broadcasting belum setel, setel text terlebih dahulu");
        }
        const autobcText = this.db.config.autobcText || '';
        const all = Object.keys(await this.conn.groupFetchAllParticipating());
        for (let id of all) {
          await this.conn.sendMessage(id, { text: autobcText, mentions: [this.m.sender, ...this.func.parseMention(autobcText)] });
          await delay(3000);
        }
        await delay(30 * 60 * 1000);
      }
    } catch (error) {
      console.error(error);
    }
  }

  padEnd(str, length) {
    const spacesToAdd = length - str.length;
    if (spacesToAdd <= 0) {
      return str;
    }
    return str + ' '.repeat(spacesToAdd);
  }

  mute(chatId, m) {
    try {
      if (this.db.group[chatId] && this.db.group[chatId].mute) {
        if (this.m.key.fromMe || this.m.isOwner) {
          return false;
        } else {
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async executeCommand(commandName) {
    try {
      return await Command.call(commandName, { m: this.m, conn: this.conn, db: this.db, func: this.func, store: this.store });
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  colorize(text, color) {
    return this.colors[color] + text + this.colors['reset'];
  }

  logMessage(type, name, content) {
    try {
      const paddedType = type ? this.padEnd(type, 18) : '';
      const paddedName = name ? this.padEnd(name, 28) : '';
      const paddedContent = content ? this.padEnd(content, 39) : '';

      const currentTime = moment().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');
      console.log(
        `${this.colorize('┌─────────────────────┬──────────────────────────────────┐', 'cyan')}\n` +
        `${this.colorize('│', 'cyan')} ${this.colorize(`Type: ${this.padEnd(paddedType, 10)}`, 'yellow')} ${this.colorize(`Name: ${this.padEnd(paddedName, 10)}`, 'yellow')} ${this.colorize('│', 'cyan')} ${this.colorize(`Jam: ${currentTime}`, 'bgGreen')}\n` +
        `${this.colorize('├─────────────────────┼──────────────────────────────────┤', 'cyan')}\n` +
        `${this.colorize('│', 'cyan')} ${this.colorize(`Content: ${paddedContent}`, 'yellow')} ${this.colorize('│', 'cyan')}\n` +
        `${this.colorize('└─────────────────────┴──────────────────────────────────┘', 'cyan')}`
      );
    } catch (error) {
      console.error(error);
    }
  }

  showLog() {
    try {
      if (!this.m.isGroup && this.m.isCmd) {
        this.logMessage('Private Chat', this.m.pushname, this.m.command);
      } else if (this.m.isGroup && this.m.isCmd) {
        this.logMessage('Group Chat', this.m.pushname, this.m.command);
      } else if (!this.m.isGroup && !this.m.isCmd) {
        this.logMessage('Private Chat', this.m.pushName, this.m.body);
      } else if (this.m.isGroup && !this.m.isCmd) {
        this.logMessage('Group Chat', this.m.pushName, this.m.body);
      }
    } catch (error) {
      console.error(error);
    }
  }
}

export { Evacuation };
