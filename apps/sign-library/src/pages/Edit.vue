<script setup lang="ts">
import { Message } from '@pbotapps/components';
import { onMounted, ref, toRef } from 'vue';
import { useRouter } from 'vue-router';

import Form from '../components/sign/Form.vue';
import { useMessageStore, useSignStore } from '../store';
import { Sign, SignInput } from '../types';

const messages = useMessageStore();
const router = useRouter();
const store = useSignStore();

const props = defineProps({
  code: { type: String, required: true },
});

const code = toRef(props.code);
const sign = ref<Sign>();

onMounted(async () => {
  sign.value = await store.get(code.value);
});

const save = async (sign: SignInput) => {
  try {
    const { code, ...payload } = sign;

    // is there anything to send?
    if (Object.keys(payload).length > 0) {
      const res = await store.edit(code, payload);

      if (res != null) {
        router.push(`/${code}`);
      }
    }
  } catch (err) {
    messages.add(
      'signs:edit',
      'error',
      new Error('Error editing sign!', { cause: err })
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
  <Message
    v-else
    summary="Error retrieving sign for editing"
    color="red"
    variant="light"
  />
</template>
