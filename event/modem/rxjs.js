import { empty, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

class RXJS {
  constructor({ m, db, conn, func, store }) {
    this.m = m;
    this.db = db;
    this.conn = conn;
    this.func = func;
    this.store = store;
  }

  handler() {
    return of(this.m.command).pipe(
      switchMap(command => {
        try {
          switch (command) {
            case 'test':
              if (this.m.args[0] === 'rxjs') {
                return this.handleRxjsCommand();
              }
            default:
              return empty();
          }
        } catch (error) {
          console.error(error);
          return empty();
        }
      })
    );
  }

  handleRxjsCommand() {
    try {
      const responses = [
        'hello i am rxjs',
        'nice to meet you, i am rxjs',
        'how can i help you? i am rxjs'
      ];
      const randomIndex = Math.floor(Math.random() * responses.length);
      return of(responses[randomIndex]);
    } catch (error) {
      console.error(error);
      return empty();
    }
  }

  online() {
    try {
      if (this.m.command) {
        this.handler().subscribe(result => {
          try {
            this.m.reply(result);
          } catch (error) {
            console.error(error);
          }
        });
      }
    } catch (error) {
      console.error(error);
    }
  }
}

export { RXJS };
