<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue';
import { Footer, Header, Logo, Message } from '@pbotapps/components';
import { errorProperties, getLogger } from './logging';

import { useMessageStore } from './store/message';

const menuOpen = ref(false);

const messages = useMessageStore();

onErrorCaptured((error, _instance, info) => {
  getLogger(['interactive-tsp']).error('Vue component error', {
    info,
    ...errorProperties(error),
  });
});
</script>

<template>
  <div id="app" class="relative min-h-screen flex flex-col font-sans">
    <Header color="cyan" :open="menuOpen" @toggle="menuOpen = !menuOpen">
      <template #branding>
        <router-link to="/" class="flex items-center">
          <Logo
            class="w-16 md:w-24 mr-2"
            title="Portland Bureau of Transportation logo"
          />
          <span class="font-semibold tracking-tight text-lg md:text-xl"
            >Transportation System Plan</span
          >
        </router-link>
      </template>
      <template #menu>
        <router-link
          v-for="item in [
            { to: '/streets', label: 'Streets' },
            { to: '/projects', label: 'Projects' },
            { to: '/master-street-plans', label: 'Master Street Plans' },
            { to: '/area-plans', label: 'Area Plans' },
            { to: '/text', label: 'Text' },
          ]"
          :key="item.to"
          :to="item.to"
          class="mx-1 p-2 rounded-md break-none hover:bg-cyan-400 focus:outline-none focus:bg-cyan-400"
          active-class="bg-cyan-400"
        >
          <span>{{ item.label }}</span>
        </router-link>
      </template>
    </Header>
    <section role="alert">
      <ul class="list-none">
        <li v-for="alert in messages.alerts" :key="alert.id">
          <Message
            :color="
              alert.type === 'error'
                ? 'red'
                : alert.type === 'warning'
                ? 'orange'
                : 'blue'
            "
          >
            {{ alert.text }}
          </Message>
        </li>
      </ul>
    </section>
    <ul
      role="notifications"
      class="list-none space-y-2 z-10 max-w-6xl mx-auto px-2 pb-4 fixed inset-x-0 bottom-0"
    >
      <li v-for="item in messages.messages" :key="item.id">
        <Message
          :color="
            item.type === 'error'
              ? 'red'
              : item.type === 'warning'
              ? 'orange'
              : 'blue'
          "
          variant="light"
          :dismissible="item.dismissible"
          @close="messages.removeMessage(item.id)"
        >
          {{ item.text }}
        </Message>
      </li>
    </ul>
    <main class="flex-grow">
      <router-view />
    </main>
    <Footer color="gray" variant="light">
      <template #middle>
        <nav>
          <ul class="list-none flex flex-col lg:flex-row items-center">
            <li class="m-2">
              <a
                href="https://portland.gov/transportation/planning"
                class="border-b-2 border-current"
                rel="noopener noreferrer"
                >Transportation planning</a
              >
            </li>
            <li class="m-2">
              <a
                href="mailto:pbotppppirc@portlandoregon.gov?subject=Interactive TSP Help Request"
                class="border-b-2 border-current"
                target="_blank"
                rel="noopener noreferrer"
                >Request help</a
              >
            </li>
          </ul>
        </nav>
      </template>
    </Footer>
  </div>
</template>
<style>
@import url('https://fonts.googleapis.com/css?family=Open+Sans:300,300i,400,400i,600,700,800&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

#app {
  @apply font-sans text-base text-black;
}

.fade-enter {
  opacity: 0;
}

.fade-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.pop-enter-active {
  animation: pop-in 0.33s ease;
}
.pop-leave-active {
  animation: pop-in 0.33s ease reverse;
}
@keyframes pop-in {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}
</style>
