<script setup>
import App from '../App.js';
import t from '../Translator.js';
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
  name: '',
  password: '',
});

const login = () => {
  let user = _.users.find(i => i.name === _.name);
  if (!user) user = _.users[0];

  App._.user = user;
};
</script>

<template>
  <div>
    <q-card flat style="margin: 3em auto 0 auto; max-width: 30em; padding: 1em">
      <q-card-section>
        <q-input v-model="_.name" :label="t(`Username`,`Benutzername`)" filled outlined />
        <br />
        <q-input v-model="_.password" type="password" :label="t(`Password`,`Passwort`)" filled outlined />
        <br />

        <q-card-actions align="center">
          <q-btn class="bg-primary text-white" @click="login">Login</q-btn>
        </q-card-actions>
      </q-card-section>
    </q-card>

    <div style="text-align: center; padding: 1.5em">Example Users (no password): Admin, Bob, Alice</div>
  </div>
</template>

<style scoped></style>
