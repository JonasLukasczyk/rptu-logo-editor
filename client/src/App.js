import { reactive, nextTick } from 'vue';

import { io } from 'socket.io-client';
import $ from './Constants.js';

const App = {
  _: reactive({
    connected: false,
    logo: null,
    user: null,
  }),

  io: io(':4000', { maxHttpBufferSize: 20 * 1024 * 1024 }),

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

  createSvgElement: tag => {
    return document.createElementNS('http://www.w3.org/2000/svg', tag);
  },

  createSvgFromRecipe: async (recipe, svg) => {
    if (svg) {
      if (svg.children.length === 0) svg.appendChild(App.createSvgElement('g'));
      else svg.children[0].innerHTML = '';
    } else {
      svg = App.createSvgElement(`svg`);
      svg.appendChild(App.createSvgElement('g'));
    }

    const root = svg.children[0];
    const bg = root.appendChild(App.createSvgElement('g'));
    const fg = root.appendChild(App.createSvgElement('g'));

    // Letters
    const letters = ['R', 'P', 'T', 'U'];
    for (let i in letters) {
      const letter = letters[i];
      const x = $.letter_bb[0] * i;
      const y = ($.letter_bb[1] + $.letter_padding) * recipe.wm[i];
      const path = App.createSvgElement('path');
      path.setAttribute('fill', recipe.t_color);
      path.setAttribute('d', $[`${letter}_path`]);
      path.setAttribute('transform', `translate(${x},${y})`);
      fg.appendChild(path);
    }

    if (recipe.show_rptu_text) {
      {
        const path = App.createSvgElement('path');
        path.setAttribute('d', $.text_rp);
        const x = 4 * $.letter_bb[0] + $.letter_padding;
        const y = $.letter_bb[0] + $.letter_padding;
        path.setAttribute('fill', recipe.t_color);
        path.setAttribute('transform', `translate(${x},${y})`);
        fg.appendChild(path);
      }

      {
        const path = App.createSvgElement('path');
        path.setAttribute('d', $.text_kl);
        const x = 4 * $.letter_bb[0] + $.letter_padding;
        const y = 2 * ($.letter_bb[0] + $.letter_padding);
        path.setAttribute('fill', recipe.t_color);
        path.setAttribute('transform', `translate(${x},${y})`);
        fg.appendChild(path);
      }
    }

    // internal
    if (recipe.internal[0]) {
      // vertical line
      {
        const i = App.createSvgElement('path');
        const x = $.x_coords.slice(0, 7).reduce((i, agg) => i + agg, 0);
        const h = $.y_coords.slice(0, 6).reduce((i, agg) => i + agg, 0);
        i.setAttribute('d', `M ${x} ${0} L ${x} ${h}`);
        i.setAttribute('stroke', recipe.t_color);
        i.setAttribute('stroke-width', 2);
        fg.appendChild(i);
      }

      // internal text
      const x_text = $.x_coords.slice(0, 9).reduce((i, agg) => agg + i, 0);
      {
        const e = App.createSvgElement('text');
        e.classList.add('internal');
        e.setAttribute('x', x_text);
        e.setAttribute('y', 0);
        e.setAttribute('font-family', 'Arial');
        e.setAttribute('font-size', '18');
        e.setAttribute('fill', recipe.t_color);
        e.setAttribute('text-anchor', 'start');
        e.setAttribute('dominant-baseline', 'hanging');
        e.setAttribute('font-weight', 'bold');
        e.textContent = recipe.internal[1];
        fg.appendChild(e);
      }

      {
        const e = App.createSvgElement('text');
        e.classList.add('internal');
        e.setAttribute('x', x_text);
        e.setAttribute('y', 35);
        e.setAttribute('font-family', 'Arial');
        e.setAttribute('font-size', '18');
        e.setAttribute('fill', recipe.t_color);
        e.textContent = recipe.internal[2];
        fg.appendChild(e);
      }

      // logo
      if (recipe.internal[3] !== null) {
        const x = $.x_coords.slice(0, 9).reduce((i, agg) => agg + i, 0);

        const e = App.createSvgElement('image');
        e.setAttribute('x', x);
        e.setAttribute(
          'y',
          $.y_coords.slice(0, 3).reduce((i, agg) => i + agg, 0)
        );
        e.setAttribute(
          'height',
          $.y_coords.slice(-3).reduce((i, agg) => i + agg, 0)
        );
        e.setAttribute('href', recipe.internal[3]);
        fg.appendChild(e);

        await nextTick();
        e.setAttribute('width',e.getBBox().width);
      }
    }

    const logo_padding = 20;
    const height = 131;
    // const width = 530;
    const width = fg.getBBox().width;
    // svg.setAttribute(
    //   'viewBox',
    //   `0 -${logo_padding} ${width + 2 * logo_padding} ${height + 2 * logo_padding}`
    // );
    svg.setAttribute("viewBox", `${-logo_padding} ${-logo_padding} ${width+2*logo_padding} ${height+2*logo_padding}`);
    // svg.setAttribute('width', '100%');
    // svg.setAttribute('height', '100%');

    {
      const i = App.createSvgElement('rect');
      i.setAttribute('x', -logo_padding);
      i.setAttribute('y', -logo_padding);
      i.setAttribute('width', width + 2 * logo_padding);
      i.setAttribute('height', height + 2 * logo_padding);
      i.setAttribute('fill', recipe.b_color);
      bg.appendChild(i);
    }

    // const uni_text = [
    // 'Rheinland-Pfälzische',
    // 'Technische Universität',
    // 'Kaiserslautern-Landau'
    // ];
    // const text = App.createSvgElement('text');
    // text.setAttribute("x", 4*$.letter_bb[0]+$.letter_padding);
    // text.setAttribute("y", $.letter_bb[0]+$.letter_padding);
    // text.setAttribute("font-size", "24");
    // text.setAttribute("text-anchor", "start");
    // text.setAttribute("dominant-baseline", "hanging");
    // text.setAttribute("fill", "black");
    // text.setAttribute("font-family", "Arial");
    // text.textContent = uni_text[0];
    // logo_layer.append(text);
    // {
    //   const c = App.createSvgElement('circle');
    //   // c.setAttribute('cx',-logo_padding);
    //   // c.setAttribute('cy',-logo_padding);
    //   c.setAttribute('cx',0);
    //   c.setAttribute('cy',0);
    //   c.setAttribute('r',2);
    //   c.setAttribute('fill','red');
    //   svg.appendChild(c);
    // }

    return svg;
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

export default App;
