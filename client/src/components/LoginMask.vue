<script setup>
import App from '../App.js';
import { reactive } from 'vue';

const _ = reactive({
  users: [
    {
      name: 'Admin',
      email: 'admin@rptu.de',
    },
    {
      name: 'Bob',
      email: 'bob@rptu.de',
    },
    {
      name: 'Alice',
      email: 'alice@rptu.de',
    },
  ],
});
</script>

<template>
  <h3>LOGIN</h3>

  <q-list dense>
    <q-item v-for="user in _.users" clickable v-ripple @click='()=>App._.user=user'>
      <q-item-section avatar>
        <q-avatar color="primary" text-color="white">
          {{ user.name[0] }}
        </q-avatar>
      </q-item-section>

      <q-item-section>
        <q-item-label>{{ user.name }}</q-item-label>
        <q-item-label caption lines="1">{{
          user.email
        }}</q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<style scoped></style>
