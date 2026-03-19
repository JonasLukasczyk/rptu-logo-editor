<script setup>
import t from '../Translator.js';
const props = defineProps({
  steps: Object,
});
</script>

<template>
  <div style="display: flex; align-items: center; justify-content: center; font-size: 1.5em; font-weight: bold">
    <div style="width: 8em; text-align: left">
      <template v-if="props.steps.step > 2">
        <q-btn
          v-if="$q.screen.width > 450"
          color="primary"
          icon="chevron_left"
          style="padding-right: 1em"
          :label="t(`Back`, `Zurück`)"
          dense
          @click="props.steps.step -= 1"
        />
        <q-btn v-else flat icon="chevron_left" dense @click="props.steps.step -= 1" />
      </template>
    </div>
    <div class="col-grow" style="text-align: center">
      {{
        [
          t(`Pictorial &amp; Wordmark`, `Bild- &amp; Textmarke`),
          `Co-Branding`,
          t('Color Theme', 'Farbkombinationen'),
          t('Save', 'Speichern'),
        ][props.steps.step - 2]
      }}
    </div>
    <div style="width: 8em; text-align: right">
      <template v-if="props.steps.step < 5">
        <q-btn
          v-if="$q.screen.width > 450"
          color="primary"
          icon-right="chevron_right"
          style="padding-left: 1em"
          :label="t(`Continue`, `Weiter`)"
          dense
          @click="props.steps.step += 1"
        />
        <q-btn v-else flat icon="chevron_right" dense @click="props.steps.step += 1" />
      </template>
    </div>
  </div>
</template>
