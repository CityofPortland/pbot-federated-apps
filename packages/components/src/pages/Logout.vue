<template>
  <main class="max-w-7xl mt-8 px-4 mx-auto">
    <section class="grid grid-cols-1 gap-4">
      <p>You have been logged out.</p>
      <SignIn
        size="large"
        color="blue"
        variant="neutral"
        class="flex-initial w-64"
        :redirect="{ path: '/' }"
      />
    </section>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';

import { SignIn } from '../components';
import { useLogin } from '../composables';

export default defineComponent({
  name: 'Logout',
  setup() {
    const { accessToken, msal, route } = useLogin();
    const router = useRouter();

    route.value = { path: '/' };

    if (accessToken.value && accessToken.value !== '') {
      accessToken.value = '';
      msal.logoutRedirect({
        postLogoutRedirectUri: router.resolve({ name: 'OAuthCallback' }).href,
      });
    }
  },
  components: { SignIn },
});
</script>
