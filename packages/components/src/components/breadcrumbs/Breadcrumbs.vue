<template>
  <nav class="flex" aria-label="Breadcrumb">
    <ol class="inline-flex items-center space-x-1 md:space-x-2">
      <li class="after:content-['/'] after:ml-2">
        <router-link to="/" custom v-slot="{ href, navigate }">
          <Anchor :url="href" @click="navigate">home</Anchor>
        </router-link>
      </li>
      <li
        v-for="crumb in crumbs.slice(undefined, -1)"
        :key="crumb"
        class="after:content-['/'] after:ml-2"
      >
        <router-link :to="crumb" custom v-slot="{ href, navigate }">
          <Anchor :url="href" @click="navigate">
            {{ crumb.split('/').pop() }}
          </Anchor>
        </router-link>
      </li>
      <li>
        <span>{{ crumbs.at(-1).split('/').pop() }}</span>
      </li>
    </ol>
  </nav>
</template>
<script lang="ts">
import { computed, defineComponent } from 'vue';
import Anchor from '@/elements/anchor/Anchor.vue';
export default defineComponent({
  name: 'Breadcrumbs',
  setup(props) {
    const crumbs = computed(() => {
      const crumbs = props.path.split('/').filter(path => path != '');
      const trail = new Array<string>();
      crumbs.forEach(crumb => {
        trail.push(`${trail[trail.length - 1] || ''}/${crumb}`);
      });
      return trail;
    });

    return {
      crumbs,
    };
  },
  components: { Anchor },
  props: {
    path: {
      type: String,
      required: true,
    },
  },
});
</script>
