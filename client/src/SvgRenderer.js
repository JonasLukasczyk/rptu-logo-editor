import { nextTick } from 'vue';
import $ from './Constants.js';
import red_hat_font_b64 from './assets/red-hat-display-v21-latin-regular.js';

import default_sub_logo from './assets/default_sub_logo.js';

const wait = time => new Promise(resolve => setTimeout(resolve, time));

const base64Cache = new Map();

const SvgRenderer = {
  newElement: tag => {
    return document.createElementNS('http://www.w3.org/2000/svg', tag);
  },

  base64ToObjectURL: base64 => {
    const [header, data] = base64.split(',');
    const mime = header.match(/:(.*?);/)[1];

    const binary = atob(data);
    const len = binary.length;
    const bytes = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const blob = new Blob([bytes], { type: mime });
    return URL.createObjectURL(blob);
  },

  addStyle: (svg, addFont) => {
    const style = SvgRenderer.newElement('style');
    style.setAttribute('type', 'text/css');
    if (addFont)
      style.textContent += `
        @font-face {
          font-family: 'RedHat';
          src: url('data:font/woff2;base64,${red_hat_font_b64}') format('woff2');
        }
      `;
    style.textContent += `
        text {
          font-family: 'RedHat';
        }
      `;
    svg.insertBefore(style, svg.firstChild);
  },

  fromLogo: async (logo, svg, addFont, rawImages) => {
    if (!svg) {
      svg = SvgRenderer.newElement('svg');
      SvgRenderer.addStyle(svg, addFont);
      svg.appendChild(SvgRenderer.newElement('g'));
    } else if (svg.children.length === 0) {
      SvgRenderer.addStyle(svg, addFont);
      svg.appendChild(SvgRenderer.newElement('g'));
    } else {
      svg.children[1].innerHTML = '';
    }

    let X = 0;

    const root = svg.children[1];
    const bg = root.appendChild(SvgRenderer.newElement('g'));
    const fg = root.appendChild(SvgRenderer.newElement('g'));

    // Letters
    const letters = ['R', 'P', 'T', 'U'];
    for (let i in letters) {
      const letter = letters[i];
      const x = $.letter_bb[0] * i;
      const y = ($.letter_bb[1] + $.letter_padding) * logo.wm[i];
      const path = SvgRenderer.newElement('path');
      path.setAttribute('fill', logo.t_color);
      path.setAttribute('d', $[`${letter}_path`]);
      path.setAttribute('transform', `translate(${x},${y})`);
      fg.appendChild(path);
    }

    X = 4 * $.gl;

    if (logo.show_rptu_text) {
      X += $.gs;
      {
        const e = SvgRenderer.newElement('text');
        e.setAttribute('x', $.letter_bb[0] * 4 + $.gs);
        e.setAttribute('y', $.gl + $.gs);
        e.setAttribute('font-size', '17');
        e.setAttribute('font-weight', 'bold');
        e.setAttribute('fill', logo.t_color);
        e.setAttribute('dominant-baseline', 'hanging');
        e.textContent = 'Rheinland-Pfälzische';
        fg.appendChild(e);
      }
      {
        const e = SvgRenderer.newElement('text');
        e.setAttribute('x', $.letter_bb[0] * 4 + $.gs);
        e.setAttribute('y', 2 * $.gl + $.gs);
        e.setAttribute('font-size', '17');
        e.setAttribute('font-weight', 'bold');
        e.setAttribute('fill', logo.t_color);
        e.textContent = 'Technische Universität';
        fg.appendChild(e);

        await nextTick();
        X += e.getBBox().width;
      }

      {
        const e = SvgRenderer.newElement('text');
        e.setAttribute('x', $.letter_bb[0] * 4 + $.gs);
        e.setAttribute('y', 2 * $.gl + 2 * $.gs);
        e.setAttribute('font-size', '17');
        e.setAttribute('fill', logo.t_color);
        e.setAttribute('dominant-baseline', 'hanging');
        e.textContent = 'Kaiserslautern';
        fg.appendChild(e);
      }

      {
        const e = SvgRenderer.newElement('text');
        e.setAttribute('x', $.letter_bb[0] * 4 + $.gs);
        e.setAttribute('y', 3 * $.gl + 2 * $.gs);
        e.setAttribute('font-size', '17');
        e.setAttribute('fill', logo.t_color);
        e.textContent = 'Landau';
        fg.appendChild(e);
      }
    }

    if (logo.co_branding.length) {
      X += 2 * $.gs;
    }

    // Co-Branding
    for (let partner of logo.co_branding) {
      const iElement = SvgRenderer.newElement('g');
      fg.appendChild(iElement);

      // vertical line
      {
        const i = SvgRenderer.newElement('path');
        const h = $.y_coords.slice(0, 6).reduce((i, agg) => i + agg, 0);
        i.setAttribute('d', `M ${X} ${0} L ${X} ${h}`);
        i.setAttribute('stroke', logo.t_color);
        i.setAttribute('stroke-width', 2);
        iElement.appendChild(i);
      }

      X += 2 * $.gs;

      // row 1
      {
        const e = SvgRenderer.newElement('text');
        e.setAttribute('x', X);
        e.setAttribute('y', 0);
        e.setAttribute('font-size', '18');
        e.setAttribute('fill', logo.t_color);
        e.setAttribute('text-anchor', 'start');
        e.setAttribute('dominant-baseline', 'hanging');
        e.setAttribute('font-weight', 'bold');
        e.textContent = logo.external_partners
          ? logo.co_branding.indexOf(partner) <= 0
            ? 'In Kooperation mit'
            : ''
          : partner.caption0;
        iElement.appendChild(e);
      }

      // row 2
      {
        const e = SvgRenderer.newElement('text');
        e.setAttribute('x', X);
        e.setAttribute('y', 35);
        e.setAttribute('font-size', '18');
        if (!logo.external_partners && partner.caption1) e.setAttribute('font-weight', 'bold');
        e.setAttribute('fill', logo.t_color);
        e.textContent = logo.external_partners ? partner.caption0 : partner.caption1 || partner.subcaption0;
        iElement.appendChild(e);
      }

      // row 3
      if (!logo.external_partners && partner.caption0 && partner.caption1 && partner.subcaption0) {
        const e = SvgRenderer.newElement('text');
        e.setAttribute('x', X);
        e.setAttribute('y', $.gl + $.gs);
        e.setAttribute('font-size', '18');
        e.setAttribute('fill', logo.t_color);
        e.setAttribute('text-anchor', 'start');
        e.setAttribute('dominant-baseline', 'hanging');
        e.textContent = partner.subcaption0;
        iElement.appendChild(e);
      }

      // row 4
      if (
        !logo.external_partners &&
        partner.caption0 &&
        partner.caption1 &&
        partner.subcaption0 &&
        partner.subcaption1
      ) {
        const e = SvgRenderer.newElement('text');
        e.setAttribute('x', X);
        e.setAttribute('y', 2 * $.gl + $.gs);
        e.setAttribute('font-size', '18');
        e.setAttribute('fill', logo.t_color);
        e.textContent = partner.subcaption1;
        iElement.appendChild(e);
      }

      // logo
      const sublogo = partner.logo || default_sub_logo;

      if (sublogo) {
        const mini = partner.caption1;
        const y = ($.gl + $.gs) * (mini ? 2 : 1);
        const h = mini ? $.gl : 2 * $.gl + $.gs;

        const e = SvgRenderer.newElement('image');
        e.setAttribute('x', X);
        e.setAttribute('y', y);
        e.setAttribute('height', h);

        let objectUrl = rawImages ? sublogo : base64Cache.get(sublogo);
        if (!objectUrl) {
          objectUrl = SvgRenderer.base64ToObjectURL(sublogo);
          base64Cache.set(sublogo, objectUrl);
        }
        e.setAttribute('href', objectUrl);
        iElement.appendChild(e);

        const imageLoaded = img =>
          new Promise((resolve, reject) => {
            img.addEventListener('load', resolve, { once: true });
            img.addEventListener('error', reject, { once: true });
          });

        await imageLoaded(e);
        e.setAttribute('width', e.getBBox().width);
      }

      await nextTick();

      X += iElement.getBBox().width;
    }

    await nextTick();

    const logo_padding = $.gl;
    const height = 3 * $.gl + 2 * $.gs;
    const width = fg.getBBox().width;
    svg.setAttribute(
      'viewBox',
      `${-logo_padding} ${-logo_padding} ${width + 2 * logo_padding} ${height + 2 * logo_padding}`
    );

    {
      const i = SvgRenderer.newElement('rect');
      i.setAttribute('x', -logo_padding);
      i.setAttribute('y', -logo_padding);
      i.setAttribute('width', width + 2 * logo_padding);
      i.setAttribute('height', height + 2 * logo_padding);
      i.setAttribute('fill', logo.b_color);
      bg.appendChild(i);
    }

    return svg;
  },
};

export default SvgRenderer;
