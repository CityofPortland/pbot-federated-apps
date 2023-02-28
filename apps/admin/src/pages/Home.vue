<script setup lang="ts">
import { Anchor, Field, FieldList } from '@pbotapps/components';
import { computed } from 'vue';

import { Application } from '../models/application';
import { useUserStore } from '../store/user';

const store = useUserStore();

store.getMe();

const me = computed(() => {
  const { rules, ...me } = store.me;

  const applications = rules.reduce((acc, curr) => {
    acc.add(curr.application._id);
    return acc;
  }, new Set<Application>());

  return { ...me, applications };
});

const property = (key: string, object: Record<string, unknown>) => object[key];
</script>

<template>
  <article class="mt-4 mb-8 prose">
    <h1>Welcome to PBOT's federated applications!</h1>
    <p class="lead">
      Here's some basic information on your user account for federated
      applications:
    </p>
    <FieldList>
      <Field
        v-for="key in Object.keys(me)
          .filter(key => ['email', 'firstName', 'lastName'].includes(key))
          .filter(key => property(key, me) != undefined)"
        :key="key"
        :name="key"
        display="inline"
        >{{ property(key, me) }}</Field
      >
    </FieldList>
    <h2>Applications</h2>
    <p class="lead">You have rules assigned for the following applications:</p>
    <ul>
      <li v-for="app in me.applications" :key="app">
        <router-link
          :to="`/application/${app}`"
          custom
          v-slot="{ href, navigate }"
        >
          <Anchor :url="href" @click="navigate" class="no-underline">{{
            app
          }}</Anchor>
        </router-link>
      </li>
    </ul>
  </article>
</template>
