<template>
  <Button
    as="button"
    size="small"
    color="gray"
    variant="light"
    @click="handleSignIn"
    >Sign in</Button
  >
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Button from '@/elements/button/Button.vue';
import { useLogin } from '@/composables/use-login';

export default defineComponent({
  components: { Button },
  setup() {
    const { clientId, authority, challenge, redirectURI } = useLogin();

    return {
      handleSignIn() {
        window.localStorage.setItem('pbotapps.auth.initiated', 'true');

        const url = new URL(`${authority}/oauth2/v2.0/authorize`);
        let { searchParams } = url;
        searchParams.append('client_id', clientId || '');
        searchParams.append('redirect_uri', redirectURI);
        searchParams.append('response_type', 'code');
        searchParams.append('scope', `User.Read`);
        searchParams.append('code_challenge_method', 'S256');
        searchParams.append('code_challenge', challenge.value || '');

        window.location.assign(url.toString());
      },
    };
  },
});
</script>
