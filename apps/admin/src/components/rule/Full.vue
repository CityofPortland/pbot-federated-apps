<script setup lang="ts">
import { Anchor, Field, FieldList } from '@pbotapps/components';
import { toRefs } from 'vue';

import { Rule } from '../../models/rule';
import { User } from '../../models/user';
import { useUserStore } from '../../store/user';
import UserManagement from './UserManagement.vue';

const props = defineProps({
  rule: {
    type: Object as () => Rule,
    required: true,
  },
});

const { rule } = toRefs(props);

const userStore = useUserStore();

userStore.getUsers();

const addUser = async (user: User) => {
  const u = await userStore.addRule(user, rule.value);

  if (u) {
    rule.value.users = rule.value.users || [];
    rule.value.users.push(u);
  }
};

const removeUser = (user: User) => {
  userStore.removeRule(user, rule.value);

  rule.value.users?.splice(
    rule.value.users?.findIndex(u => u.id == user.id),
    1
  );
};
</script>
<template>
  <article class="grid grid-cols-1 gap-8">
    <header>
      <h1 class="text-4xl font-bold mb-4">Rule {{ rule.id }}</h1>
    </header>
    <FieldList class="flex flex-col gap-4">
      <Field name="Application" display="inline">
        <router-link
          :to="`/application/${rule.application?.id}`"
          custom
          v-slot="{ href, navigate }"
        >
          <Anchor :url="href" @click="navigate">{{
            rule.application?.name
          }}</Anchor>
        </router-link>
      </Field>
      <Field name="Inverted" display="inline">
        {{ rule.inverted }}
      </Field>
      <Field name="Action" display="inline">
        {{ rule.action }}
      </Field>
      <Field name="Subject" display="inline">
        {{ rule.subject }}
      </Field>
      <Field name="Conditions" display="inline">
        {{ JSON.stringify(rule.conditions) }}
      </Field>
      <Field name="Fields" display="inline">
        {{ JSON.stringify(rule.fields) }}
      </Field>
    </FieldList>
    <UserManagement
      :users="rule.users"
      @select="addUser"
      @remove="removeUser"
    />
  </article>
</template>
