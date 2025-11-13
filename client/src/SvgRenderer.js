import { nextTick } from 'vue';
import $ from './Constants.js';
import red_hat_font_b64 from './assets/red-hat-display-v21-latin-regular.js';

import default_sub_logo from './assets/default_sub_logo.js';

const wait = time => new Promise(resolve => setTimeout(resolve, time));

const SvgRenderer = {
  newElement: tag => {
    return document.createElementNS('http://www.w3.org/2000/svg', tag);
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

  fromLogo: async (logo, svg, addFont) => {
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
      let path0, path1;
      {
        path0 = SvgRenderer.newElement('path');
        path0.setAttribute('d', $.text_rp);
        const y = $.letter_bb[0] + $.letter_padding;
        path0.setAttribute('fill', logo.t_color);
        path0.setAttribute('transform', `translate(${X},${y})`);
        fg.appendChild(path0);
      }

      {
        path1 = SvgRenderer.newElement('path');
        path1.setAttribute('d', $.text_kl);
        const y = 2 * ($.letter_bb[0] + $.letter_padding);
        path1.setAttribute('fill', logo.t_color);
        path1.setAttribute('transform', `translate(${X},${y})`);
        fg.appendChild(path1);
      }

      await nextTick();
      X += path0.getBBox().width;
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
        e.textContent = partner.external ? 'In Kooperation mit' : partner.caption0;
        iElement.appendChild(e);
      }

      // row 2
      {
        const e = SvgRenderer.newElement('text');
        e.setAttribute('x', X);
        e.setAttribute('y', 35);
        e.setAttribute('font-size', '18');
        if (partner.caption1) e.setAttribute('font-weight', 'bold');
        e.setAttribute('fill', logo.t_color);
        e.textContent = partner.external ? partner.caption0 : partner.caption1 || partner.subcaption0;
        iElement.appendChild(e);
      }

      // row 3
      if (partner.caption0 && partner.caption1 && partner.subcaption0) {
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
      if (partner.caption0 && partner.caption1 && partner.subcaption0 && partner.subcaption1) {
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
        e.setAttribute('href', sublogo);
        iElement.appendChild(e);

        // wait until rendered
        for(let i=0; i<100; i++){
          await wait(10);
          const w = e.getBBox().width;
          if(w>10) break;
        }
        e.setAttribute('width', e.getBBox().width);
      }

      await nextTick();

      X += iElement.getBBox().width;
    }

    const logo_padding = $.gl;
    const height = 3 * $.gl + 2 * $.gs;
    // const width = 530;
    await nextTick();
    const width = fg.getBBox().width;
    // svg.setAttribute(
    //   'viewBox',
    //   `0 -${logo_padding} ${width + 2 * logo_padding} ${height + 2 * logo_padding}`
    // );
    svg.setAttribute(
      'viewBox',
      `${-logo_padding} ${-logo_padding} ${width + 2 * logo_padding} ${height + 2 * logo_padding}`
    );
    // svg.setAttribute('width', '100%');
    // svg.setAttribute('height', '100%');

    {
      const i = SvgRenderer.newElement('rect');
      i.setAttribute('x', -logo_padding);
      i.setAttribute('y', -logo_padding);
      i.setAttribute('width', width + 2 * logo_padding);
      i.setAttribute('height', height + 2 * logo_padding);
      i.setAttribute('fill', logo.b_color);
      bg.appendChild(i);
    }

    // const uni_text = [
    // 'Rheinland-Pfälzische',
    // 'Technische Universität',
    // 'Kaiserslautern-Landau'
    // ];
    // const text = SvgRenderer.newElement('text');
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
    //   const c = SvgRenderer.newElement('circle');
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
};

export default SvgRenderer;
