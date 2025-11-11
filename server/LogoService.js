import { promises as fs } from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';

const LogoService = {
  name: 'LogoService',

  dbAll: async (sql, params) => {
    return await new Promise((resolve, reject) => {
      LogoService.db.all(sql, params, (err, rows) => {
        if (err) {
          console.error(err);
          resolve([]);
        } else {
          for (let r of rows) if (r.hasOwnProperty('logo')) r.logo = JSON.parse(r.logo);
          resolve(rows);
        }
      });
    });
  },

  dbRun: async (sql, params) => {
    console.log(sql, params);
    return await new Promise((resolve, reject) => {
      LogoService.db.run(sql, params, err => {
        if (err) {
          console.error(err);
          reject();
        } else resolve();
      });
    });
  },

  updateLogo: async logo => {
    await LogoService.dbRun(`UPDATE logos SET data=? WHERE id=?`, [JSON.stringify(logo), logo.id]);
  },

  newLogo: async user => {
    const logo = {
      id: Date.now(),
      time: Date.now(),
      user: user,
      wm: [0, 2, 1, 1],
      t_color: '#000000',
      b_color: '#ffffff',
      show_rptu_text: true,
      co_branding: [],
      verified: false,
    };
    await LogoService.dbRun(`INSERT INTO logos ('id','time','email','data') VALUES (?,?,?,?)`, [
      logo.id,
      logo.time,
      user.email,
      JSON.stringify(logo),
    ]);
    return logo;
  },

  deleteLogo: async id => {
    await LogoService.dbRun(`DELETE FROM logos WHERE id=?`, [id]);
  },

  getLogos: async user => {
    let data = null;
    if (user.email === 'admin@rptu.de') data = await LogoService.dbAll(`SELECT data FROM logos`, []);
    else data = await LogoService.dbAll(`SELECT data FROM logos WHERE email=?`, [user.email]);
    return data.map(i => JSON.parse(i.data));
  },

  createLogoTable: async () => {
    await LogoService.dbRun(
      `
      CREATE TABLE IF NOT EXISTS logos (
          id INTEGER PRIMARY KEY,
          time INTEGER,
          email TEXT,
          data TEXT
        )
    `,
      []
    );
  },

  dropLogoTable: async () => {
    await LogoService.dbRun(`DROP TABLE IF EXISTS logos`, []);
    // await fs.rm(`./data/`,{recursive:true,force:true});
    // await fs.mkdir(`./data/`,{recursive:true});
  },

  init: async server => {
    console.log('init logo service');
    LogoService.db = new sqlite3.Database('logo.db', err => {
      if (err) {
        console.error('Error opening database', err.message);
      } else {
        console.log('Connected to logo.db');
      }
    });

    // await LogoService.dropLogoTable();
    await LogoService.createLogoTable();
  },
};

export default LogoService;
