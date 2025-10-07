<script setup>
import App from './App.js';

import { reactive } from 'vue';
import LoginMask from './components/LoginMask.vue';
import LogoList from './components/LogoList.vue';
import LogoEditor from './components/LogoEditor.vue';
import SideMenu from './components/SideMenu.vue';

const _ = reactive({
  leftDrawerOpen: false,
  rightDrawerOpen: false,
});
</script>

<template>
  <q-layout view="hHh LpR fFf">
    <q-header class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar>
            <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg" />
          </q-avatar>
          Title
        </q-toolbar-title>
        <q-btn v-if="!App._.connected" icon="warning" />
        <q-item v-if='App._.user' class="q-mb-sm" clickable v-ripple dense>
          <q-item-section avatar>
            <q-avatar>
              <q-icon name="person" size='40px'/>
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ App._.user.name }}</q-item-label>
            <q-item-label caption lines="1" class='text-white'>{{ App._.user.email }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-toolbar>
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
      <LoginMask v-if="App._.user === null" />
      <LogoList v-else-if="App._.logo === null" />
      <LogoEditor v-else />
    </q-page-container>
  </q-layout>
</template>
