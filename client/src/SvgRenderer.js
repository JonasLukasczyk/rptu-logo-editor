import $ from './Constants.js';
import red_hat_font_b64 from './assets/RedHatDisplay-VariableFont_wght.js';
import default_sub_logo from './assets/default_sub_logo.js';

const base64Cache = new Map();

const SVG_NS = 'http://www.w3.org/2000/svg';
const XLINK_NS = 'http://www.w3.org/1999/xlink';

const SvgRenderer = {
  newElement: tag => document.createElementNS(SVG_NS, tag),

  cleanupObjectURLs: () => {
    for (const url of base64Cache.values()) {
      URL.revokeObjectURL(url);
    }
    base64Cache.clear();
  },

  base64ToObjectURL: base64 => {
    const [header, data] = base64.split(',');
    const mime = header?.match(/:(.*?);/)?.[1];

    if (!mime || !data) {
      throw new Error('Invalid base64 data URL.');
    }

    const binary = atob(data);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const blob = new Blob([bytes], { type: mime });
    return URL.createObjectURL(blob);
  },

  getPreviewObjectURL: base64 => {
    if (!base64Cache.has(base64)) {
      base64Cache.set(base64, SvgRenderer.base64ToObjectURL(base64));
    }

    return base64Cache.get(base64);
  },

  waitForFonts: async () => {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
  },

  addStyle: (svg, addFont) => {
    svg.querySelector('style[data-svg-renderer="true"]')?.remove();

    const style = SvgRenderer.newElement('style');
    style.setAttribute('type', 'text/css');
    style.setAttribute('data-svg-renderer', 'true');

    if (addFont) {
      style.textContent += `
        @font-face {
          font-family: 'RedHat';
          src: url('data:font/woff2;base64,${red_hat_font_b64}') format('woff2');
          font-weight: 100 900;
          font-style: normal;
        }
      `;
    }

    style.textContent += `
      text {
        font-family: 'RedHat', sans-serif;
      }
    `;

    svg.insertBefore(style, svg.firstChild);
  },

  getImageSize: src =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = reject;
      img.src = src;
    }),

  prepareSvg: (svg, addFont) => {
    if (!svg) {
      svg = SvgRenderer.newElement('svg');
    }

    svg.setAttribute('xmlns', SVG_NS);
    svg.setAttribute('xmlns:xlink', XLINK_NS);

    SvgRenderer.addStyle(svg, addFont);

    let root = svg.querySelector('g[data-svg-renderer-root="true"]');

    if (!root) {
      root = SvgRenderer.newElement('g');
      root.setAttribute('data-svg-renderer-root', 'true');
      svg.appendChild(root);
    } else {
      root.replaceChildren();
    }

    return { svg, root };
  },

  fromLogo: async (logo, svg, addFont = true, rawImages = false) => {
    const prepared = SvgRenderer.prepareSvg(svg, addFont);
    svg = prepared.svg;

    const root = prepared.root;
    const bg = root.appendChild(SvgRenderer.newElement('g'));
    const fg = root.appendChild(SvgRenderer.newElement('g'));

    let X = 0;

    // Letters
    const letters = ['R', 'P', 'T', 'U'];

    for (const [index, letter] of letters.entries()) {
      const x = $.letter_bb[0] * index;
      const y = ($.letter_bb[1] + $.letter_padding) * logo.wm[index];

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
        e.setAttribute('font-weight', '900');
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
        e.setAttribute('font-weight', '900');
        e.setAttribute('fill', logo.t_color);
        e.textContent = 'Technische Universität';
        fg.appendChild(e);
        await SvgRenderer.waitForFonts();
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

    const coBranding = logo.co_branding ?? [];

    if (coBranding.length) {
      X += 2 * $.gs;
    }

    // Co-branding
    for (const [partnerIndex, partner] of coBranding.entries()) {
      const iElement = SvgRenderer.newElement('g');
      fg.appendChild(iElement);

      // Vertical line
      {
        const i = SvgRenderer.newElement('path');
        const h = $.y_coords.slice(0, 6).reduce((agg, value) => agg + value, 0);

        i.setAttribute('d', `M ${X} ${0} L ${X} ${h}`);
        i.setAttribute('stroke', logo.t_color);
        i.setAttribute('stroke-width', '1');

        iElement.appendChild(i);
      }

      X += 2 * $.gs;

      // Row 1
      {
        const e = SvgRenderer.newElement('text');
        e.setAttribute('x', X);
        e.setAttribute('y', 0);
        e.setAttribute('font-size', '18');
        e.setAttribute('fill', logo.t_color);
        e.setAttribute('text-anchor', 'start');
        e.setAttribute('dominant-baseline', 'hanging');
        e.setAttribute('font-weight', '900');

        e.textContent = logo.external_partners
          ? partnerIndex === 0
            ? 'In Kooperation mit'
            : ''
          : partner.caption0 || '';

        iElement.appendChild(e);
      }

      // Row 2
      {
        const e = SvgRenderer.newElement('text');
        e.setAttribute('x', X);
        e.setAttribute('y', 35);
        e.setAttribute('font-size', '18');
        e.setAttribute('fill', logo.t_color);

        if (!logo.external_partners && partner.caption1) {
          e.setAttribute('font-weight', '900');
        }

        e.textContent = logo.external_partners ? partner.caption0 || '' : partner.caption1 || partner.subcaption0 || '';

        iElement.appendChild(e);
      }

      // Row 3
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

      // Row 4
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

      // Partner logo
      const sublogo = partner.logo || default_sub_logo;

      if (sublogo) {
        const nRows =
          (partner.caption0 ? 1 : 0) +
          (partner.caption1 ? 1 : 0) +
          (partner.subcaption0 ? 1 : 0) +
          (partner.subcaption1 ? 1 : 0);

        const y = logo.external_partners ? $.gl + $.gs : nRows === 0 ? 0 : nRows < 3 ? $.gl + $.gs : ($.gl + $.gs) * 2;

        const h = logo.external_partners
          ? 2 * $.gl + $.gs
          : nRows === 0
            ? 3 * $.gl + 2 * $.gs
            : nRows < 3
              ? 2 * $.gl + $.gs
              : $.gl;

        const e = SvgRenderer.newElement('image');
        e.setAttribute('x', X);
        e.setAttribute('y', y);
        e.setAttribute('height', h);

        const href = rawImages ? sublogo : SvgRenderer.getPreviewObjectURL(sublogo);

        const { width: naturalWidth, height: naturalHeight } = await SvgRenderer.getImageSize(href);

        const imageWidth = naturalWidth && naturalHeight ? h * (naturalWidth / naturalHeight) : h;

        e.setAttribute('width', imageWidth);
        e.setAttribute('href', href);
        e.setAttributeNS(XLINK_NS, 'xlink:href', href);

        iElement.appendChild(e);
      }

      await SvgRenderer.waitForFonts();
      X += iElement.getBBox().width;
    }

    const logo_padding = $.gl;
    const height = 3 * $.gl + 2 * $.gs;

    const bbox = fg.getBBox();
    const width = Math.max(X, bbox.x + bbox.width);

    const viewWidth = width + 2 * logo_padding;
    const viewHeight = height + 2 * logo_padding;

    fg.setAttribute('transform', `translate(${logo_padding}, ${logo_padding})`);

    svg.setAttribute('viewBox', `0 0 ${viewWidth} ${viewHeight}`);
    svg.setAttribute('width', viewWidth);
    svg.setAttribute('height', viewHeight);

    {
      const i = SvgRenderer.newElement('rect');

      i.setAttribute('x', 0);
      i.setAttribute('y', 0);
      i.setAttribute('width', viewWidth);
      i.setAttribute('height', viewHeight);
      i.setAttribute('fill', logo.b_color);

      bg.appendChild(i);
    }

    return svg;
  },
};

export default SvgRenderer;
