<template>
  <main class="px-4">
    <Message
      v-if="error"
      color="red"
      variant="light"
      class="justify-center"
      summary="Encountered error while logging in!"
    >
      <div class="flex">
        <span>{{ JSON.stringify(error, null, 2) }}</span>
      </div>
    </Message>
    <Message v-if="loading" color="blue" variant="light" class="justify-center">
      <div class="flex">
        <div class="flex items-center justify-center pr-3">
          <Spinner class="w-6 h-6" />
        </div>
        <span>Logging in...</span>
      </div>
    </Message>
  </main>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, Ref } from 'vue';
import { useRouter } from 'vue-router';

import { useLogin } from '../composables/use-login';
import Message from '../components/message/Message.vue';
import Spinner from '../elements/icon/Spinner.vue';

export default defineComponent({
  name: 'OAuth',
  components: { Message, Spinner },
  setup() {
    const loading = ref(true),
      error: Ref<unknown | undefined> = ref(undefined);

    const { accessToken, msal, route } = useLogin();
    const router = useRouter();

    onMounted(async () => {
      try {
        const res = await msal.handleRedirectPromise();

        if (res) {
          accessToken.value = res.accessToken;
          msal.setActiveAccount(res.account);
        }
      } catch (err) {
        error.value = err;
      } finally {
        loading.value = false;

        if (route.value) {
          router.push(route.value);
        } else {
          router.push({ path: '/' });
        }
      }
    });

    return { error, loading };
  },
});
</script>
