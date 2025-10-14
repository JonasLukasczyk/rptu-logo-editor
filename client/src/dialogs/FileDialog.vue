<script lang="ts" setup>
import { reactive, onMounted, ref } from 'vue';

import App from '../App.js';

const file = ref(null);

export interface Props {}
const props = defineProps<Props>();

const _ = reactive({
  value: '',
});

import { useDialogPluginComponent } from 'quasar';
defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

const processFile = event => {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('Please upload a valid image file.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    onDialogOK(e.target.result);
  };
  reader.readAsDataURL(file);
};
</script>

<template>
  <q-dialog ref="dialogRef" backdrop-filter="blur(4px) grayscale(50%)" @hide="onDialogHide">
    <q-card class="q-dialog-plugin" style="min-width: 45em; border: 0.1em solid white">
      <input type="file" ref="file" @change="processFile" accept="image/*" />
    </q-card>
  </q-dialog>
</template>

<style></style>
