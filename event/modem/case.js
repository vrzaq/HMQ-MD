class CASE {
  constructor({ m, db, conn, func, store }) {
    this.m = m;
    this.db = db;
    this.conn = conn;
    this.func = func;
    this.store = store;
  }

  async online() {
    try {
      switch (this.m.command) {
        case "test": {
          if (this.m.args[0] === 'case') {
            const responses = [
              'hello i am case',
              'nice to meet you, i am case',
              'how can i help you? i am case'
            ];
            const randomIndex = Math.floor(Math.random() * responses.length);
            return this.m.reply(responses[randomIndex]);
          }
        }
        break;
      }
    } catch (error) {
      console.error(error);
    }
  }
}

export { CASE };
