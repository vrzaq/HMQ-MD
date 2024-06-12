import { createServer } from 'http';
import { spawn } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { watchFile, unwatchFile } from 'fs';
import cron from 'node-cron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let startTime = new Date();

createServer((req, res) => {
  console.log(`Permintaan baru di ${req.url}!`);
  res.write('Yo!');
  res.end();
}).listen(8080);

function start() {
  const args = [join(__dirname, 'main.js'), ...process.argv.slice(2)];
  const p = spawn(process.argv[0], args, { stdio: ['inherit', 'inherit', 'inherit', 'ipc'] })
    .on('message', (data) => {
      if (data === 'reset') {
        console.log('Merestart . . .');
        p.kill();
        start();
      }
    })
    .on('exit', (_, code) => {
      if (code !== 0) start();
      watchFile(args[0], () => {
        unwatchFile(args[0]);
        start();
      });
    });
}

start();