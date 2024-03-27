<template>
  <Button
    label="Sign in"
    size="small"
    color="gray"
    variant="light"
    class="inline-flex justify-center"
    @click="signIn"
    v-slot="{ label }"
  >
    <Spinner v-if="clicked" class="w-6 h-6" />
    <span v-else>{{ label }}</span>
  </Button>
</template>

<script lang="ts">
import { useAuth } from '@pbotapps/authorization';
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';

import Button from '../../elements/button/Button.vue';
import Spinner from '../../elements/icon/Spinner.vue';

export default defineComponent({
  components: { Button, Spinner },
  props: {
    scopes: {
      type: Array as () => Array<string>,
      default: () => [`${import.meta.env.VITE_AZURE_CLIENT_ID}/.default`],
    },
    redirect: { type: Object as () => { path?: string } },
  },
  setup(props) {
    const { route, getToken } = useAuth({
      clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
      tenantId: import.meta.env.VITE_AZURE_TENANT_ID,
    });

    const { currentRoute, resolve } = useRouter();

    const clicked = ref(false);

    return {
      clicked,
      signIn: () => {
        clicked.value = true;
        route.value = props.redirect
          ? props.redirect
          : {
              hash: currentRoute.value.hash,
              path: currentRoute.value.path,
              query: currentRoute.value.query,
            };
        getToken(
          props.scopes,
          'select_account',
          `${window.location.origin}${resolve({ name: 'OAuthCallback' }).href}`
        );
      },
    };
  },
});
</script>
