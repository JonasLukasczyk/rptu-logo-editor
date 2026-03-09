<script setup>
import App from '../App.js';

const props = defineProps({
  title: String,
  message: String,
});

import { useDialogPluginComponent } from 'quasar';
defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
</script>

<template>
  <q-dialog ref="dialogRef" backdrop-filter="blur(4px) grayscale(50%)" @hide="onDialogHide">
    <q-card class="q-dialog-plugin bg-white" style="min-width: 25em; padding: 0 0.5em 0.5em 0.5em">
      <q-card-section class="">
        <div class="text-h6">{{ props.title }}</div>
        <div class="text-subtitle2">{{ props.message }}</div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat icon="delete" class="bg-red-9 text-white" @click="onDialogOK">Delete</q-btn>
        <q-btn flat @click="onDialogCancel">Cancel</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style></style>
