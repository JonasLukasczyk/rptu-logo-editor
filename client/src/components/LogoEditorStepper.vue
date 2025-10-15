<script setup>
import App from '../App.js';
import SvgRenderer from '../SvgRenderer.js';
import { watch, reactive, ref, onMounted, nextTick } from 'vue';
import $ from '../Constants.js';
import svgpath from 'svgpath';

import { Dialog } from 'quasar';
import ThemeDialog from '../dialogs/ThemeDialog.vue';
import FileDialog from '../dialogs/FileDialog.vue';
import default_sub_logo from '../assets/default_sub_logo.js';

const svg_container = ref(null);

const _ = reactive({
  grid: false,
  valid: true,
  step: 1,
});

const update = async () => {
  const recipe = App._.logo.recipe;

  const invalid_image_masks = [
    [1, 1, 1, 1],
    [0, 0, 0, 1],
    [0, 1, 2, 0],
  ];

  _.valid = !invalid_image_masks.some(a => App.arraysAreEqual(a, recipe.wm));

  const svg = svg_container.value;
  SvgRenderer.fromRecipe(recipe, svg);

  await nextTick();

  const e_layer = svg.appendChild(SvgRenderer.newElement('g'));
  e_layer.appendChild(SvgRenderer.newElement('g'));

  // grid layer
  e_layer.children[0].innerHTML = '';
  if (_.grid) {
    const h = 130;
    const w = 430;
    {
      let q = 0;

      for (let i of $.x_coords) {
        q += i;
        const e = SvgRenderer.newElement('line');
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
        const e = SvgRenderer.newElement('line');
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

const test = async (recipe, element) => {
  await nextTick();
  SvgRenderer.fromRecipe(recipe, element);
};

const setTemplate = async template => {
  const clone = App.clone(template);
  const recipe = App._.logo.recipe;
  for (let key of ['wm', 'show_rptu_text', 'internal', 'external']) recipe[key] = clone[key];

  _.step = 2;
};

const computeSvgFromColor = async (colors, element) => {
  if (!element) return;
  const recipe = App.clone(App._.logo.recipe);
  recipe.b_color = colors[0];
  recipe.t_color = colors[1];

  await nextTick();
  SvgRenderer.fromRecipe(recipe, element);
};

const setColor = colors => {
  const recipe = App._.logo.recipe;
  recipe.b_color = colors[0];
  recipe.t_color = colors[1];
  _.step = 0;
};

const deleteInternal = internal => {
  const recipe = App._.logo.recipe;
  const idx = recipe.internal.indexOf(internal);
  recipe.internal.splice(idx, 1);
  console.log(recipe);
};

const addInternal = () => {
  const recipe = App._.logo.recipe;
  recipe.internal.push({
    caption0: 'Bezeichnung der Institution',
    caption1: '',
    subcaption0: 'Prof. Dr. Laura Muster',
    subcaption1: '',
    logo: default_sub_logo,
  });
};

const setLogo = internal => {
  Dialog.create({
    component: FileDialog,
    componentProps: {},
    cancel: true,
  })
    .onOk(base64 => {
      internal.logo = base64;
    })
    .onCancel(() => {
      internal.logo = default_sub_logo;
    });

  // .onOk(base64 => {
  //   console.log('ok')
  //   // console.log(base64);
  //   // internal.logo = base64 || default_sub_logo;
  // }).onCancel(()=>{
  //   console.log('cancel')
  // });
};

const computeSvgFromCombination = async (c, element) => {
  const recipe = App.clone(App._.templates[0]);
  recipe.wm = c;
  await nextTick();
  SvgRenderer.fromRecipe(recipe, element);
};

const setPictorial = async c => {
  App._.logo.recipe.wm = c;
};
</script>

<template>
  <!-- {{_}} -->
  <div>
    <div class="logo_container" style="text-align: center">
      <svg ref="svg_container" />
    </div>

    <q-stepper v-model="_.step" header-nav ref="stepper" color="primary" animated>
      <q-step :name="1" title="Templates" icon="sym_o_lists">
        <div style="max-width: 40em; margin: 0 auto">
          <div class="template_list">
            <svg v-for="t in App._.templates" :ref="el => test(t, el)" @click="() => setTemplate(t)" />
          </div>
        </div>
      </q-step>

      <q-step :name="2" title="Pictorial &amp; Wordmark" icon="apps">
        <div class="main_container">
          <q-checkbox v-model="App._.logo.recipe.show_rptu_text" label="Show Wordmark" />
          <div class="template_list compact" style="max-height: 20em">
            <svg
              v-for="c in $.letter_combinations"
              :class="App.arraysAreEqual(c, App._.logo.recipe.wm) ? 'selected' : ''"
              :ref="el => computeSvgFromCombination(c, el)"
              @click="() => setPictorial(c)"
            />
          </div>
        </div>
      </q-step>

      <q-step :name="3" title="Co-Branding" icon="add_box">
        <div class="main_container">
          <q-card
            v-for="(internal, i) in App._.logo.recipe.internal"
            style="background-color: #fcfcfc; width: 100%; margin: 0 0 2em 0"
          >
            <q-btn
              icon="close"
              round
              flat
              dense
              style="position: absolute; z-index: 100; right: 0.25em; top: 0.25em; color: #999"
              @click="() => deleteInternal(internal)"
            />
            <q-card-section>
              <template v-for="g of ['Caption', 'Subcaption']">
                <template v-for="i of [0, 1]">
                  <q-input
                    :placeholder="`${g} Row ${i + 1} ${i === 1 ? '(Optional)' : ''}`"
                    v-model="internal[g.toLowerCase() + i]"
                    dense
                    :input-style="internal[g.toLowerCase() + i] === '' ? 'color:#aaa;' : ''"
                  />
                </template>
              </template>

              <img
                :src="internal.logo"
                style="display: block; margin: 0.5em auto 0 auto; max-height: 10em; cursor: pointer"
                @click="() => setLogo(internal)"
              />
            </q-card-section>
          </q-card>

          <q-btn
            color="primary"
            key="add"
            style="width: 100%; margin: 0 0 2em 0"
            label="Add Item"
            @click="addInternal"
          />
        </div>
        <!-- <q-input label='title0' v-model='App._.logo.recipe.internal' /> -->
      </q-step>

      <!-- <q-step :name="4" title="Co-Branding, extern" icon="add_box"> TODO </q-step> -->

      <q-step :name="5" title="Color Theme" icon="palette">
        <div class="template_list compact" style="max-height: 20em">
          <template v-for="(g, i) in $.colors">
            <svg v-for="(c, j) in g" :ref="el => computeSvgFromColor(c, el)" @click="() => setColor(c)" />
          </template>
        </div>
      </q-step>
    </q-stepper>
  </div>
</template>

<style scoped>
.logo_container {
  zoom: 1;
  padding: 2em;
  min-height: 15em;
  height: 15em;
}

.logo_container svg {
  /* border: 1px solid black; */
  /* margin: 1em; */
  max-height: 12em;
}

.compact svg {
  float: left;
}

.template_list {
  text-align: center;
}

.template_list svg {
  display: block;
  max-height: 10em;
  border: 0.1em solid #000;
  border-radius: 0.25em;
  margin: 0.5em;
}

.template_list svg:hover {
  background-color: #ccc;
  cursor: pointer;
  filter: brightness(0.95);
}

.selected {
  border-style: dashed !important;
}
</style>
