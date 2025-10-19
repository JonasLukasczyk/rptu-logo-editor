<script setup>
import App from '../App.js';
import SvgRenderer from '../SvgRenderer.js';
import { ref, reactive, onMounted, nextTick } from 'vue';

const svg_containers = ref([]);

const _ = reactive({
  logos: [],
});

const init = async () => {
  console.log(App);
  _.logos = await App.LogoService.getLogos(App._.user);
};

const newLogo = async () => {
  App._.logo = await App.LogoService.newLogo(App._.user);
};
onMounted(init);
</script>

<template>
  <h3>Logo List</h3>
  {{_.logos}}
  <q-list dense>
    <q-item v-for="(logo, index) in _.logos" :key="index" clickable v-ripple @click="() => (App._.logo = App.clone(logo))">
      <q-item-section>
        <q-item-label>{{ logo.id }}</q-item-label>
        <q-item-label caption lines="1"
          >Created: {{ new Intl.DateTimeFormat('de-DE').format(new Date(logo.time)) }}</q-item-label
        >
      </q-item-section>
      <q-item-section>
        <svg :ref="el => SvgRenderer.fromLogo(logo, el)" />
      </q-item-section>
    </q-item>
    <q-item clickable v-ripple @click="newLogo">
      <q-item-section avatar>
        <q-icon name="add " />
      </q-item-section>
      <q-item-section> New Logo </q-item-section>
    </q-item>
  </q-list>
</template>

<style scoped>
svg {
  max-height:10em;
}
</style>
