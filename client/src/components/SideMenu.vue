<script setup>
import { ref } from 'vue';
</script>

<template>
  <q-list>
    <q-item
      clickable
      v-ripple
      active-class="text-orange"
    >
      <q-item-section avatar>
        <q-icon name="download" />
      </q-item-section>
      <q-item-section>Export</q-item-section>
    </q-item>
  </q-list>
</template>

<style scoped></style>
