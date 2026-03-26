<script setup>
import App from '../App.js';
import t from '../Translator.js';
import SvgRenderer from '../SvgRenderer.js';
import StepTitle from './StepTitle.vue';
import { watch, reactive, ref, onMounted, nextTick } from 'vue';
import $ from '../Constants.js';
import svgpath from 'svgpath';

import { useQuasar, Dialog } from 'quasar';
import default_sub_logo from '../assets/default_sub_logo.js';

const svg_container = ref(null);
const $q = useQuasar();

const _ = reactive({
  step: 2,
});

const update = async () => {
  const logo = App._.logo;
  if (!logo || !svg_container.value) return;
  const svg = svg_container.value;
  await SvgRenderer.fromLogo(logo, svg, false, false);
};

const init = async () => {
  await nextTick();
  watch(() => App._.logo, App.debounce(update, 10), { deep: true });
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
};

const computeColorTemplates = async (container, colorFriendly) => {
  if (!container) return;

  container.innerHTML = '';

  const svg = container.appendChild(SvgRenderer.newElement('svg'));
  const logo = App.clone(App._.logo);
  logo.b_color = '#XXXXXX';
  logo.t_color = '#YYYYYY';
  await SvgRenderer.fromLogo(logo, svg);
  svg.remove();

  for (let pairs of $.colors)
    for (let pair of pairs) {
      if (pair[2] !== colorFriendly) continue;
      const newSvg = container.appendChild(SvgRenderer.newElement('svg'));
      newSvg.setAttribute('viewBox', svg.getAttribute('viewBox'));
      newSvg.innerHTML = svg.innerHTML.replaceAll('#XXXXXX', pair[0]);
      newSvg.innerHTML = newSvg.innerHTML.replaceAll('#YYYYYY', pair[1]);
      newSvg.addEventListener('click', () => setColor(pair));
    }
};

const setColor = colors => {
  const logo = App._.logo;
  logo.b_color = colors[0];
  logo.t_color = colors[1];
  _.step = 5;
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
};

const computeSvgFromCombination = async (c, element) => {
  if (App._.logo === null) return;
  const logo = App.clone(App._.logo);
  logo.co_branding = [];
  logo.show_rptu_text = false;
  logo.wm = c;
  await nextTick();
  SvgRenderer.fromLogo(logo, element);
};

const setPictorial = async c => {
  App._.logo.wm = c;
};

const saveLogo = async () => {
  await App.LogoService.updateLogo(App._.logo);
  App._.logo = null;
};
</script>

<template>
  <div v-if="App._.logo !== null">
    <div class="logo_container bg-strips" style="text-align: center">
      <svg ref="svg_container" />
    </div>

    <q-stepper
      v-model="_.step"
      header-nav
      ref="stepper"
      animated
      style="margin: 0; padding-bottom: 2em"
      :contracted="$q.screen.width < 750"
    >
      <template v-slot:message>
        <div style="padding: 1em">
          <StepTitle :steps="_" />
        </div>
      </template>

      <q-step
        :name="2"
        :title="t(`Pictorial &amp; Wordmark`, `Bild- &amp; Textmarke`)"
        icon="apps"
        active-icon="apps"
        style="overflow: hidden"
      >
        <div style="text-align: center; padding-bottom: 2em">
          {{
            t(
              `Set wordmark visibility and choose pictorial.`,
              `Stellen Sie die Sichtbarkeit der Textmarke ein und wählen Sie eine Bildmarke aus.`
            )
          }}
        </div>
        <div style="text-align: center; padding: 0 0 1em 0">
          <q-checkbox
            v-model="App._.logo.show_rptu_text"
            color="secondary"
            :label="t(`Show Wordmark`, `Textmarke Anzeigen`)"
            style="margin: 0 auto"
          />
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
        <div style="text-align: center; padding-bottom: 2em">
          {{
            t(
              `Here you can add internal and external partners.`,
              `Hier können Sie interne und externe Partner hinzufügen.`
            )
          }}
        </div>
        <div style="text-align: center; padding: 0 0 1em 0">
          <q-checkbox
            v-model="App._.logo.external_partners"
            color="secondary"
            :label="t(`Partners are external`, `Partner sind extern`)"
            style="margin: 0 auto"
          />
        </div>
        <div class="compact">
          <q-card
            v-for="(partner, i) in App._.logo.co_branding"
            class="bg-grey-2"
            style="width: 100%; max-width: 25em; margin: 1em; border: 1px solid #ccc"
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
              <q-input
                placeholder="Caption Row 1"
                debounce="500"
                v-model="partner.caption0"
                dense
                :input-style="partner.caption0 === '' ? 'color:#aaa;' : ''"
              />
              <q-input
                v-if="!App._.logo.external_partners"
                debounce="500"
                placeholder="Caption Row 2 (Optional)"
                v-model="partner.caption1"
                dense
                :input-style="partner.caption1 === '' ? 'color:#aaa;' : ''"
              />
              <q-input
                v-if="!App._.logo.external_partners"
                debounce="500"
                placeholder="Subcaption Row 1"
                v-model="partner.subcaption0"
                dense
                :input-style="partner.subcaption0 === '' ? 'color:#aaa;' : ''"
              />
              <q-input
                v-if="!App._.logo.external_partners && partner.caption1 !== ''"
                debounce="500"
                placeholder="Subcaption Row 2 (Optional)"
                v-model="partner.subcaption1"
                dense
                :input-style="partner.subcaption1 === '' ? 'color:#aaa;' : ''"
              />
              <br />
              <img
                :src="partner.logo"
                style="display: block; margin: 0.5em auto 0 auto; max-height: 10em; max-width: 100%"
              />
              <q-btn
                label="Set Logo"
                color="grey-4"
                class="text-black"
                style="margin: 0.5em auto; display: block"
                icon="image_search"
                dense
                @click="event => event.srcElement.nextSibling.click()"
              />
              <input type="file" @change="event => setLogo(event, partner)" accept="image/*" style="display: none" />
            </q-card-section>
          </q-card>
        </div>

        <q-btn
          color="primary"
          style="display: block; margin: 0 auto"
          label="Partner"
          @click="addPartner"
          icon="add_circle"
        />
      </q-step>

      <q-step :name="4" :title="t(`Colors`, `Farben`)" icon="palette" active-icon="palette">
        <div style="text-align: center; padding-bottom: 2em">
          {{
            t(
              `Click on any logo to adapt the corresponding color theme.`,
              `Klicken Sie auf einen Vorschlag um die Farbkombination zu übernehmen.`
            )
          }}
        </div>

        <div style="text-align: center; font-weight: bold; font-size: 1.5em">
          <q-icon name="visibility" style="margin-right: 0.5em" />
          {{ t(`Accessible Color Themes`, `Barrierefreie Farbkombinationen`) }}
        </div>
        <div class="compact" :ref="el => computeColorTemplates(el, true)" />

        <div style="text-align: center; font-weight: bold; font-size: 1.5em; margin-top: 3em">
          <q-icon name="visibility_off" style="margin-right: 0.5em" />
          {{ t(`Inaccessible Color Theme`, `Nicht barrierefreie Farbkombinationen`) }}
        </div>
        <q-banner style="margin: 0 auto; max-width: 60em">
          <template v-slot:avatar>
            <q-icon name="warning" color="primary" />
          </template>
          <div style="border-left: 0.1em solid black; padding-left: 1em">
            {{
              t(
                `These color combination are not accessible and should be avoided for web use. It may be used in print products, but even there they should be carefully assessed to ensure adequate readability and accessibility.`,
                `Nicht barrierefreie Farbkombinationen sollten für Webanwendungen unbedingt vermieden werden. Für Printprodukte können sie zwar grundsätzlich eingesetzt werden, jedoch sollte auch hier sorgfältig abgewogen werden, ob sie den Anforderungen an gute Lesbarkeit und Zugänglichkeit genügen.`
              )
            }}
          </div>
        </q-banner>
        <div class="compact" :ref="el => computeColorTemplates(el, false)" />
      </q-step>

      <q-step :name="5" :title="t('Save', 'Speichern')" icon="save" active-icon="save" style="overflow: hidden">
        <div style="text-align: center; padding-bottom: 2em">
          {{
            t(
              `Save your logo to donwload it afterwards from the logo list.`,
              `Speichern Sie das Logo ab um es anschließend von der Logo Liste herunterzuladen.`
            )
          }}
        </div>

        <div style="text-align: center">
          <q-btn color="primary" class="q-ma-md" :label="t('Save', 'Speichern')" icon="save" @click="saveLogo" />
            <q-btn color="red-8" class="q-ma-md" :label="t('Discard', 'Verwerfen')" icon="cancel" @click="()=>App._.logo=null" />
        </div>
      </q-step>
    </q-stepper>
  </div>
</template>

<style>
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
  border: 5px solid var(--q-secondary) !important;
}
</style>
