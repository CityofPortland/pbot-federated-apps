<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import Form from '../components/sign/Form.vue';
import { useMessageStore, useSignStore } from '../store';
import { Sign, SignInput } from '../types';

const messages = useMessageStore();
const router = useRouter();
const store = useSignStore();

const sign = ref<Partial<Sign>>({
  created: new Date(),
  updated: new Date(),
});

const save = async (sign: SignInput) => {
  try {
    const res = await store.add(sign);

    if (res != null) {
      router.push(`/${sign.code}`);
    }
  } catch (err) {
    messages.add(
      'signs:add',
      'error',
      new Error('Error adding sign!', { cause: err })
    );
  }

  window.scroll({ top: 0, left: 0, behavior: 'smooth' });
};
</script>

<template>
  <Form
    v-if="sign"
    class="flex flex-col gap-4 max-w-prose"
    :sign="sign"
    @save="save($event)"
  />
</template>
