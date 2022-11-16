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
        v-for="(crumb, index) in ourBread"
        :key="crumb"
      >
        <router-link
          v-if="index < ourBread.length - 1"
          :to="'/' + crumb"
          custom
          v-slot="{ href, navigate }"
        >
          <Anchor :url="href" @click="navigate">
            {{ crumb.split('/').pop() }}
          </Anchor>
        </router-link>
        <span v-if="index < ourBread.length - 1">/</span>
        <span v-else>{{ crumb.split('/').pop() }}</span>
      </li>
    </ol>
  </nav>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue';
import Anchor from '@/elements/anchor/Anchor.vue';
export default defineComponent({
  name: 'Breadcrumbs',
  setup(props) {
    const crumbTrail = props.path.split('/').filter(e => e != '');

    let ourBread: string[] = [];
    let buildMe = '';
    for (let i = 0; i < crumbTrail.length; i++) {
      buildMe += crumbTrail[i];
      ourBread.push(buildMe);
      buildMe += '/';
    }

    return {
      ourBread,
    };
  },
  components: { Anchor },
  props: {
    crumbs: {
      type: Array as PropType<string[]>,
      required: false,
    },
    path: {
      type: String,
      required: true,
    },
  },
});
</script>
