<script setup>
import App from '../App.js';
import SvgRenderer from '../SvgRenderer.js';
import { watch, reactive, ref, onMounted, nextTick } from 'vue';
import $ from '../Constants.js';
import svgpath from 'svgpath';

import { useQuasar, Dialog } from 'quasar';
import ThemeDialog from '../dialogs/ThemeDialog.vue';
import FileDialog from '../dialogs/FileDialog.vue';
import default_sub_logo from '../assets/default_sub_logo.js';

const svg_container = ref(null);
const $q = useQuasar();

const _ = reactive({
  grid: false,
  valid: true,
  step: 1,
});

const update = async () => {
  const logo = App._.logo;
  if (!logo || !svg_container.value) return;

  const invalid_image_masks = [
    [1, 1, 1, 1],
    [0, 0, 0, 1],
    [0, 1, 2, 0],
  ];

  _.valid = !invalid_image_masks.some(a => App.arraysAreEqual(a, logo.wm));

  await nextTick();

  const svg = svg_container.value;
  SvgRenderer.fromLogo(logo, svg);

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
  if (!App._.logo) return;
  await App.LogoService.updateLogo(App._.logo);
};

const init = async () => {
  await nextTick();
  console.log(App._.logo);
  watch(() => _.grid, update);
  watch(() => App._.logo, update, { deep: true });
  watch(() => App._.logo, App.debounce(updateSync, 1000), { deep: true });
  update();
};

onMounted(init);

const test = async (logo, element) => {
  await nextTick();
  SvgRenderer.fromLogo(logo, element);
};

const setTemplate = async template => {
  const clone = App.clone(template);
  const logo = App._.logo;
  for (let key of ['wm', 'show_rptu_text', 'co_branding']) logo[key] = clone[key];
  _.step = 2;
};

const computeSvgFromColor = async (colors, element) => {
  if (!element) return;
  const logo = App.clone(App._.logo);
  logo.b_color = colors[0];
  logo.t_color = colors[1];

  await nextTick();
  SvgRenderer.fromLogo(logo, element);
};

const setColor = colors => {
  const logo = App._.logo;
  logo.b_color = colors[0];
  logo.t_color = colors[1];
  _.step = 6;
};

const deletePartner = partner => {
  const logo = App._.logo;
  const idx = logo.co_branding.indexOf(partner);
  logo.co_branding.splice(idx, 1);
};

const addPartner = () => {
  const logo = App._.logo;
  logo.co_branding.push({
    caption0: 'Bezeichnung der Institution',
    caption1: '',
    subcaption0: 'Prof. Dr. Laura Muster',
    subcaption1: '',
    external: false,
    logo: default_sub_logo,
  });
};

const setLogo = (event, partner) => {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) return alert('Please upload a valid image file.');

  const reader = new FileReader();
  reader.onload = function (e) {
    partner.logo = e.target.result;
  };
  reader.readAsDataURL(file);
  return;

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
  const logo = App.clone(App._.templates[0]);
  logo.wm = c;
  await nextTick();
  SvgRenderer.fromLogo(logo, element);
};

const setPictorial = async c => {
  App._.logo.wm = c;
};
</script>

<template>
  <div>
    <div class="logo_container bg-strips" style="text-align: center">
      <svg ref="svg_container" />
    </div>

    <q-stepper
      v-model="_.step"
      header-nav
      ref="stepper"
      color="primary"
      animated
      style="margin: 0; padding-bottom: 2em"
      :contracted="$q.screen.width < 700"
    >
      <q-step :name="1" title="Templates" icon="sym_o_lists" active-icon="sym_o_lists" style="overflow: hidden">
        <div style="text-align: center; font-weight: bold; font-size: 1.5em">Templates</div>
        <div style="text-align: center; padding-bottom: 2em">
          Choose any of the templates below to start creating your logo.
        </div>

        <div style="max-width: 40em; margin: 0 auto">
          <div class="compact compact_list">
            <svg v-for="t in App._.templates" :ref="el => test(t, el)" @click="() => setTemplate(t)" />
          </div>
        </div>
      </q-step>

      <q-step :name="2" title="Mark" icon="apps" active-icon="apps" style="overflow: hidden">
        <div style="text-align: center; font-weight: bold; font-size: 1.5em">Pictorial &amp; Wordmark</div>
        <div style="text-align: center; padding-bottom: 2em">
          Choose any of the templates below to start creating your logo.
        </div>
        <div style="text-align: center; padding: 0 0 1em 0">
          <q-checkbox v-model="App._.logo.show_rptu_text" label="Show Wordmark" style="margin: 0 auto" />
        </div>
        <div class="compact">
          <svg
            v-for="c in $.letter_combinations"
            :class="App.arraysAreEqual(c, App._.logo.wm) ? 'selected' : ''"
            :ref="el => computeSvgFromCombination(c, el)"
            @click="() => setPictorial(c)"
          />
        </div>
      </q-step>

      <q-step :name="3" title="Co-Branding" icon="add_box" active-icon="add_box" style="overflow: hidden">
        <div style="text-align: center; font-weight: bold; font-size: 1.5em">Co-Branding</div>
        <div style="text-align: center; padding-bottom: 2em">Here you can add internal and external partners.</div>
        <q-card
          v-for="(partner, i) in App._.logo.co_branding"
          style="background-color: #fcfcfc; width: 100%; max-width: 25em; margin: 0 auto 2em auto"
        >
          <q-btn
            icon="close"
            round
            flat
            dense
            style="position: absolute; z-index: 100; right: 0.25em; top: 0.25em; color: #999"
            @click="() => deletePartner(partner)"
          />
          <q-card-section>
            <template v-for="g of ['Caption', 'Subcaption']">
              <template v-for="i of [0, 1]">
                <q-input
                  :placeholder="`${g} Row ${i + 1} ${i === 1 ? '(Optional)' : ''}`"
                  v-if="!(g === 'Subcaption' && i === 1) || partner.caption1"
                  v-model="partner[g.toLowerCase() + i]"
                  dense
                  :input-style="partner[g.toLowerCase() + i] === '' ? 'color:#aaa;' : ''"
                />
              </template>
            </template>
            <br />
            <img :src="partner.logo" style="display: block; margin: 0.5em auto 0 auto; max-height: 10em" />
            <q-btn
              label="Set Logo"
              color="grey-4"
              class="text-black"
              style="margin: 0.5em auto; display: block"
              dense
              @click="event => event.srcElement.nextSibling.click()"
            />
            <input type="file" @change="event => setLogo(event, partner)" accept="image/*" style="display: none" />
          </q-card-section>
        </q-card>

        <q-btn color="primary" style="display: block; margin: 0 auto" label="Add Partner" @click="addPartner" />
      </q-step>

      <q-step :name="5" title="Colors" icon="palette" active-icon="palette">
        <div style="text-align: center; font-weight: bold; font-size: 1.5em">Color Theme</div>
        <div style="text-align: center; padding-bottom: 2em">
          Click on any logo to adapt the corresponding color theme.
        </div>
        <div class="compact">
          <template v-for="(g, i) in $.colors">
            <svg v-for="(c, j) in g" :ref="el => computeSvgFromColor(c, el)" @click="() => setColor(c)" />
          </template>
        </div>
      </q-step>

      <q-step :name="6" title="Download" icon="download" active-icon="download" style="overflow: hidden">
        <!-- <div style="text-align: center; font-weight: bold; font-size: 1.5em">Download</div> -->
        <div style="text-align: center; padding-bottom: 2em">Download your logo as an SVG or PNG file.</div>

        <div style="text-align: center">
          <q-btn color="primary" label="SVG" icon="download" @click="() => App.downloadMaster(App._.logo, true)" />
          &nbsp;
          <q-btn color="primary" label="PNG" icon="download" @click="() => App.downloadMaster(App._.logo, false)" />
        </div>
      </q-step>
    </q-stepper>
  </div>
</template>

<style scoped>
.logo_container {
  zoom: 1;
  padding: 1em;
  min-height: 15em;
  height: 15em;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo_container svg {
  max-height: 12em;
}

.compact {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.compact_list {
  flex-direction: column;
  align-items: center;
}

.compact svg {
  max-height: 10em;
  border: 0.1em solid #000;
  border-radius: 0.25em;
  margin: 0.5em;
  cursor: pointer;
}

.compact svg:hover {
  filter: brightness(0.95);
}

.selected {
  border: 5px solid var(--q-primary) !important;
}
</style>
