<script setup>
import App from '../App.js';
import t from '../Translator.js';
import SvgRenderer from '../SvgRenderer.js';
import { ref, reactive, onMounted, nextTick } from 'vue';
import { Dialog } from 'quasar';
import ConfirmationDialog from '../dialogs/ConfirmationDialog.vue';

const downloadSVG = ref();

const init = async () => {
  App._.logos = await App.LogoService.getLogos();
};

const toggleVerify = logo => {
  // if (App._.user.email !== 'admin@rptu.de') return;
  // logo.verified = !logo.verified;
  App.LogoService.toggleVerification(logo);
};

const deleteLogo = async logo => {
  Dialog.create({
    component: ConfirmationDialog,
    componentProps: {
      title: t('Delete Logo','Logo Löschen'),
      message: t(`Do you want to delete logo ${logo.id}?`,`Wollen Sie Logo ${logo.id} löschen?`),
    },
  }).onOk(async () => {
    await App.LogoService.deleteLogo(logo.id);
  });
};

const newLogo = async () => {
  App._.logo = await App.LogoService.newLogo();
};
onMounted(init);
</script>

<template>
  <div>
    <q-list dense>
      <q-item v-if="App._.logos.length < 1">
        <q-item-section>
          <table style="margin: 2em auto">
            <tbody>
              <tr>
                <td><q-icon name="sym_o_hide_source" size="2em" class="text-grey-5" /></td>
                <td>
                  {{ t(`No logos associated with current account`, `Keine Logos mit dem aktuellen Account verbunden`) }}
                </td>
              </tr>
            </tbody>
          </table>
        </q-item-section>
      </q-item>

      <q-item
        v-for="(logo, index) in App._.logos"
        :key="index"
        @click="() => (App._.logo = App.clone(logo))"
        style="padding: 1em 1em"
      >
        <q-card style="width: 100%" class="" bordered>
          <q-card-section style="border-bottom: 1px solid #ccc">
            <div class="row items-center no-wrap">
              <div class="col">
                <q-item-label style="font-weight: bold">ID: {{ logo.id }}</q-item-label>
                <q-item-label caption lines="1"
                  >{{ t(`Author`, `Autor`) }}: {{ logo.user.name }} ({{ logo.user.email }})</q-item-label
                >
                <q-item-label caption lines="1"
                  >{{ t(`Created`, `Erstellt`) }}:
                  {{ new Intl.DateTimeFormat('de-DE').format(new Date(logo.time)) }}</q-item-label
                >
              </div>
              <div class="col-auto">
                <q-btn
                  round
                  flat
                  :class="logo.verified ? 'text-green-6' : 'text-red-9'"
                  :icon="logo.verified ? 'verified' : 'sym_o_verified_off'"
                  dense
                  @click="() => toggleVerify(logo)"
                >
                  <q-tooltip
                    >{{
                      t(
                        logo.verified
                          ? `Verrified by the Department of University Communications`
                          : `Requires verrification by the Department of University Communications`,
                        logo.verified
                          ? `Verifiziert von der Universitätskommunikation`
                          : `Ausstehende verifizierung der Universitätskommunikation`
                      )
                    }}
                  </q-tooltip>
                </q-btn>
                <q-btn round flat class="text-grey-9" icon="delete" dense @click="() => deleteLogo(logo)" />
                <q-btn round flat class="text-grey-9" icon="edit_document" dense @click="() => (App._.logo = logo)" />
                <q-btn round flat class="text-grey-9" icon="download" dense>
                  <q-menu>
                    <q-list dense>
                      <q-item clickable v-close-popup @click="() => App.downloadMaster(logo, 'svg')">
                        <q-item-section>SVG</q-item-section>
                      </q-item>
                      <q-item clickable v-close-popup @click="() => App.downloadMaster(logo, 'png')">
                        <q-item-section>PNG</q-item-section>
                      </q-item>
                      <q-item clickable v-close-popup @click="() => App.downloadMaster(logo, 'jpeg', 0.98)">
                        <q-item-section>JPEG</q-item-section>
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
      <q-btn label="Logo" icon="add_circle" class="bg-primary text-white" @click="newLogo" />
    </div>
  </div>
</template>

<style scoped>
svg {
  max-height: 10em;
}
</style>
