import { reactive, nextTick } from 'vue';

import { io } from 'socket.io-client';
import $ from './Constants.js';

import SvgRenderer from './SvgRenderer.js';

const DEBUG = false;

const App = {
  _: reactive({
    connected: false,
    logo: null,
    logos: [],
    user: null,
    minified: true,
    templates: [],
  }),

	io: DEBUG ? io(':3000',{ maxHttpBufferSize: 20 * 1024 * 1024 }) : io({ path: '/app/socket.io', maxHttpBufferSize: 20 * 1024 * 1024 }),

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

  logoToSvg: async logo => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    document.body.appendChild(svg);
    await SvgRenderer.fromLogo(logo, svg, true, true);
    document.body.removeChild(svg);
    return svg;
  },

  toBlob: svg => {
    const serializer = new XMLSerializer();

    if (!svg.hasAttribute('xmlns')) svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    if (!svg.hasAttribute('xmlns:xlink')) svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

    const svgString = serializer.serializeToString(svg);
    return new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  },

  blobToRaster: (blob, width, height, toBlob, format = 'png', quality = 0.92) => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';

        if (toBlob) {
          canvas.toBlob(
            blob => {
              URL.revokeObjectURL(url);
              resolve(blob);
            },
            mimeType,
            format === 'jpeg' ? quality : undefined
          );
        } else {
          const pngDataUrl = canvas.toDataURL(mimeType, format === 'jpeg' ? quality : undefined);
          URL.revokeObjectURL(url);
          resolve(pngDataUrl);
        }
      };

      img.onerror = e => {
        reject(e);
        URL.revokeObjectURL(url);
      };
      img.src = url;
    });
  },

  download: async (name, blob) => {
    console.log(name, blob);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = name;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      URL.revokeObjectURL(link.href);
      document.body.removeChild(link);
    }, 100);
  },

  downloadMaster: async (logo, format, quality) => {
    const svg = await App.logoToSvg(logo);
    const blob = App.toBlob(svg);
    let exportBlob = blob;
    if (format !== 'svg') {
      const box = svg.viewBox.baseVal;
      const width = box.width - box.x;
      const height = box.height - box.y;
      const scale = 2;
      exportBlob = await App.blobToRaster(blob, scale * width, scale * height, true, format, quality);
    }
    App.download(logo.id + '.' + format, exportBlob);
  },
};

App.io.on('connect', async () => {
  // Init Services
  App._.user = await App.io.a_emit('getUser');
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
App.io.on('logo_deleted', id => {
  const idx = App._.logos.findIndex(l => l.id === id);
  if (idx >= 0) App._.logos.splice(idx, 1);
});
App.io.on('logo_updated', logo => {
  for (let l of App._.logos)
    if (l.id === logo.id) {
      for (let k of Object.keys(logo)) l[k] = logo[k];
    }
});

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
    external_partners: false,
  });
  App._.templates.push({
    time: Date.now(),
    user: null,
    wm: [0, 2, 1, 1],
    t_color: '#000000',
    b_color: '#ffffff',
    show_rptu_text: true,
    co_branding: [],
    external_partners: false,
  });

  const partner = {
    caption0: 'Bezeichnung der Institution',
    caption1: '',
    subcaption0: 'Prof. Dr. Laura Muster',
    subcaption1: '',
    logo: null,
  };

  App._.templates.push({
    time: Date.now(),
    user: null,
    wm: [0, 2, 1, 1],
    t_color: '#000000',
    b_color: '#ffffff',
    show_rptu_text: false,
    co_branding: [App.clone(partner)],
    external_partners: false,
  });

  App._.templates.push({
    time: Date.now(),
    user: null,
    wm: [0, 2, 1, 1],
    t_color: '#000000',
    b_color: '#ffffff',
    show_rptu_text: false,
    co_branding: [App.clone(partner), App.clone(partner)],
    external_partners: false,
  });
}

console.log(App);

export default App;
