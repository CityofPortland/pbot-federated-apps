<template>
  <Button
    label="Sign in"
    size="small"
    color="gray"
    variant="light"
    @click="signIn"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';

import { useLogin } from '../../composables/use-login';
import Button from '../../elements/button/Button.vue';

export default defineComponent({
  components: { Button },
  setup() {
    const { getToken, route } = useLogin();
    const { currentRoute, resolve } = useRouter();

    return {
      signIn: () => {
        route.value = currentRoute.value;
        getToken(['User.Read'], resolve({ name: 'OAuthCallback' }).href);
      },
    };
  },
});
</script>
