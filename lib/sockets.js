/* Copyright C Arifi Razzaq 

  This Base Student Was Written By Arifi Razzaq
  Contact My WhatsApp https://wa.me/6283193905842
  Subscribe My YouTube Channel (Arifi Razzaq Ofc)
*/

import { jidDecode, areJidsSameUser, getAggregateVotesInPollMessage } from "@whiskeysockets/baileys";
import PhoneNumber from 'awesome-phonenumber';
import { writeExifImg, imageToWebp } from './exif.js';
import Jimp from 'jimp';

class Sockets {
  constructor(options = {}) {
    this.chats = options.chats || {};
  }

  get chatCount() {
    return Object.keys(this.chats).length;
  }

  async pollUpdate(message, store, m) {
    for (let { key, update } of message) {
      if (message.pollUpdates) {
        let pollCreation = await this.serializeM(store.loadMessage(m.chat, key.id))
        if (pollCreation) {
          let pollMessage = await getAggregateVotesInPollMessage({
            message: pollCreation.message,
            pollUpdates: pollCreation.pollUpdates,
          })
          message.pollUpdates[0].vote = pollMessage
          this.appenTextMessage(message, message.pollUpdates[0].vote || pollMessage.filter((v) => v.voters.length !== 0)[0]?.name, message.message)
        }
      }
    }
  }

  addChat(jid, chatInfo = {}) {
    this.chats[jid] = chatInfo;
  }

  removeChat(jid) {
    if (this.chats[jid]) {
      delete this.chats[jid];
    }
  }

  clearChats() {
    this.chats = {};
  }

  decodeJid(jid) {
    const decode = jidDecode(jid) || {};
    return `${decode.user && decode.server ? `${decode.user}@${decode.server}` : jid}`.trim();
  }

  getChatInfo(jid) {
    return this.chats[jid] || null;
  }

  getChatList() {
    return Object.keys(this.chats);
  }

  async getName(jid = '', withoutContact = false) {
    jid = this.decodeJid(jid);
    withoutContact = this.withoutContact || withoutContact;
    let v;
    if (jid.endsWith('@g.us')) return new Promise(async (resolve) => {
      v = this.user[jid] || {};
      if (!(v.name || v.subject)) v = await this.groupMetadata(jid) || {};
      resolve(v.name || v.subject || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international'));
    });
    else v = jid === '0@s.whatsapp.net' ? { jid, vname: 'WhatsApp' } : areJidsSameUser(jid, this.user.id) ? this.user : (this.user[jid] || {});
    return (withoutContact ? '' : v.name) || v.subject || v.vname || v.notify || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international');
  }

  sendContact(chat, teks, arr = [...[satu = "", dua = "", tiga = ""]], quoted = '', opts = {}) {
    return this.sendMessage(chat, { 
      contacts: { 
        displayName: teks, 
        contacts: arr.map(i => ({ 
          displayName: '', 
          vcard: 'BEGIN:VCARD\n'+'VERSION:3.0\n'+'FN:'+i[0]+'\n'+'ORG:'+i[2]+';\n'+'TEL;type=CELL;type=VOICE;waid='+i[1]+':'+i[1]+'\n'+'END:VCARD' 
        })) 
      }, ...opts
    }, { quoted });
  }

  async sendPoll(jid, name = '', values = [], selectableCount = 1, quoted) {
    this.sendMessage(jid, {
      poll: {
        name,
        values,
        selectableCount
      }
    }, { quoted });
  }

  async sendImageAsSticker(jid, path, quoted, options = {}) {
    let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await this.Function.getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
    let buffer
    if (options && (options.packname || options.author)) {
      buffer = await writeExifImg(buff, options)
    } else {
      buffer = await imageToWebp(buff)
    }
    await this.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted });
    return buffer;
  }
  
  async createHDImage(width, height, color) {
    const image = await Jimp.create(width, height, color);
    return image.getBufferAsync(Jimp.MIME_PNG);
  }
}

export { Sockets }
