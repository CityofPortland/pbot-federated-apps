<template>
  <main class="px-4">
    <Message
      v-if="error"
      color="red"
      variant="light"
      class="justify-center"
      summary="Encountered error while logging in!"
    >
      <div class="flex">
        <span>{{ JSON.stringify(error, null, 2) }}</span>
      </div>
    </Message>
    <Message v-if="loading" color="blue" variant="light" class="justify-center">
      <div class="flex">
        <div class="flex items-center justify-center pr-3">
          <Spinner class="w-6 h-6" />
        </div>
        <span>Logging in...</span>
      </div>
    </Message>
  </main>
</template>

<script lang="ts">
import { useAuth } from '@pbotapps/authorization';
import axios from 'axios';
import { defineComponent, onMounted, ref, type Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import Message from '../components/message/Message.vue';
import Spinner from '../elements/icon/Spinner.vue';

export default defineComponent({
  name: 'OAuth',
  components: { Message, Spinner },
  setup() {
    const loading = ref(true),
      error: Ref<unknown | undefined> = ref(undefined);

    const { authority, clientId, requests, route, findRequest, setToken } =
      useAuth({
        clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
        tenantId: import.meta.env.VITE_AZURE_TENANT_ID,
      });
    const { query } = useRoute();
    const router = useRouter();

    onMounted(async () => {
      const { code, state } = query;
      const params = new URLSearchParams();

      const request = findRequest(state as string);

      if (!request) {
        error.value =
          'Could not find a corresponding request for this callback';
        return;
      }

      params.append('client_id', clientId);
      params.append('code', code as string);
      params.append('code_verifier', request.codes.verifier);
      params.append('grant_type', 'authorization_code');
      params.append('redirect_uri', request.redirect);
      params.append('scope', request.scopes.join(' '));

      const res = await axios.post(`${authority}/oauth2/v2.0/token`, params);

      const { access_token, scope, refresh_token } = res.data;

      setToken(scope.split(' '), access_token, refresh_token);

      router.replace(route.value && route.value.path ? route.value : { path: '/' })
    });

    return { error, loading };
  },
});
</script>
