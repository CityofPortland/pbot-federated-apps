<template>
  <main class="max-w-7xl mt-8 px-4 mx-auto">
    <section class="grid grid-cols-1 gap-4">
      <p>You have been logged out.</p>
      <SignIn
        size="large"
        color="blue"
        variant="neutral"
        class="flex-initial w-64"
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
    const { accessToken, msal, redirectTo } = useLogin();
    const { resolve } = useRouter();

    redirectTo.value = resolve({ path: '/' });
    accessToken.value = null;

    msal.logoutRedirect({
      postLogoutRedirectUri: msal.getConfiguration().auth.redirectUri,
    });
  },
  components: { SignIn },
});
</script>
