<template>
  <nav class="flex" aria-label="Breadcrumb">
    <ol class="inline-flex items-center space-x-1 md:space-x-3">
      <li class="inline-flex items-center capitalize gap-2">
        <router-link to="/" custom v-slot="{ href, navigate }">
          <Anchor :url="href" @click="navigate">Home</Anchor>
        </router-link>
        <span>/</span>
      </li>
      <li
        class="inline-flex items-center capitalize gap-2"
        v-for="(crumb, index) in crumbs"
        :key="crumb"
      >
        <router-link
          v-if="index < crumbs.length - 1"
          :to="crumb"
          custom
          v-slot="{ href, navigate }"
        >
          <Anchor :url="href" @click="navigate">
            {{ crumb.split('/').pop() }}
          </Anchor>
        </router-link>
        <span v-if="index < crumbs.length - 1">/</span>
        <span v-else>{{ crumb.split('/').pop() }}</span>
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
