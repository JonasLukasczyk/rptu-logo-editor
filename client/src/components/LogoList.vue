<script setup>
import App from '../App.js';
import { ref, reactive, onMounted, nextTick } from 'vue';

const svg_containers = ref([]);

const _ = reactive({
  logos: [],
});

const init = async () => {
  console.log(App);
  _.logos = await App.LogoService.dbAll(`SELECT * FROM logos WHERE email='${App._.user.email}';`, []);

  await nextTick();

  svg_containers.value.forEach((el, i) => {
    const svg = App.createSvgFromRecipe(_.logos[i].recipe);
    el.innerHTML = ''; // Clear previous content if necessary
    el.appendChild(svg);
  });
};

const newLogo = async () => {
  App._.logo = await App.LogoService.newLogo(App._.user);
};

onMounted(init);

const computeSvg = async (recipe,el)=>{
  await nextTick();
  App.createSvgFromRecipe(recipe,el)
};

</script>

<template>
  <h3>LogoListe</h3>

  <q-list dense>
    <q-item v-for="(i,index) in _.logos" :key='index' clickable v-ripple @click="() => (App._.logo = i)">
      <q-item-section>
        <q-item-label>{{ i.id }}</q-item-label>
        <q-item-label caption lines="1"
          >Created: {{ new Intl.DateTimeFormat('de-DE').format(new Date(i.time)) }}</q-item-label
        >
      </q-item-section>
      <q-item-section>
        <svg :ref="el=>computeSvg(i.recipe,el)" />
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

<style scoped></style>
