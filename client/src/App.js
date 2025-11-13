import { reactive, nextTick } from 'vue';

import { io } from 'socket.io-client';
import $ from './Constants.js';

import SvgRenderer from './SvgRenderer.js';

const App = {
  _: reactive({
    connected: false,
    logo: null,
    user: null,
    minified: true,
    templates: [],
  }),

  io: io(':', { maxHttpBufferSize: 20 * 1024 * 1024 }),

  arraysAreEqual: (a, b) => {
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  },

  clone: obj => JSON.parse(JSON.stringify(obj)),

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

  download: async logo => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    document.body.appendChild(svg);

    await SvgRenderer.fromLogo(logo, svg, true);
    await nextTick();

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);

    // Create a Blob from the string
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });

    // Create a temporary download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = logo.id + '.svg';

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    document.body.removeChild(svg);
  },
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
    co_branding: [],
  });
  App._.templates.push({
    time: Date.now(),
    user: null,
    wm: [0, 2, 1, 1],
    t_color: '#000000',
    b_color: '#ffffff',
    show_rptu_text: true,
    co_branding: [],
  });

  const partner = {
    caption0: 'Bezeichnung der Institution',
    caption1: '',
    subcaption0: 'Prof. Dr. Laura Muster',
    subcaption1: '',
    logo: null,
    external: false,
  };

  App._.templates.push({
    time: Date.now(),
    user: null,
    wm: [0, 2, 1, 1],
    t_color: '#000000',
    b_color: '#ffffff',
    show_rptu_text: false,
    co_branding: [App.clone(partner)],
  });

  App._.templates.push({
    time: Date.now(),
    user: null,
    wm: [0, 2, 1, 1],
    t_color: '#000000',
    b_color: '#ffffff',
    show_rptu_text: false,
    co_branding: [App.clone(partner), App.clone(partner)],
  });
}

export default App;
