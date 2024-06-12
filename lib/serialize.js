/* Copyright C Arifi Razzaq 

  This Base Student Was Written By Arifi Razzaq
  Contact My WhatsApp https://wa.me/6283193905842
  Subscribe My YouTube Channel (Arifi Razzaq Ofc)
*/

import { getContentType, downloadContentFromMessage, jidNormalizedUser } from "@whiskeysockets/baileys";
import { existsSync, promises } from 'fs';
import { func } from './function.js';
import { db } from './database.js';

let proto;

try {
  proto = (await import("@whiskeysockets/baileys")).default.proto;
} catch {
  console.error("Baileys Not installed! please install with command: npm install '@whiskeysockets/baileys'");
}

export default class serialize {
  constructor (message, conn) {
    this.key = message.key;
    this.messageTimestamp = message.messageTimestamp;
    this.message = message.message;
    this.pushname = message.pushName;
    if (this.key) {
      this.id = this.key.id;
      this.isBaileys = this.id.length === 16 || this.key.id.startsWith('3EB0') || this.key.id.startsWith('BAE5');
      this.fromMe = this.key.fromMe;
      this.isGroup = this.key?.remoteJid.endsWith("@g.us");
      this.chat = conn.decodeJid(this.key?.remoteJid || (this.key?.remoteJid && this.key?.remoteJid !== "status@broadcast") || "");
      this.sender = conn.decodeJid((this.key?.fromMe && conn?.user.id) || this.participant || this.key.participant || this.chat || "");
    }
    if (this.message) {
      if (this.message?.messageContextInfo) delete this.message.messageContextInfo;
      if (this.message?.senderKeyDistributionMessage) delete this.message.senderKeyDistributionMessage;
      this.type = getContentType(this.message);
      if (this.type === "ephemeralMessage") {
        this.message = this.message[this.type].message;
        const tipe = Object.keys(this.message)[0];
        this.type = tipe;
        if (tipe === "viewOnceMessageV2") {
          this.message = this.message[this.type].message;
          this.type = getContentType(this.message);
        }
      }
      if (this.type === "viewOnceMessageV2") {
        this.message = this.message[this.type].message;
        this.type = getContentType(this.message);
      }
      this.mentions = this.message[this.type]?.contextInfo ? this.message[this.type]?.contextInfo.mentionedJid : null;
      try {
        const quoted = this.message[this.type]?.contextInfo;
        if (quoted.quotedMessage["ephemeralMessage"]) {
          const tipe = Object.keys(quoted.quotedMessage.ephemeralMessage.message)[0];
          if (tipe === "viewOnceMessageV2") {
            this.quoted = {
              type: "view_once",
              stanzaId: quoted.stanzaId,
              participant: conn.decodeJid(quoted.participant),
              message: quoted.quotedMessage.ephemeralMessage.message.viewOnceMessageV2.message,
            };
          } else {
            this.quoted = {
              type: "ephemeral",
              stanzaId: quoted.stanzaId,
              participant: conn.decodeJid(quoted.participant),
              message: quoted.quotedMessage.ephemeralMessage.message,
            };
          };
        } else if (quoted.quotedMessage["viewOnceMessageV2"]) {
          this.quoted = {
            type: "view_once",
            stanzaId: quoted.stanzaId,
            participant: conn.decodeJid(quoted.participant),
            message: quoted.quotedMessage.viewOnceMessageV2.message,
          };
        } else {
          this.quoted = {
            type: "normal",
            stanzaId: quoted.stanzaId,
            participant: conn.decodeJid(quoted.participant),
            message: quoted.quotedMessage,
          };
        };
        this.quoted.fromMe = this.quoted.participant === conn.decodeJid(conn.user.id);
        this.quoted.type = Object.keys(this.quoted.message).filter((v) => v.includes("Message") || v.includes("conversation"))[0];
        this.quoted.text = this.quoted.message[this.quoted.type]?.text || this.quoted.message[this.quoted.type]?.description || this.quoted.message[this.quoted.type]?.caption || this.quoted.message[this.quoted.type]?.hydratedTemplate?.hydratedContentText || this.quoted.message[this.quoted.type]?.editedMessage?.extendedTextMessage?.text || this.quoted.message[this.quoted.type] || "";
        this.quoted.key = {
          id: this.quoted.stanzaId,
          fromMe: this.quoted.fromMe,
          remoteJid: this.chat,
        };
        let M = proto.WebMessageInfo;
        let vM = this.quoted.fakeObj = M.fromObject({
          key: {
            remoteJid: this.quoted.key.remoteJid,
            fromMe: this.quoted.key.fromMe,
            id: this.quoted.key.id
          },
          message: quoted,
          ...(this.isGroup ? { participant: this.quoted.participant } : {})
        });
        this.quoted.isBot = this.quoted.key.id ? (this.quoted.key.id.startsWith("BAE5") || this.quoted.key.id.startsWith("30EB")) && this.quoted.key.id.length < 31 : false;
        this.quoted.delete = () => conn.sendMessage(this.chat, { delete: vM.key });
        this.quoted.download = (pathFile) => this.downloadMedia(this.quoted.message, pathFile);
        this.quoted.react = (text) => conn.sendMessage(this.chat, { 
          react: { 
            text, 
            key: this.quoted.key 
          } 
        });
      } catch {
        this.quoted = null;
      }
      this.body = this.type == 'conversation' ? this.message.conversation : 
        this.type == 'imageMessage' ? this.message.imageMessage?.caption : 
        this.type == 'videoMessage' ? this.message.videoMessage?.caption : 
        this.type == 'extendedTextMessage' ? this.message.extendedTextMessage?.text : 
        this.type == 'buttonResponseMessage' ? this.message.buttonsResponseMessage?.selectedButtonId : 
        this.type == 'listResponseMessage' ? this.message.listResponseMessage?.singleSelectReply?.selectedRowId : 
        this.type == 'templateButtonReplyMessage' ? this.message.templateButtonReplyMessage?.selectedId : 
        this.type == 'pollCreationMessageV3' ? this.message.pollCreationMessage?.name :
      '';
      if (db.config.prefix.multiPrefx) {
        this.prefix = /^[°•π÷×¶∆£¢€¥®™✓_=|~!?#$%^&.+-,\/\\©^]/.test(this.body) ? this.body.match(/^[°•π÷×¶∆£¢€¥®™✓_=|~!?#$%^&.+-,\/\\©^]/gi) : db.config.prefix.singlePrefix;
      } else { 
        if (db.config.prefix.noPrefix) {
          this.prefix = ''
        } else {
          this.prefix = db.config.prefix.singlePrefix;
        };
      };
      this.args = this.body.trim().split(/ +/).slice(1);
      this.query = this.args.join(" ");
      this.isCmd = this.body.startsWith(this.prefix);
      this.command = this.isCmd ? this.body.slice(1).trim().split(/ +/).shift().toLowerCase() : undefined;
      this.smsg = this.quoted ? this.quoted : this;
      this.mime = (this.smsg?.msg || this.smsg)?.mimetype || this.smsg?.mediaType || "";
      this.validGroup = (id, array) => {
        for (var i = 0; i <array.length; i++) {
          if (array[i]==id) {
            return !0
          };
        };
        return !1
      };
      this.download = (pathFile) => this.downloadMedia(this.message, pathFile);
      this.react = (text) => conn.sendMessage(this.chat, { 
        react: { 
          text, 
          key: this.key 
        } 
      });
      this.reply = (text) => {
        conn.sendMessage(this.chat, { text, mentions: [func.parseMention(text)] }, { quoted: this.smsg })
      };
    }
    
    return this
  }

  async downloadMedia(message, pathFile) {
    const type = Object.keys(message)[0];
    const mimeMap = {
      imageMessage: "image",
      videoMessage: "video",
      stickerMessage: "sticker",
      documentMessage: "document",
      audioMessage: "audio",
    };
    try {
      if (pathFile) {
        const stream = await downloadContentFromMessage(message[type], mimeMap[type]);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        };
        await promises.writeFile(pathFile, buffer);
        return pathFile;
      } else {
        const stream = await downloadContentFromMessage(message[type], mimeMap[type]);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        };
        return buffer;
      };
    } catch (e) {
      Promise.reject(e);
    };
  };
};
