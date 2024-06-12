class GroupEvents {
  constructor(events, conn, db) {
    this.events = events;
    this.conn = conn;
    this.db = db;
  }

  async handleGroupParticipantsUpdate() {
    try {
      const { id, participants, action } = await this.events["group-participants.update"];
      const metadata = await this.conn.groupMetadata(id);
      
      if (!this.db.group[id]) {
        this.initializeGroupConfig(id);
      }

      for (const jid of participants) {
        try {
          var profile = await this.conn.profilePictureUrl(jid, "image", 3000);
        } catch {
          var profile = "https://lh3.googleusercontent.com/proxy/esjjzRYoXlhgNYXqU8Gf_3lu6V-eONTnymkLzdwQ6F6z0MWAqIwIpqgq_lk4caRIZF_0Uqb5U8NWNrJcaeTuCjp7xZlpL48JDx-qzAXSTh00AVVqBoT7MJ0259pik9mnQ1LldFLfHZUGDGY=w1200-h630-p-k-no-nu";
        }

        let messageConfig = {};

        if (action == "add" && this.db.group[id]?.welcome) {
          messageConfig = {
            mode: this.db.group[id].welcome.mode,
            message: this.db.group[id].welcome.message.replace(/@user/g, `${await this.conn.getName(jid)} (@${jid.split("@")[0]})`).replace(/@groupname/g, metadata.subject),
            title: this.db.group[id].welcome.title,
          };
        } else if (action == "remove" && this.db.group[id]?.remove) {
          messageConfig = {
            mode: this.db.group[id].remove.mode,
            message: this.db.group[id].remove.message.replace(/@user/g, `${await this.conn.getName(jid)} (@${jid.split("@")[0]})`).replace(/@groupname/g, metadata.subject),
            title: this.db.group[id].remove.title,
          };
        } else if (action == "promote" && this.db.group[id]?.promote) {
          messageConfig = {
            mode: this.db.group[id].promote.mode,
            message: this.db.group[id].promote.message.replace(/@user/g, `${await this.conn.getName(jid)} (@${jid.split("@")[0]})`).replace(/@groupname/g, metadata.subject),
            title: this.db.group[id].promote.title,
          };
        } else if (action == "demote" && this.db.group[id]?.demote) {
          messageConfig = {
            mode: this.db.group[id].demote.mode,
            message: this.db.group[id].demote.message.replace(/@user/g, `${await this.conn.getName(jid)} (@${jid.split("@")[0]})`).replace(/@groupname/g, metadata.subject),
            title: this.db.group[id].demote.title,
          };
        }

        if (messageConfig.mode) {
          const text = messageConfig.message;
          if (text) {
            await this.conn.sendMessage(id, {
              text: text,
              contextInfo: {
                mentionedJid: [jid],
                externalAdReply: {
                  title: messageConfig.title,
                  mediaType: 1,
                  previewType: 0,
                  renderLargerThumbnail: true,
                  thumbnailUrl: profile,
                  sourceUrl: this.db.config?.homepage,
                },
              },
            });
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  initializeGroupConfig(id) {
    if (this.db.group[id]) {
      return; // Configuration already initialized
    }
    this.db.group[id] = {
      welcome: {
        title: "Selamat Datang",
        mode: false,
        message: `Halo @user, Selamat datang dalam grup *@groupname*.\n\n*Kartu Intro:*\nNama: \nUmur: \nStatus: \nAsal Kota: \nSuku: \nInstagram: `,
      },
      remove: {
        title: "Keluar",
        mode: false,
        message: ` pengguna @user, telah keluar dalam grup *@groupname*`,
      },
      promote: {
        title: "Promote",
        mode: false,
        message: ` pengguna @user, kini menjadi admin grup *@groupname*`,
      },
      demote: {
        title: "Demote",
        mode: false,
        message: ` pengguna @user, sudah bukan admin grup *@groupname* lagi`,
      },
    };
  }
}

export { GroupEvents as CustomGroupEvents };
