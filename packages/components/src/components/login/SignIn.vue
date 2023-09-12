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
import { RouteLocationPathRaw, useRouter } from 'vue-router';

import { useLogin } from '../../composables/use-login';
import Button from '../../elements/button/Button.vue';

export default defineComponent({
  components: { Button },
  props: {
    redirect: { type: Object as () => RouteLocationPathRaw },
  },
  setup(props) {
    const { getToken, route } = useLogin();
    const { currentRoute, resolve } = useRouter();

    return {
      signIn: () => {
        route.value = props.redirect
          ? { ...props.redirect }
          : {
              hash: currentRoute.value.hash,
              path: currentRoute.value.path,
              query: currentRoute.value.query,
            };
        getToken(['User.Read'], resolve({ name: 'OAuthCallback' }).href);
      },
    };
  },
});
</script>
