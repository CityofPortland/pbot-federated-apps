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
    const { redirectTo, signIn } = useLogin();
    const { currentRoute } = useRouter();

    return {
      signIn: () => {
        redirectTo.value = currentRoute.value;
        signIn(true);
      },
    };
  },
});
</script>
