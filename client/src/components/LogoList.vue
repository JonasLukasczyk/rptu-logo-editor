<script setup>
import App from '../App.js';
import SvgRenderer from '../SvgRenderer.js';
import { ref, reactive, onMounted, nextTick } from 'vue';

const downloadSVG = ref();

const _ = reactive({
  logos: [],
});

const init = async () => {
  console.log('init');
  _.logos = await App.LogoService.getLogos(App._.user);
};

const toggleVerify = logo => {
  if (App._.user.email !== 'admin@rptu.de') return;
  logo.verified = !logo.verified;
  App.LogoService.updateLogo(logo);
};

const deleteLogo = async logo => {
  await App.LogoService.deleteLogo(logo.id);
  init();
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
      <q-item v-if="_.logos.length < 1">
        <q-item-section>
          <table style="margin: 2em auto">
            <tbody>
              <tr>
                <td><q-icon name="sym_o_hide_source" size="2em" class="text-grey-5" /></td>
                <td>No logos associated with current account</td>
              </tr>
            </tbody>
          </table>
        </q-item-section>
      </q-item>

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
                <q-item-label style="font-weight: bold">ID: {{ logo.id }}</q-item-label>
                <q-item-label caption lines="1">Owner: {{ logo.user.email }}</q-item-label>
                <q-item-label caption lines="1"
                  >Date: {{ new Intl.DateTimeFormat('de-DE').format(new Date(logo.time)) }}</q-item-label
                >
              </div>
              <div class="col-auto">
                <q-btn
                  v-if="false"
                  round
                  flat
                  :class="logo.verified ? 'text-green-6' : 'text-red-9'"
                  :icon="logo.verified ? 'verified' : 'sym_o_verified_off'"
                  dense
                  @click="() => toggleVerify(logo)"
                />
                <q-btn round flat class="text-grey-9" icon="delete" dense @click="() => deleteLogo(logo)" />
                <q-btn round flat class="text-grey-9" icon="edit_document" dense @click="() => (App._.logo = logo)" />
                <q-btn round flat class="text-grey-9" icon="download" dense>
                  <q-menu>
                    <q-list dense>
                      <q-item clickable v-close-popup @click='()=>App.downloadMaster(logo,true)'>
                        <q-item-section>SVG</q-item-section>
                      </q-item>
                      <q-item clickable v-close-popup @click='()=>App.downloadMaster(logo,false)'>
                        <q-item-section>PNG</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>
            </div>
          </q-card-section>

          <q-card-section class="bg-strips" style="text-align: center; padding: 1em 1em 0.5em 1em">
            <svg :ref="el => SvgRenderer.fromLogo(logo, el)" />
          </q-card-section>
        </q-card>
      </q-item>
    </q-list>

    <div style="text-align: center; margin-top: 1em">
      <q-btn label="New Logo" icon="add_circle" class="bg-primary text-white" @click="newLogo" />
    </div>
  </div>
</template>

<style scoped>
svg {
  max-height: 10em;
}
</style>
