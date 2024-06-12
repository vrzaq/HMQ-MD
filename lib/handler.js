/* Copyright C Arifi Razzaq 

  This Base Student Was Written By Arifi Razzaq
  Contact My WhatsApp https://wa.me/6283193905842
  Subscribe My YouTube Channel (Arifi Razzaq Ofc)
*/

import { readdirSync, watch, readFileSync } from 'fs';
import { join } from 'path';
import { db } from './database.js';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);

let importedModule = null;

const file = __filename;

class CommandManager {
  constructor() {
    this.commands = new Map();
    this.patterns = new Map();
    this.showSymbol = db.config.analyzeTag;
    this.isEnabled = db.config.isEnable;
  }

  toggleSymbol(value) {
    this.showSymbol = value;
  }

  toggleAllCommands(value) {
    this.isEnabled = value;
  }
  
  async refreshCacheAndLoader(yourCommandsPath) {
    const path = yourCommandsPath;
    const commandsFolder = readdirSync(path, { withFileTypes: true });

    for (const file of commandsFolder) {
      if (file.isDirectory()) {
        const subcommandsFolder = readdirSync(join(path, file.name));

        for (const subFile of subcommandsFolder) {
          if (subFile.endsWith('.js')) {
            const subcommandPath = join(path, file.name, subFile);
            readFileSync(subcommandPath, 'utf8');
          }
        }
      } else if (file.isFile() && file.name.endsWith('.js')) {
        const commandPath = join(path, file.name);
        readFileSync(commandPath, 'utf8');
      }
    }

    watch(yourCommandsPath, { recursive: true }, (eventType, filename) => {
      if (eventType === 'change') {
        refreshCacheAndLoader(yourCommandsPath);
      }
    });
  }

  create({ name, category, run, description, pattern, function: isFunction, matchText, usage, isOwner = false, isPremium = false, isGroup = false, hidden = false, disabled = !this.isEnabled }) {
    this.commands.set(name, { name, category, run, description, isFunction, matchText, usage, isOwner, isPremium, isGroup, hidden, disabled });
    if (pattern) {
      this.patterns.set(name, pattern);
    }
  }

  async call(name, options) {
    if (!this.isEnabled) return false;
    const command = this.commands.get(name);
    if (command && !command.disabled && command.isFunction) {
      try {
        return await command.run(options);
      } catch (error) {
        console.error(`Error executing command '${name}':`, error);
        return options.m.reply(`Terjadi kesalahan dalam menjalankan perintah. Mohon coba lagi nanti.`);
      }
    } else if (command && !command.disabled) {
      return this.run(name, options);
    }
  }
  
  async reloadCommand(commandName, commandsPath) {
    const path = join(commandsPath, `${commandName}.js`);
    await import(path);
  }

  async reloadPlugins(yourCommandsPath) {
    const commandsFolder = readdirSync(yourCommandsPath, { withFileTypes: true });

    for (const file of commandsFolder) {
      if (file.isFile() && file.name.endsWith('.js')) {
        const commandName = file.name.replace('.js', '');
        await this.reloadCommand(commandName, yourCommandsPath);
      }
    }
  }

  async initCommandsPath(commandsPath) {
    const path = commandsPath;
    const commandsFolder = readdirSync(path, { withFileTypes: true });

    for (const file of commandsFolder) {
      if (file.isDirectory()) {
        const subcommandsFolder = readdirSync(join(path, file.name));

        for (const subFile of subcommandsFolder) {
          if (subFile.endsWith('.js')) {
            const subcommandPath = join(path, file.name, subFile);
            await import(subcommandPath);
          }
        }
      } else if (file.isFile() && file.name.endsWith('.js')) {
        const commandPath = join(path, file.name);
        await import(commandPath);
      }
    }
  }

  async run(name, options) {
    const command = this.commands.get(name);

    if (command && this.isEnabled) {
      try {
        const m = options.m;
        const isOwner = m.isOwner || false;
        const isPremium = m.isPremium || false;
        const isGroup = m.isGroup || false;

        if (command.run) {
          if (command.isFunction) {
            return command.run({ ...options, m: { ...m, isOwner, isPremium, isGroup } });
          } else {
            command.run({ ...options, m: { ...m, isOwner, isPremium, isGroup } });
          }
        }
        return true;
      } catch (error) {
        console.error(`Error executing command '${name}':`, error);
        return false;
      }
    } else {
      return false;
    }
  }

  analyzeRun(run) {
    if (!this.showSymbol) return '';
    
    const regex = /m\.isOwner|m\.isPremium|m\.isGroup|m\.isLimit/g;
    const matches = [...run.toString().matchAll(regex)];

    if (matches.length > 0) {
      if (matches.some(match => match[0] === 'm.isOwner')) {
        return '🅞';
      } else if (matches.some(match => match[0] === 'm.isPremium')) {
        return '🅟';
      } else if (matches.some(match => match[0] === 'm.isGroup')) {
        return '🅖';
      } else if (matches.some(match => match[0] === 'm.isLimit')) {
        return '🅛';
      }
    }

    return '';
  }

  indexMenu(m, caption, user) {
    const categories = new Map();
    let counter = 1;

    for (const item of this.commands.values()) {
      if (!categories.has(item.category)) {
        categories.set(item.category, []);
      }
      categories.get(item.category).push(item);
    }

    const sortedCategories = [...categories.keys()].sort((a, b) => {
      const hasSymbolA = categories.get(a).some(command => this.analyzeRun(command.run) !== '');
      const hasSymbolB = categories.get(b).some(command => this.analyzeRun(command.run) !== '');

      if (hasSymbolA && !hasSymbolB) {
        return -1;
      } else if (!hasSymbolA && hasSymbolB) {
        return 1;
      } else {
        return a.localeCompare(b);
      }
    });

    let text = '';
    for (const category of sortedCategories) {
      const commands = categories.get(category);
      text += `*${category} (${commands.length})*\n`;
      for (const command of commands) {
        const symbol = this.analyzeRun(command.run);
        if (!command.disabled && !command.hidden) {
          text += `  ${counter}. ${m.prefix}${command.name} ${symbol}\n`;
          counter++;
        }
      }
      text += '\n';
    }
    return text;
  }

}

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

export const Command = new CommandManager();
