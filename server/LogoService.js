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
          for(let r of rows)
            if(r.hasOwnProperty('recipe'))
              r.recipe = JSON.parse(r.recipe);
          resolve(rows);
        }
      });
    });
  },

  dbRun: async (sql, params) => {
    console.log(sql,params)
    return await new Promise((resolve, reject) => {
      LogoService.db.run(sql, params, err => {
        if (err) {
          console.error(err);
          reject();
        } else resolve();
      });
    });
  },

  newLogo: async user => {
    const recipe = {
      time: Date.now(),
      user: user,
      wm: [0, 2, 1, 1],
      t_color: '#000000',
      b_color: '#ffffff',
      show_rptu_text: true,
      internal:[
        false,
        'Bezeichnung der Institution',
        'Prof. Dr. Laura Muster',
        null
      ],
    };
    await LogoService.dbRun(`INSERT INTO logos ('time','email','recipe') VALUES (?,?,?)`, [
      recipe.time,
      user.email,
      JSON.stringify(recipe, null, 2),
    ]);
    return (await LogoService.dbAll(`SELECT * FROM logos ORDER BY id DESC LIMIT 1`))[0];
  },

  createLogoTable: async () => {
    await LogoService.dbRun(
      `
      CREATE TABLE IF NOT EXISTS logos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          time INTEGER,
          email TEXT,
          recipe TEXT
        )
    `,
      []
    );
  },

  dropLogoTable: async () => {
    await LogoService.dbRun(`DROP TABLE logos`, []);
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

    await LogoService.dropLogoTable();
    await LogoService.createLogoTable();
  },
};

export default LogoService;
