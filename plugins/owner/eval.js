import { Command } from '../../lib/handler.js';
import { exec } from 'child_process';
import util from 'util';
import path from 'path';
import { readFileSync } from 'fs';
import { createRequire } from 'module';

const dynamicImport = async (modulePath) => {
  const require = createRequire(import.meta.url);
  return await require(modulePath);
};

const inspect = async (obj) => {
  return util.inspect(obj, { depth: 0 });
};

const format = async (str) => {
  return str.toString();
};

Command.create({
  name: 'eval',
  category: 'owner',
  hidden: true,
  async run({ m, conn, db, func, store }) {
    if (m.isOwner || m.key.fromMe) {
      if (m.body.toLowerCase().startsWith('>')) {
        if (!m.query)
          return m.reply(
            'Hanya kode JavaScript (eval kosong - gunakan eval dalam cakupan Nodejs dengan tipe ESMODULE)'
          );

        let evaluate;
        try {
          const requireFn = async (modulePath) => {
            const module = await dynamicImport(modulePath);
            return module;
          };

          const sandbox = { require: requireFn };

          evaluate = await eval(`(async () => { ${m.query} })()`);
          if (typeof evaluate !== 'string') evaluate = await inspect(evaluate);
        } catch (err) {
          evaluate = err.stack.toString();
        }

        await m.reply(await format(evaluate));
      } else if (m.body.toLowerCase().startsWith('=>')) {
        if (!m.query)
          return m.reply(
            'Hanya kode JavaScript (eval kosong - gunakan eval dalam cakupan Nodejs dengan tipe ESMODULE)'
          );

        let evaluate;
        try {
          const requireFn = async (modulePath) => {
            const module = await dynamicImport(modulePath);
            return module;
          };

          const sandbox = { require: requireFn };

          evaluate = await eval(`${m.query}`);
          if (typeof evaluate !== 'string') evaluate = await inspect(evaluate);
        } catch (err) {
          evaluate = err.stack.toString();
        }

        await m.reply(await format(evaluate));
      } else if (m.body.toLowerCase().startsWith('$')) {
        if (!m.query)
          return m.reply('Hanya kode exec (membaca kode terminal, mis. proses)');

        exec(m.query, async (err, stdout) => {
          if (err) return m.reply(`${err}`);
          if (stdout) {
            return m.reply(`${stdout}`);
          }
        });
      }
    }
  },
  description: 'Menjalankan JavaScript secara langsung.',
  pattern: /^!eval$/i,
  isFunction: true,
  cooldown: 0
});
