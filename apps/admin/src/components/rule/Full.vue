<script setup lang="ts">
import {
  Anchor,
  Button,
  Entry,
  Field,
  FieldList,
  Input,
} from '@pbotapps/components';
import { computed, ref, toRefs } from 'vue';
import { Rule } from '../../models/rule';
import { User } from '../../models/user';
import { useUserStore } from '../../store/user';

const props = defineProps({
  rule: {
    type: Object as () => Rule,
    required: true,
  },
});

const { rule } = toRefs(props);

const store = useUserStore();

store.getUsers();

const showForm = ref(false);

const userQuery = ref('');
const userCanddiates = computed(() => {
  let results = store.users
    .filter(u => u)
    .filter(u => (rule.value.users?.some(r => r._id == u._id) ? false : true));

  if (userQuery.value.length) {
    const r = new RegExp(userQuery.value, 'i');
    results = results.filter(u => r.test(u._id || '') || r.test(u.email || ''));
  }

  return results.slice(0, 5);
});

const addUser = (user: User) => {
  rule.value.users = rule.value.users || [];
  rule.value.users.push(user);

  store.addRule(user, rule.value);
};

const removeUser = (user: User) => {
  store.removeRule(user, rule.value);

  rule.value.users?.splice(
    rule.value.users?.findIndex(u => u._id == user._id),
    1
  );
};
</script>
<template>
  <article class="grid grid-cols-1 gap-4">
    <FieldList class="flex flex-col gap-4">
      <Field name="Application" display="inline">
        <router-link
          :to="`/application/${rule.application?._id}`"
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
    <section>
      <header class="prose prose-lg flex items-start justify-between">
        <h2>Users</h2>
        <Button
          label="Add user"
          size="small"
          class="inline-flex"
          @click="showForm = !showForm"
        >
          {{ showForm ? 'Close' : 'Add user' }}
        </Button>
      </header>
      <aside v-if="showForm">
        <form @submit.prevent="">
          <Entry id="user" name="user" label="User">
            <Input
              id="userQuery"
              type="search"
              placeholder="Search by email..."
              @changed="userQuery = $event"
            />
            <ul class="mt-4">
              <li
                v-for="candidate in userCanddiates"
                :key="candidate._id"
                class="p-4 flex justify-between items-start odd:bg-gray-100"
              >
                <div class="flex flex-col">
                  <span class="text-lg"
                    >{{ candidate.firstName }} {{ candidate.lastName }}</span
                  >
                  <span class="text-sm">{{ candidate.email }}</span>
                </div>
                <Anchor url="#" @click="addUser(candidate)">Add user</Anchor>
              </li>
            </ul>
          </Entry>
        </form>
      </aside>
      <main>
        <ul class="mt-4">
          <li
            v-for="user in rule.users"
            :key="user._id"
            class="py-4 flex justify-between items-start even:bg-gray-100"
          >
            <div class="flex flex-col">
              <span class="text-lg"
                >{{ user.firstName }} {{ user.lastName }}</span
              >
              <span class="text-sm">{{ user.email }}</span>
            </div>
            <Anchor url="#" @click="removeUser(user)">Remove user</Anchor>
          </li>
        </ul>
      </main>
    </section>
  </article>
</template>
