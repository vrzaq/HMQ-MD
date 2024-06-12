/* Copyright C Arifi Razzaq 

  This Base Student Was Written By Arifi Razzaq
  Contact My WhatsApp https://wa.me/6283193905842
  Subscribe My YouTube Channel (Arifi Razzaq Ofc)
*/

import pino from 'pino';
import NodeCache from "node-cache";
import { 
  makeInMemoryStore, 
  jidNormalizedUser
} from '@whiskeysockets/baileys';

export const logger = pino({ level: "silent", stream: "store" }).child({ level: "silent" });
export const store = makeInMemoryStore(logger);

function options(pairingCode, useMobile) {
  this.logger = logger;
  this.printQRInTerminal = !pairingCode;
  this.mobile = useMobile;
  this.browser = ['Linux', 'Chrome', ''];
  this.msgRetryCounterCache = new NodeCache();
  this.defaultQueryTimeoutMs = undefined;
  this.markOnlineOnConnect = false;
  this.generateHighQualityLinkPreview = true;
}

options.prototype.getMessage = async function (key) {
  const jid = jidNormalizedUser(key.remoteJid);
  const msg = await store.loadMessage(jid, key.id);
  return msg?.message || "";
};

options.prototype.patchMessageBeforeSending = function (message) {
  const requiresPatch = !!(message.buttonsMessage || message.templateMessage || message.listMessage);
  if (requiresPatch) {
    message = { viewOnceMessage: { message: { messageContextInfo: { deviceListMetadataVersion: 2, deviceListMetadata: {} }, ...message } } };
  }
  return message;
};

export default options;
