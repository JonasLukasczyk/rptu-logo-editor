<script setup>
import App from '../App.js';
import SvgRenderer from '../SvgRenderer.js';
import { ref, reactive, onMounted, nextTick } from 'vue';

const downloadSVG = ref();

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
  <div>
    <!-- <div style="font-weight: bold; font-size: 2em">Logos</div> -->

    <q-list dense>
      <q-item
        v-for="(logo, index) in _.logos"
        :key="index"
        @click="() => (App._.logo = App.clone(logo))"
        style="padding: 1em 1em"
      >
        <q-card style="width: 100%" class="" bordered>
          <q-card-section style="border-bottom: 1px solid #ccc">
            <div class="row items-center no-wrap">
              <div class="col">
                <q-item-label>ID: {{ logo.id }}</q-item-label>
                <q-item-label caption lines="1">Owner: {{ logo.user.email }}</q-item-label>
                <q-item-label caption lines="1"
                  >Created On: {{ new Intl.DateTimeFormat('de-DE').format(new Date(logo.time)) }}</q-item-label
                >
              </div>
              <div class="col-auto">
                <q-btn round flat class="text-green-6" icon="verified" dense />
                <q-btn round flat class="text-red-9" icon="delete" dense />
                <q-btn round flat class="text-black" icon="edit_document" dense @click="() => (App._.logo = logo)" />
                <q-btn round flat class="text-black" icon="download" dense @click="() => App.download(logo)" />
              </div>
            </div>
          </q-card-section>

          <q-card-section style="text-align: center; padding: 0">
            <svg :ref="el => SvgRenderer.fromLogo(logo, el)" />
          </q-card-section>
        </q-card>
      </q-item>
    </q-list>

    <div style="text-align: center; margin-top: 1em">
      <q-btn label="New Logo" icon="add_circle" class="bg-primary text-white" />
    </div>

    <div style="visibility: hidden; position: absolute">
      <svg ref="downloadSVG" />
    </div>
  </div>
</template>

<style scoped>
svg {
  max-height: 10em;
}
</style>
