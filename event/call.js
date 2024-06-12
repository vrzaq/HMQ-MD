export class CallOn {
  constructor ({
    conn, 
    m, 
    db
  }) {
    this.conn = conn;
    this.m = m;
    this.db = db;
  };
  start () {
    if(this.m.status == "offer") {
      this.conn.rejectCall(this.m.key.id, this.m.chat);
    };
  };
};