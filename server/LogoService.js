import { promises as fs } from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';

const isAdmin = user => ['jonas.lukasczyk@rptu.de'].includes(user.email);

const LogoService = {
  name: 'LogoService',

  _dbAll: async (sql, params) => {
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

  _dbRun: async (sql, params) => {
    return await new Promise((resolve, reject) => {
      LogoService.db.run(sql, params, err => {
        if (err) {
          console.error(err);
          reject();
        } else resolve();
      });
    });
  },

  updateLogo: async (user, logo) => {
    await LogoService._dbRun(`REPLACE INTO logos (id,time,email,data) VALUES (?,?,?,?)`, [
      logo.id,
      logo.time,
      logo.user.email,
      JSON.stringify(logo),
    ]);
    return true;
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
      external_partners: false,
    };
    return logo;
  },

  deleteLogo: async (user, { id }) => {
    await LogoService._dbRun(`DELETE FROM logos WHERE id=?`, [id]);
    return true;
  },

  toggleVerification: async (user, { logo }) => {
    if (!isAdmin(user)) return;
    logo.verified = !logo.verified;
    await LogoService.updateLogo(logo);
    return true;
  },

  getLogos: async user => {
    let data = null;
    if (isAdmin(user)) data = await LogoService._dbAll(`SELECT data FROM logos`, []);
    else data = await LogoService._dbAll(`SELECT data FROM logos WHERE email=?`, [user.email]);
    return data.map(i => JSON.parse(i.data));
  },

  createLogoTable: async () => {
    await LogoService._dbRun(
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
    await LogoService._dbRun(`DROP TABLE IF EXISTS logos`, []);
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

    //    await LogoService.dropLogoTable();
    await LogoService.createLogoTable();
  },
};

export default LogoService;
