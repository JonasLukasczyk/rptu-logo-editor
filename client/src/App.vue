<script setup>
import App from './App.js';

import { useQuasar } from 'quasar';
const $q = useQuasar();
// $q.dark.set(true);

import { reactive } from 'vue';
import LoginMask from './components/LoginMask.vue';
import LogoList from './components/LogoList.vue';
import LogoEditor from './components/LogoEditor.vue';
import LogoEditorStepper from './components/LogoEditorStepper.vue';
import SideMenu from './components/SideMenu.vue';
import red_hat_font_b64 from './assets/red-hat-display-v21-latin-regular.js';

const _ = reactive({
  leftDrawerOpen: false,
  rightDrawerOpen: false,
});
</script>

<template>
  <q-layout view="hHh LpR fFf">
    <q-header class="bg-primary text-white">
      <!-- <span style='text-align:center; font-size:16px;'>RPTU Logo Generator</span> -->
    </q-header>

    <!-- <q-drawer -->
    <!--   show-if-above -->
    <!--   v-model="_.leftDrawerOpen" -->
    <!--   side="left" -->
    <!--   bordered -->
    <!-- > -->
    <!--   <SideMenu /> -->
    <!-- </q-drawer> -->
    <!---->
    <!-- <q-drawer -->
    <!--   show-if-above -->
    <!--   v-model="_.rightDrawerOpen" -->
    <!--   side="right" -->
    <!--   bordered -->
    <!-- > -->
    <!-- </q-drawer> -->

    <q-page-container>
      <div style='max-width:50em; margin: 0 auto;'>
        <LoginMask v-if="App._.user === null" />
        <LogoList v-else-if="App._.logo === null" />
        <LogoEditorStepper v-else />
      </div>
    </q-page-container>
  </q-layout>
</template>

<style>

body {
 background-color: #e0e0e0;
}

@font-face {
  font-family: 'RedHat';
  font-weight: 400;
  font-style: normal;
}

.text-red-hat {
  font-family: 'RedHat', sans-serif;
}
</style>
