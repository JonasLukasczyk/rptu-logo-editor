<script setup>
import App from './App.js';
import { t, lang } from './Translator.js';

import { useQuasar } from 'quasar';
const $q = useQuasar();
// $q.dark.set(true);

import { reactive, onMounted, computed } from 'vue';
import LogoList from './components/LogoList.vue';
import LogoEditor from './components/LogoEditor.vue';
import LogoEditorStepper from './components/LogoEditorStepper.vue';
import SideMenu from './components/SideMenu.vue';

const _ = reactive({});

const ui_state = computed({
  get: () => (!App._.connected ? 'connecting' : App._.logo === null ? 'logo_list' : 'logo_editor'),
});

const logout = () => {
  window.location.href = 'Shibboleth.sso/Logout?return=/';
};
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
            <img src="./assets/RPTU_logo-inverted.svg" style="height: 0.7em; margin-right: 0.5em" clickable />
            <span v-if="parseInt($q.screen.width) > 400">Logo Generator</span>
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

            <q-btn flat dense icon="menu">
              <q-menu anchor="bottom right" self="top right">
                <q-list style="min-width: 100px" dense>
                  <q-item clickable v-close-popup @click="logout">
                    <q-item-section>Logout</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable v-close-popup @click="() => (lang = 'DE')">
                    <q-item-section>Deutsch</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="() => (lang = 'EN')">
                    <q-item-section>English</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable v-close-popup>
                    <q-item-section>{{ t('Imprint', 'Impressum') }}</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup>
                    <q-item-section>{{ t('Data Protection', 'Datenschutz') }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>

            <q-btn label="DE" :class="lang === 'DE' ? 'text-weight-bolder' : ''" dense @click="() => (lang = 'DE')" />
            |
            <q-btn label="EN" :class="lang === 'EN' ? 'text-weight-bolder' : ''" dense @click="() => (lang = 'EN')" />
          </div>
        </div>
      </div>
    </div>
    <div style="padding: 0; position: absolute; top: 3em; bottom: 0; left: 0; right: 0">
      <div style="height: 100%; overflow-y: scroll; max-width: 1200px; margin: 0 auto">
        <q-list dense v-if="!App._.connected">
          <q-item>
            <q-item-section>
              <table style="margin: 2em auto">
                <tbody>
                  <tr>
                    <td style="padding-right: 1em">
                      <q-spinner color="primary" size="3em" :thickness="10" />
                    </td>
                    <td>{{ t(`Connecting to Server`, `Verbindung zum Server wird hergestellt`) }}</td>
                  </tr>
                </tbody>
              </table>
            </q-item-section>
          </q-item>
        </q-list>

        <q-carousel
          v-else
          v-model="ui_state"
          class="my_carousel"
          transition-prev="slide-right"
          transition-next="slide-left"
          animated
          style="height: auto; padding: 0; border-radius: 0; border: 0; box-shadow: 0"
          flat
        >
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
  src: url('./assets/RedHatDisplay-VariableFont_wght.woff2') format('woff2');
  font-weight: 100 1000;
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

.q-tooltip {
  padding: 0.5em 1em;
  max-width: 20em;
  font-size: 1em;
  background-color: black;
  color: white;
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

.fade-out {
  animation: fadeOut 0.2s ease forwards;
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

.fade-in {
  animation: fadeIn 0.2s ease forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
