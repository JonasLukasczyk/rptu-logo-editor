import { reactive, nextTick } from 'vue';

import $ from './Constants.js';

import SvgRenderer from './SvgRenderer.js';

const DEBUG = true;

const App = {
  _: reactive({
    connected: false,
    logo: null,
    logos: null,
    user: null,
    minified: true,
    templates: [],
  }),

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
    App.download('rptu_logo_' + logo.id + '.' + format, exportBlob);
  },

  fetch: async (url, args = {}) => {
    try {
      const response = await window.fetch(url, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(args),
      });
      if (!response.ok) return null;
      return response.json();
    } catch (e) {
      return null;
    }
  },

  init: async () => {
    const base = DEBUG
      ? `http://${window.location.hostname}:3000`
      : `${window.location.protocol}//${window.location.host}/app`;
    console.log(base);
    const services = await App.fetch(`${base}/getServices`);
    for (let s of Object.keys(services)) {
      App[s] = {};
      for (let f of services[s]) App[s][f] = args => App.fetch(`${base}/${s}.${f}`, args);
    }

    App._.connected = true;

    console.log(services);
  },
};

App.init();

console.log(App);

export default App;
