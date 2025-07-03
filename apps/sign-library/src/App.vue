<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import {
  Box,
  Footer,
  Header,
  LoggedIn,
  Logo,
  Message,
  SignIn,
} from '@pbotapps/components';

import {
  useAuthStore,
  useMessageStore,
  useRuleStore,
  useSignStore,
} from './store';

const menuOpen = ref(false);

const { getToken } = useAuthStore();
const messages = useMessageStore();
const rulesStore = useRuleStore();
const signStore = useSignStore();
const { currentRoute } = useRouter();

const accessToken = ref<string>();

signStore.init();
rulesStore.get();

onMounted(async () => {
  accessToken.value = await getToken();
  signStore.refresh();
});

watch(accessToken, () => rulesStore.get());

const dev = computed(() => import.meta.env.MODE != 'production');
</script>

<template>
  <div class="min-h-screen flex flex-col font-sans">
    <Header color="white" :open="menuOpen" @toggle="menuOpen = !menuOpen">
      <template #branding>
        <router-link to="/" class="w-full flex items-center">
          <Logo class="w-16 md:w-20 mr-3 flex-shrink-0" />
          <span class="truncate text-xl">Sign Library</span>
        </router-link>
      </template>
      <template #menu>
        <span class="mt-3 md:mt-0 md:ml-auto">
          <SignIn v-if="!accessToken" :redirect="currentRoute.fullPath" />
          <LoggedIn v-else />
        </span>
      </template>
    </Header>
    <section v-if="dev" role="banner">
      <Box
        color="orange"
        class="p-4 text-center text-xl font-semibold uppercase"
        >Development version</Box
      >
    </section>
    <section
      role="notification"
      v-if="messages.messages.size > 0"
      class="flex-grow max-w-7xl w-full mx-auto px-4 my-4"
    >
      <ul class="grid grid-cols-1 gap-2">
        <Message
          v-for="message in messages.messages"
          :key="message[0]"
          as="li"
          :color="
            {
              error: 'red',
              info: 'blue',
              warning: 'tangerine',
            }[message[1][0]]
          "
          variant="light"
          :summary="message[1][1].message"
          dismissible
          @close="messages.remove(message[0])"
        >
          {{ message[1][1].cause }}
        </Message>
      </ul>
    </section>
    <main class="flex-grow max-w-7xl w-full mx-auto px-4 my-4">
      <router-view />
    </main>
    <Footer color="gray" variant="light" />
  </div>
</template>

<style>
.prose {
  max-width: 72ex;
}
</style>
