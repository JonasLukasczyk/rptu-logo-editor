<script setup>
const props = defineProps({
  title: String,
  steps: Object,
});
</script>

<template>
  <div style="display: flex; align-items: center; justify-content: center; font-size: 1.5em; font-weight: bold">
    <div style="width: 2em; text-align: center">
      <q-btn flat icon="chevron_left" dense v-if="props.steps.step > 2" rounded @click="props.steps.step -= 1" />
    </div>
    <div style="margin: 0 0em; padding-top: 0.1em">{{ props.title }}</div>
    <div style="width: 2em; text-align: center">
      <q-btn flat icon="chevron_right" dense rounded v-if="props.steps.step < 5" @click="props.steps.step += 1" />
    </div>
  </div>
</template>
