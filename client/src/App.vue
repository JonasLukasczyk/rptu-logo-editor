<script setup>
import App from './App.js';
import { t, lang } from './Translator.js';

import { useQuasar } from 'quasar';
const $q = useQuasar();
// $q.dark.set(true);

import { reactive, onMounted, computed } from 'vue';
import LoginMask from './components/LoginMask.vue';
import LogoList from './components/LogoList.vue';
import LogoEditor from './components/LogoEditor.vue';
import LogoEditorStepper from './components/LogoEditorStepper.vue';
import SideMenu from './components/SideMenu.vue';
import RedHatB64 from './assets/red-hat-display-v21-latin-regular.js';

const _ = reactive({
  leftDrawerOpen: false,
  rightDrawerOpen: false,
});

const ui_state = computed({
  get: () => (App._.user === null ? 'login' : App._.logo === null ? 'logo_list' : 'logo_editor'),
});

onMounted(() => {
  const fontName = 'RedHat';
  const fontStyle = `
  @font-face {
    font-family: '${fontName}';
    src: url('data:font/woff2;base64,${RedHatB64}') format('woff2');
    font-weight: normal;
    font-style: normal;
  }
`;

  const style = document.createElement('style');
  style.type = 'text/css';
  style.appendChild(document.createTextNode(fontStyle));
  document.head.appendChild(style);
});
</script>

<template>
  <div>
    <div
      class="bg-black text-white"
      style="padding: 0.2em 0.5em; height: 3em; position: absolute; top: 0; left: 0; right: 0"
    >
      <div style="max-width: 1200px; margin: 0 auto">
        <div style="display: flex; width: 100%; justify-content: space-between">
          <div class="text-h6" :style="`flex: ${$q.screen.width > 700 ? 1 : 2}; text-align: left;padding-top:0.1em`">
            <img src="./assets/RPTU_logo-inverted.svg" style="height: 0.7em; margin-right: 0.5em" />Logo Generator
          </div>
          <div style="flex: 1; text-align: right">
            <q-btn
              v-if="App._.logo"
              flat
              dense
              icon="auto_awesome_motion"
              @click="
                () => {
                  App._.logo = null;
                }
              "
            />

            <q-btn
              dense
              v-if="App._.user"
              icon="logout"
              flat
              @click="
                () => {
                  App._.user = null;
                  App._.logo = null;
                }
              "
            />
            <q-btn label="DE" :class="lang === 'DE' ? 'text-weight-bolder' : ''" dense @click="() => (lang = 'DE')" />
            |
            <q-btn label="EN" :class="lang === 'EN' ? 'text-weight-bolder' : ''" dense @click="() => (lang = 'EN')" />
          </div>
        </div>
      </div>
    </div>
    <div style="padding: 0; position: absolute; top: 3em; bottom: 0; left: 0; right: 0">
      <div style="height: 100%; overflow-y: scroll">
        <q-carousel
          v-model="ui_state"
          class="my_carousel"
          transition-prev="slide-right"
          transition-next="slide-left"
          animated
          style="
            height: auto;
            padding: 0;
            border-radius: 0;
            border: 0;
            max-width: 1200px;
            margin: 0 auto;
            box-shadow: 0;
          "
          flat
        >
          <q-carousel-slide name="login">
            <LoginMask />
          </q-carousel-slide>
          <q-carousel-slide name="logo_list" style="">
            <LogoList />
          </q-carousel-slide>
          <q-carousel-slide name="logo_editor" style="padding: 0">
            <LogoEditorStepper />
          </q-carousel-slide>
        </q-carousel>
      </div>
    </div>
  </div>
</template>

<style>
@font-face {
  font-family: 'RedHat';
  src: url('./assets/red-hat-display-v21-latin-regular.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

.material-symbols-outlined {
  font-variation-settings:
    'FILL' 1,
    /* <— makes it filled */ 'wght' 400,
    'GRAD' 0,
    'opsz' 48;
}

body {
  font-family: 'RedHat', Arial, sans-serif;
  background-color: #e0e0e0;
}

.my_carousel > .q-carousel__slides-container > .scroll {
  overflow: hidden !important;
}

:root {
  --stripe-angle: -45deg;
  --stripe-size: 20px;
  --stripe-color1: #d2d2d2;
  --stripe-color2: #c2c2c2;
}

.bg-strips {
  background: repeating-linear-gradient(
    var(--stripe-angle),
    var(--stripe-color1),
    var(--stripe-color1) var(--stripe-size),
    var(--stripe-color2) var(--stripe-size),
    var(--stripe-color2) calc(var(--stripe-size) * 2)
  );
}

.q-stepper {
  box-shadow: none;
}
</style>
