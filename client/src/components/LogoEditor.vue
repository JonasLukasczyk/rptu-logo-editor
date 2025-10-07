<script setup>
import App from '../App.js';
import { watch, reactive, ref, onMounted, nextTick } from 'vue';
import $ from '../Constants.js';
import svgpath from 'svgpath';

import { Dialog } from 'quasar';
import ThemeDialog from '../dialogs/ThemeDialog.vue';
import FileDialog from '../dialogs/FileDialog.vue';

const svg_container = ref(null);

const _ = reactive({
  grid: true,
  internal_inputs: [],
  valid: true,
});

const setLetter = (r, c) => {
  App._.logo.recipe.wm[c] = r;
};

const addInternalLogo = () => {
  Dialog.create({
    component: FileDialog,
    componentProps: {},
  })
    .onOk(base64 => {
      App._.logo.recipe.internal[3] = base64;
    })
    .onCancel(base64 => {
      console.log('xx');
      App._.logo.recipe.internal[3] = null;
    });
};

const arraysAreEqual = (a, b) => {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

const update = async () => {
  const recipe = App._.logo.recipe;

  const invalid_image_masks = [
    [1, 1, 1, 1],
    [0, 0, 0, 1],
    [0, 1, 2, 0],
  ];

  _.valid = !invalid_image_masks.some(a => arraysAreEqual(a, recipe.wm));

  const svg = svg_container.value;
  App.createSvgFromRecipe(recipe, svg);

  for (let e of [...svg.children[0].getElementsByTagName('text')]){
    e.setAttribute('opacity', 0);
    e.textContent = e.textContent.replaceAll(' ','a');
  }

  if (svg.children.length === 1) {
    const root = svg.appendChild(App.createSvgElement('g'));
    root.appendChild(App.createSvgElement('g'));
    root.appendChild(App.createSvgElement('g'));
    root.appendChild(App.createSvgElement('g'));
  }
  const e_layer = svg.children[1];

  await nextTick();

  // grid layer
  e_layer.children[0].innerHTML = '';
  if (_.grid) {
    const h = 130;
    const w = 430;
    {
      let q = 0;

      for (let i of $.x_coords) {
        q += i;
        const e = App.createSvgElement('line');
        e.setAttribute('x1', q);
        e.setAttribute('y1', 0);
        e.setAttribute('x2', q);
        e.setAttribute('y2', h);
        e.setAttribute('stroke', 'red');
        e.setAttribute('stroke-width', 0.5);
        e_layer.children[0].appendChild(e);
      }
    }

    {
      let q = 0;
      for (let i of $.y_coords) {
        q += i;
        const e = App.createSvgElement('line');
        e.setAttribute('x1', 0);
        e.setAttribute('y1', q);
        e.setAttribute('x2', w);
        e.setAttribute('y2', q);
        e.setAttribute('stroke', 'red');
        e.setAttribute('stroke-width', 0.5);
        e_layer.children[0].appendChild(e);
      }
    }
  }

  // letter inputs
  {
    e_layer.children[1].innerHTML = '';
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++) {
        const i = App.createSvgElement('rect');
        i.setAttribute('x', c * $.letter_bb[0]);
        i.setAttribute('y', r * ($.letter_bb[1] + $.letter_padding));
        i.setAttribute('width', $.letter_bb[0]);
        i.setAttribute('height', $.letter_bb[1]);
        i.classList.add('clickable');
        i.addEventListener('click', () => setLetter(r, c));

        e_layer.children[1].appendChild(i);
      }
  }

  const createInput = (idx, x, y) => {
    const e = App.createSvgElement('foreignObject');
    e.setAttribute('x', x);
    e.setAttribute('y', y);
    e.classList.add('svg_text_input');
    e.setAttribute('width', 270);
    e.setAttribute('height', 30);

    const input = document.createElement('input');
    input.setAttribute('type', 'text');
    input.setAttribute('value', recipe.internal[idx]);
    input.setAttribute('style', `font-weight:${idx === 1 ? 'bold' : 'normal'};color:${recipe.t_color}`);
    input.addEventListener('input', () => (recipe.internal[idx] = input.value));
    e.appendChild(input);
    e_layer.children[2].appendChild(e);

    _.internal_inputs[idx] = [e, input];
  };

  // text input layer
  if (recipe.internal[0]) {
    if (e_layer.children[2].children.length < 1) {
      const x = $.x_coords.slice(0, 9).reduce((i, agg) => agg + i, 0);
      createInput(1, x, -6.5);
      createInput(2, x, 15);

      const e = App.createSvgElement('rect');
      e.setAttribute('x', x);
      e.setAttribute(
        'y',
        $.y_coords.slice(0, 3).reduce((i, agg) => i + agg, 0)
      );
      e.classList.add('clickable');
      e.setAttribute(
        'height',
        $.y_coords.slice(-3).reduce((i, agg) => i + agg, 0)
      );
      e.addEventListener('click', addInternalLogo);
      e_layer.children[2].appendChild(e);
      _.internal_inputs[3] = e;
    }

    {
      const text_elements = [...svg.children[0].children[1].getElementsByClassName('internal')];
      for(let i=0; i<text_elements.length; i++){
        const ii = text_elements[i];
        const width = ii.getBBox().width;
        _.internal_inputs[1+i][0].setAttribute('width',width);
      };
    }

    _.internal_inputs[1][1].setAttribute('style', `font-weight:bold;color:${recipe.t_color}`);
    _.internal_inputs[2][1].setAttribute('style', `font-weight:normal;color:${recipe.t_color}`);

    const images = [...svg.children[0].children[1].getElementsByTagName('image')];
    for (let i in images) {
      const bb = images[i].getBBox();
      _.internal_inputs[3].setAttribute('x', bb.x);
      _.internal_inputs[3].setAttribute('y', bb.y);
      _.internal_inputs[3].setAttribute('width', Math.max(bb.width,150));
      _.internal_inputs[3].setAttribute('height', bb.height);
    }
  } else {
    e_layer.children[2].innerHTML = '';
  }
};

const updateSync = async () => {
  console.log('flush');
  // console.log(JSON.stringify(App._.logo.recipe),App._.logo.id)
  await App.LogoService.dbRun(`UPDATE logos SET recipe=? WHERE id=?`, [
    JSON.stringify(App._.logo.recipe),
    App._.logo.id,
  ]);
};

const init = async () => {
  await nextTick();
  console.log(App._.logo);
  watch(() => _.grid, update);
  watch(() => App._.logo.recipe, update, { deep: true });
  watch(() => App._.logo.recipe, App.debounce(updateSync, 1000), { deep: true });
  update();
};

onMounted(init);

const randomColor = () => {
  Dialog.create({
    component: ThemeDialog,
    componentProps: {
      recipe: App._.logo.recipe,
    },
  }).onOk(colors => {
    App._.logo.recipe.b_color = colors[0];
    App._.logo.recipe.t_color = colors[1];
  });
};
</script>

<template>
  <q-btn label="Color Theme" @click="randomColor" />
  <q-checkbox v-model="_.grid" label="Grid" />
  <q-checkbox v-model="App._.logo.recipe.show_rptu_text" label="Show Text" />
  <q-checkbox v-model="App._.logo.recipe.internal[0]" label="Internal" />

  <q-btn v-if="!_.valid" icon="warning" label="Invalid Configuration" color="red-9" style="float: right" />

  <div class="logo_container" style="text-align: center">
    <svg ref="svg_container"></svg>
  </div>
</template>

<style>
.logo_container {
  zoom: 1;
  padding: 2em;
}

.logo_container svg {
  /* border: 1px solid black; */
  /* margin: 1em; */
  max-height:20em;
}

.logo_container .clickable {
  cursor: pointer;
  fill: green;
  opacity: 0;
}

.logo_container .clickable:hover {
  opacity: 0.2;
}

.svg_text_input {
  text-align: left;
}

.svg_text_input input {
  background-color: transparent;
  border: 0;
  outline: 0;
  font-family: 'Arial';
  font-size: 18px;
  padding: 0 0 0 0;
  /* border:1px solid green; */
  width: 100%;
}
</style>
