import { reactive, nextTick } from 'vue';

import { io } from 'socket.io-client';
import $ from './Constants.js';

import default_sub_logo from './assets/default_sub_logo.js';

const App = {
  _: reactive({
    connected: false,
    logo: null,
    user: null,
    templates: [],
  }),

  io: io(':4000', { maxHttpBufferSize: 20 * 1024 * 1024 }),

  arraysAreEqual: (a, b) => {
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  },

  clone: obj => {
    const clone = JSON.parse(JSON.stringify(obj));
    if (typeof clone === 'object' && clone.hasOwnProperty('id')) clone.id = crypto.randomUUID();
    return clone;
  },

  debounce: (callback, wait) => {
    let timeoutId = null;
    return (...args) => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        callback(...args);
      }, wait);
    };
  },

  wait: time => new Promise(resolve => setTimeout(resolve, time)),
};

App.io.on('connect', async () => {
  // Init Services
  const services = await App.io.a_emit('getServices');
  for (const name in services) {
    const service = {
      listeners: {},
      on: (event, listener) => {
        if (!service.listeners[event]) service.listeners[event] = [];
        service.listeners[event].push(listener);
      },
      off: (event, listener) => {
        if (!service.listeners[event]) return;
        const index = service.listeners[event].indexOf(listener);
        if (index !== -1) service.listeners[event].splice(index, 1);
      },
      trigger: (event, data) => {
        service.listeners[event]?.forEach(listener => listener(...data));
      },
    };
    for (let func of services[name]) service[func] = async (...args) => await App.io.a_emit(name + '.' + func, args);
    App.io.on(name, (...args) => App[name].trigger(args[0], args.slice(1)));
    App[name] = service;
  }

  App._.connected = true;
});
App.io.on('disconnect', () => (App._.connected = false));

App.io.a_emit = (name, params) => {
  return new Promise((res, rej) => {
    App.io.emit(name, params, res);
  });
};

// templates

{
  App._.templates.push({
    time: Date.now(),
    user: null,
    wm: [1, 1, 1, 1],
    t_color: '#000000',
    b_color: '#ffffff',
    show_rptu_text: false,
    internal: [],
    external: [],
  });
  App._.templates.push({
    time: Date.now(),
    user: null,
    wm: [0, 2, 1, 1],
    t_color: '#000000',
    b_color: '#ffffff',
    show_rptu_text: true,
    internal: [],
    external: [],
  });

  const internal = {
    caption0: 'Bezeichnung der Institution',
    caption1: '',
    subcaption0: 'Prof. Dr. Laura Muster',
    subcaption1: '',
    logo: default_sub_logo,
  };

  App._.templates.push({
    time: Date.now(),
    user: null,
    wm: [0, 2, 1, 1],
    t_color: '#000000',
    b_color: '#ffffff',
    show_rptu_text: false,
    internal: [internal],
    external: [],
  });

  App._.templates.push({
    time: Date.now(),
    user: null,
    wm: [0, 2, 1, 1],
    t_color: '#000000',
    b_color: '#ffffff',
    show_rptu_text: false,
    internal: [internal, internal],
    external: [],
  });
}

export default App;
