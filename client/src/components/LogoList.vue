<script setup>
import App from '../App.js';
import t from '../Translator.js';
import SvgRenderer from '../SvgRenderer.js';
import { reactive, onMounted } from 'vue';
import { Dialog } from 'quasar';
import ConfirmationDialog from '../dialogs/ConfirmationDialog.vue';

const renderedLogoIds = new Set();

const state = reactive({
  cursor: null,
  n: 5,
  loading: false,
  reachedEnd: false,
});

const renderLogoSvg = (el, logo) => {
  if (!el) return;
  if (renderedLogoIds.has(logo.id)) return;

  SvgRenderer.fromLogo(logo, el);
  renderedLogoIds.add(logo.id);
};

const addLogos = logos => {
  for (const logo of logos) {
    if (!App._.logos.some(existing => existing.id === logo.id)) {
      App._.logos.push(logo);
    }
  }
};

const fetchNextLogos = async () => {
  if (state.loading) return;

  state.loading = true;

  try {
    const page = await App.LogoService.getLogos({
      cursor: state.cursor,
      n: state.n,
    });

    addLogos(page.data);

    if (page.data.length > 0) {
      state.cursor = page.nextCursor;
    }

    state.reachedEnd = page.nextCursor === null;
  } finally {
    state.loading = false;
  }
};

const refreshLogos = async () => {
  if (state.loading) return;

  App._.logos = [];
  renderedLogoIds.clear();

  state.cursor = null;
  state.reachedEnd = false;

  await fetchNextLogos();
};

const toggleVerify = async logo => {
  await App.LogoService.toggleVerification(logo);
};

const deleteLogo = logo => {
  Dialog.create({
    component: ConfirmationDialog,
    componentProps: {
      title: t('Delete Logo', 'Logo Löschen'),
      message: t(`Do you want to delete logo ${logo.id}?`, `Wollen Sie Logo ${logo.id} löschen?`),
    },
  }).onOk(async () => {
    await App.LogoService.deleteLogo({ id: logo.id });

    App._.logos = App._.logos.filter(existing => existing.id !== logo.id);
    renderedLogoIds.delete(logo.id);

    await fetchNextLogos();
  });
};

const newLogo = async () => {
  App._.logo = await App.LogoService.newLogo();

  await refreshLogos();
};

onMounted(refreshLogos);
</script>

<template>
  <div>
    <q-list dense>
      <div v-if="App._.logos !== null" style="text-align: center">
        <q-btn :label="t('Logo', 'Logo')" icon="add_circle" class="bg-primary text-white q-ma-md" @click="newLogo" />

        <q-btn
          :label="t('Refresh', 'Aktualisieren')"
          icon="refresh"
          class="bg-primary text-white q-ma-md"
          :loading="state.loading"
          :disable="state.loading"
          @click="refreshLogos"
        />
      </div>

      <q-item v-if="App._.logos === null">
        <q-spinner size="4em" style="margin: 0 auto; display: block" />
      </q-item>

      <q-item v-else-if="App._.logos.length < 1 && !state.loading">
        <q-item-section>
          <table style="margin: 2em auto">
            <tbody>
              <tr>
                <td>
                  <q-icon name="sym_o_hide_source" size="2em" class="text-grey-5" />
                </td>
                <td>
                  {{ t('No logos associated with current account', 'Keine Logos mit dem aktuellen Account verbunden') }}
                </td>
              </tr>
            </tbody>
          </table>
        </q-item-section>
      </q-item>

      <q-item
        v-for="logo in App._.logos"
        :key="logo.id"
        style="padding: 1em 1em"
        @click="() => (App._.logo = App.clone(logo))"
      >
        <q-card style="width: 100%" bordered>
          <q-card-section style="border-bottom: 1px solid #ccc">
            <div class="row items-center no-wrap">
              <div class="col">
                <q-item-label style="font-weight: bold">ID: {{ logo.id }}</q-item-label>

                <q-item-label caption lines="1">
                  {{ t('Author', 'Autor') }}: {{ logo.user.name }} ({{ logo.user.email }})
                </q-item-label>

                <q-item-label caption lines="1">
                  {{ t('Created', 'Erstellt') }}:
                  {{ new Intl.DateTimeFormat('de-DE').format(new Date(logo.time)) }}
                </q-item-label>
              </div>

              <div class="col-auto">
                <q-btn
                  round
                  flat
                  dense
                  :class="logo.verified ? 'text-green-6' : 'text-red-9'"
                  :icon="logo.verified ? 'verified' : 'sym_o_verified_off'"
                  @click.stop="() => toggleVerify(logo)"
                >
                  <q-tooltip>
                    {{
                      t(
                        logo.verified
                          ? 'Verified by the Department of University Communications'
                          : 'Pending verification by the Department of University Communications',
                        logo.verified
                          ? 'Verifiziert von der Universitätskommunikation'
                          : 'Ausstehende Verifizierung der Universitätskommunikation'
                      )
                    }}
                  </q-tooltip>
                </q-btn>

                <q-btn round flat dense class="text-grey-9" icon="delete" @click.stop="() => deleteLogo(logo)" />

                <q-btn
                  round
                  flat
                  dense
                  class="text-grey-9"
                  icon="edit_document"
                  @click.stop="() => (App._.logo = logo)"
                />

                <q-btn round flat dense class="text-grey-9" icon="download" @click.stop>
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

          <q-card-section class="bg-strips logo-preview">
            <svg :ref="el => renderLogoSvg(el, logo)" />
          </q-card-section>
        </q-card>
      </q-item>

      <q-item v-if="App._.logos !== null">
        <q-item-section style="text-align: center">
          <q-btn
            :label="t('Load more', 'Mehr laden')"
            icon="expand_more"
            class="bg-primary text-white q-ma-md"
            :loading="state.loading"
            :disable="state.loading"
            @click="fetchNextLogos"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<style scoped>
.logo-preview {
  text-align: center;
  padding: 1em 1em 0.5em 1em;
}

svg {
  display: block;
  max-width: 100%;
  max-height: 12em;
  width: auto;
  height: auto;
  margin: 0 auto;
}
</style>
