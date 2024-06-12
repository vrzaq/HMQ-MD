import { Command } from '../../lib/handler.js';
import { readFileSync } from 'fs';
import os from 'os';
import moment from 'moment-timezone';

Command.create({
  name: 'menu',
  category: 'other',
  description: ' menampilkan daftar perintah pada bot',
  async run({ m, db, conn, func }) {
    const expNeeded = expNeededForNextLevel(db.user[m.sender].level);
    const currentTime = moment().tz('Asia/Jakarta').locale('id').format('dddd, D MMMM YYYY HH:mm:ss');
    const productLength = db.user[m.sender].product ? db.user[m.sender].product.length : 0;
        
    let widget = `Server: ` + os.hostname() + '\n' +
      `Platform: ` + os.platform() + `\n` +
      `\n${db.config.styleMenu['prefix']} *GAME RPG INFO*\n` +
      `${db.config.styleMenu['line']} Total Pengguna: ${formatAngka(Object.keys(db.user).length)}\n` +
      `${db.config.styleMenu['line']} Level: ${db.user[m.sender].level} > ${db.user[m.sender].level + 1}\n` +
      `${db.config.styleMenu['line']} Exp: ${formatAngka(db.user[m.sender].exp)} / ${await formatAngka(expNeeded)}\n` +
      `${db.config.styleMenu['line']} Rank: ${db.user[m.sender].rank}\n` +
      `${db.config.styleMenu['closing']}\n` +
      `\n${db.config.styleMenu['prefix']} *STORE INFO*\n` +
      `${db.config.styleMenu['line']} Uang: Rp${formatRupiah(db.user[m.sender].balance)}\n`;
      
    widget += `${db.config.styleMenu['line']} Produk: ${productLength === 0 ? 0 : formatAngka(productLength)}\n` + 
      `${db.config.styleMenu['closing']}\n\n`;

    let text = `*LIST MENU*\n`;
    text += await Command.indexMenu(m, '\n\n');
    return m.reply(widget + text)
  }
})

function expNeededForNextLevel(level) {
  return Math.floor(100 * Math.pow(1.5, level)); // Contoh: setiap level memerlukan 100 * 1.5^level exp tambahan
}

function formatRupiah(angka) {
  let reverse = angka.toString().split('').reverse().join('');
  let ribuan = reverse.match(/\d{1,3}/g);
  let result = ribuan.join('.').split('').reverse().join('');
  return result;
}

function formatAngka(angka) {
  const satuan = ['', 'RB', 'JT', 'M', 'T'];
  const ukuranSatuan = 3;
  const angkaString = angka.toString().replace(/\./g, '');

  let hasil = '';
  let index = angkaString.length % ukuranSatuan || ukuranSatuan;
  let i = 0;

  while (index <= angkaString.length) {
    if (hasil) hasil = '.' + hasil;
    hasil = angkaString.substring(index - ukuranSatuan, index) + hasil;
    if (angkaString.substring(index, index + 3) && i < satuan.length - 1) hasil += ` ${satuan[i]}`;
    index += ukuranSatuan;
    i++;
  }

  return hasil.trim();
}
