import path from 'path';
import http from 'http';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Server as IOServer } from 'socket.io';

const PORT = 3000;
const DEBUG = true;

const Server = {
  services: new Map(),

  getServices: () =>
    Object.fromEntries(
      [...Server.services].map(([key, value]) => [
        key,
        Object.keys(value).filter(
          attr => typeof value[attr] === 'function' && attr !== 'init' && !attr.startsWith('_')
        ),
      ])
    ),

  init: async services => {
    for (let service of services) {
      await service.init(Server);
      Server.services.set(service.name, service);
    }

    Server.app.post(`/getServices`, async (req, res, next) => {
      res.json(Server.getServices());
    });

    for (let [s, fs] of Object.entries(Server.getServices()))
      for (let f of fs) {
        Server.app.post(`/${s}.${f}`, async (req, res) => {
          res.json(
            await Server.services.get(s)[f](
              DEBUG
                ? {
                    id: '342347283748',
                    name: 'Max Mustermann',
                    email: 'max@rptu.de',
                  }
                : {
                    id: req.headers['x-pairwiseid'],
                    name: req.headers['x-displayname'],
                    email: req.headers['x-mail'],
                  },
              req.body
            )
          );
        });
      }
  },

  start: async () => {
    Server.app = express();
    if (DEBUG) Server.app.use(cors());
    Server.server = http.Server(Server.app);
    Server.app.use(bodyParser.json({limit:'10mb'}));
    Server.app.use(express.static('../dist'));

    const res = await Server.server.listen(PORT, '127.0.0.1');
    console.log('listening *:' + PORT);
  },
};

export default Server;
