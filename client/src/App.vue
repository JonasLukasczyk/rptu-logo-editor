<script setup>
import App from './App.js';

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
  <q-card :style="
    $q.screen.width > 700
    ? `max-width: 50em; margin: 2em auto 2em auto; border-radius: 0.5em`
    : `max-width: 50em; margin: 0 auto 0 auto; border-radius: 0`
    ">
    <q-card-section
      :class="App._.connected ? 'bg-primary' : 'bg-red-7'"
      class="bg-primary text-white"
      style="padding: 0em 0.5em"
    >
      <div style="display: flex; width: 100%; justify-content: space-between">
        <div class="text-h6" :style="`flex: ${$q.screen.width > 700 ? 1 : 2}; text-align: left;padding-top:0.1em`">
          Logo Generator
        </div>
        <div style="flex: 1; text-align: center">
          <q-btn
            v-if="App._.logo"
            flat
            @click="
              () => {
                App._.logo = null;
              }
            "
          >
            <div class="row items-center no-wrap">
              <q-icon left name="menu" />
              <div v-if="$q.screen.width > 700" class="text-center" style="padding-top: 0.2em">Logos</div>
            </div>
          </q-btn>
        </div>
        <div style="flex: 1; text-align: right">
          <q-btn
            v-if="App._.user"
            flat
            @click="
              () => {
                App._.user = null;
                App._.logo = null;
              }
            "
          >
            <div class="row items-center no-wrap">
              <div v-if="$q.screen.width > 700" class="text-center" style="padding-top: 0.2em">
                {{ App._.user.email }}
              </div>
              <q-icon right name="logout" />
            </div>
          </q-btn>
        </div>
      </div>
    </q-card-section>
    <q-card-section style="padding: 0;">
      <q-carousel
        v-model="ui_state"
        class="my_carousel"
        transition-prev="slide-right"
        transition-next="slide-left"
        animated
        style="height: auto; padding: 0; border-radius: 0 0 1em 1em"
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
    </q-card-section>
  </q-card>
</template>

<style>
.material-symbols-outlined {
  font-variation-settings:
    'FILL' 1,
    /* <— makes it filled */ 'wght' 400,
    'GRAD' 0,
    'opsz' 48;
}

body {
  background-color: #e0e0e0;
}

.my_carousel > .q-carousel__slides-container > .scroll {
  overflow: hidden !important;
}

@font-face {
  font-family: 'RedHat';
  font-weight: 400;
  font-style: normal;
}

.text-red-hat {
  font-family: 'RedHat', sans-serif;
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
</style>
