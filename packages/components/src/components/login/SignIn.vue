<template>
  <PBOTButton
    label="Sign in"
    :size="size"
    color="gray"
    variant="light"
    class="inline-flex justify-center min-w-16"
    @click="signIn"
    v-slot="{ label }"
  >
    <Spinner v-if="clicked" :class="{ 'w-8 h-8': size == 'large', 'w-6 h-6': size == 'medium', 'w-5 h-5': size == 'small' }" />
    <span v-else>{{ label }}</span>
  </PBOTButton>
</template>

<script lang="ts">
import { useAuth } from '@pbotapps/authorization';
import { defineComponent, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import PBOTButton from '../../elements/button/Button.vue';
import Spinner from '../../elements/icon/Spinner.vue';
import type { ButtonSize } from '../../elements/button/Button.types';

export default defineComponent({
  components: { PBOTButton, Spinner },
  props: {
    redirect: { type: String},
    scopes: {
      type: Array as () => Array<string>,
      default: () => [`${import.meta.env.VITE_AZURE_CLIENT_ID}/.default`],
    },
    size: {
      type: String as () => ButtonSize,
      default: () => 'small'
    }
  },
  setup(props) {
    const { route, getToken } = useAuth({
      clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
      tenantId: import.meta.env.VITE_AZURE_TENANT_ID,
    });

    const currentRoute = useRoute();
    const router = useRouter();

    const clicked = ref(false);

    return {
      clicked,
      signIn: () => {
        clicked.value = true;
        route.value = props.redirect
          ? { path: props.redirect }
          : {
              path: currentRoute.fullPath
            };
        getToken(
          props.scopes,
          'select_account',
          `${window.location.origin}${router.resolve({ name: 'OAuthCallback' }).href}`
        );
      },
    };
  },
});
</script>
