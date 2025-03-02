<script setup lang="ts">
import { Button, Entry, Input } from '@pbotapps/components';
import { computed, ref, toRef } from 'vue';

import { User } from '../../models/user';
import { useUserStore } from '../../store/user';

const emit = defineEmits(['select', 'remove']);
const props = defineProps({
  users: {
    type: Array as () => Array<User>,
  },
});

const userStore = useUserStore();

const showForm = ref(false);
const query = ref('');

const users = toRef(() => props.users);

const candidates = computed(() => {
  let results = userStore.users.filter(
    u => !users.value?.some(v => v.id == u.id)
  );

  if (query.value.length) {
    const re = new RegExp(query.value, 'i');

    results = results.filter(
      u =>
        re.test(u.email || '') ||
        re.test(u.firstName || '') ||
        re.test(u.lastName || '')
    );
  }

  return results.slice(0, 5);
});

const handleAdd = (candidate: User) => {
  emit('select', candidate);
};

const handleRemove = (user: User) => {
  emit('remove', user);
};
</script>

<template>
  <section>
    <header class="flex items-start justify-between">
      <h2 class="text-3xl mb-3 font-semibold">Users</h2>
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
      <form class="flex flex-col gap-4" @submit.prevent="">
        <Entry id="user" name="user" label="User">
          <Input
            id="userQuery"
            type="search"
            placeholder="Search by email..."
            :disabled="candidates.length == 0"
            @changed="query = $event"
          />
        </Entry>
        <ul v-if="candidates.length > 0" class="mt-4">
          <li
            v-for="candidate in candidates"
            :key="candidate.id"
            class="p-4 flex justify-between items-start odd:bg-gray-100"
          >
            <div class="flex flex-col">
              <span class="text-lg"
                >{{ candidate.firstName }} {{ candidate.lastName }}</span
              >
              <span class="text-sm">{{ candidate.email }}</span>
            </div>
            <Button label="Add user" @click="handleAdd(candidate)" />
          </li>
        </ul>
        <span v-else>There are no candidates available to add</span>
      </form>
    </aside>
    <main>
      <ul class="mt-4">
        <li
          v-for="user in users"
          :key="user.id"
          class="py-4 flex justify-between items-start even:bg-gray-100"
        >
          <div class="flex flex-col">
            <span class="text-lg">
              {{ user.firstName }} {{ user.lastName }}
            </span>
            <span class="text-sm">{{ user.email }}</span>
          </div>
          <Button
            label="Remove user"
            size="small"
            @click="handleRemove(user)"
          />
        </li>
      </ul>
    </main>
  </section>
</template>
