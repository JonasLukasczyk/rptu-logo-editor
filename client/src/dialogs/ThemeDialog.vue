<script lang="ts" setup>
import { reactive, onMounted, ref, nextTick } from 'vue';

import App from '../App.js';
import $ from '../Constants.js';

const svg_containers = ref([]);

export interface Props {
  recipe: Object;
}
const props = defineProps<Props>();

const _ = reactive({
  color_group_containers: [[], [], []],
});

import { useDialogPluginComponent } from 'quasar';
defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

const computeSvg = async (colors, el) => {
  if (!el) return;
  const recipe = App.clone(props.recipe);
  recipe.b_color = colors[0];
  recipe.t_color = colors[1];

  await nextTick();
  App.createSvgFromRecipe(recipe,el);
};
</script>

<template>
  <q-dialog ref="dialogRef" backdrop-filter="blur(4px) grayscale(50%)">
    <q-card class="q-dialog-plugin" style="min-width: 45em; border: 0.1em solid white">
      <q-list bordered>
        <q-expansion-item
          group="color_groups"
          v-for="(g, i) in $.colors"
          :label="['White Background', 'Black Backgound', 'Colored Background'][i]"
          :default-opened="i === 0"
          header-class="text-primary"
        >
          <q-item v-for="(c, j) in g" clickable @click="() => onDialogOK(c)">
            <svg :ref="el => computeSvg(c, el)" />
          </q-item>
        </q-expansion-item>

        <q-separator />
      </q-list>
    </q-card>
  </q-dialog>
</template>

<style></style>
