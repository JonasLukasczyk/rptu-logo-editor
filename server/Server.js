import path from 'path';
import http from 'http';
import https from 'https';
import express from 'express';
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
    if (DEBUG) {
      Server.io = new IOServer(Server.server, {
        cors: {
          origin: `http://localhost:5173`,
          methods: ['GET', 'POST'],
        },
        maxHttpBufferSize: 20 * 1024 * 1024,
      });
    } else {
      Server.io = new IOServer(Server.server, {
        maxHttpBufferSize: 20 * 1024 * 1024,
      });
    }

    Server.io.use((socket, next) => {
      const user = socket.request.headers['x-user'];
      if (!user) {
        if (DEBUG) {
          socket.user = {
            id: '342347283748',
            name: 'Max Mustermann',
            email: 'max@rptu.de',
          };
        } else {
          return next(new Error('unauthorized'));
        }
      } else {
        socket.user = {
          id: socket.request.headers['x-pairwiseid'],
          name: socket.request.headers['x-displayname'],
          email: socket.request.headers['x-mail'],
        };
      }
      next();
    });

    Server.io.on('connect', socket => {
      console.log(socket.user);

      socket.on('getUser', (_, ack) => ack(socket.user));
      socket.on('getServices', (_, ack) => ack(Server.getServices()));
      const services = Server.getServices();
      for (let s in services) {
        const service = Server.services.get(s);
        for (let f of services[s]) {
          socket.on(s + '.' + f, async (args, ack) => {
            ack(await service[f](...args, socket, Server.io));
          });
        }
      }
    });

    for (let service of services) {
      await service.init(Server);
      Server.services.set(service.name, service);
    }

    console.log(Server.getServices());
  },

  start: async () => {
    Server.app = express();
    Server.server = http.Server(Server.app);

    Server.app.use(express.static('../dist'));

    const res = await Server.server.listen(PORT, '127.0.0.1');
    console.log('listening *:' + PORT);
  },
};

export default Server;
