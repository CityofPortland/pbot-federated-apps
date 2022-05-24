<template>
  <Box
    as="li"
    role="option"
    tabindex="0"
    class="w-full p-2 border border-current rounded-lg cursor-pointer hover:bg-blue-100"
  >
    <slot>
      <span
        v-if="candidate.type"
        class="px-2 rounded-full bg-blue-500 text-white text-xs font-bold uppercase"
        >{{ candidate.type }}</span
      >
      <div class="text-sm">{{ candidate.name }}</div>
      <div
        v-if="candidate.city || candidate.state"
        class="flex items-center space-x-1 text-xs font-bold uppercase"
      >
        <span v-if="candidate.city">{{ candidate.city }},</span>
        <span v-if="candidate.state">{{ candidate.state }}</span>
      </div>
    </slot>
  </Box>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Box from '@/elements/box/Box';

import { Candidate } from './candidate';

export default defineComponent({
  name: 'CandidateItem',
  components: { Box },
  props: {
    candidate: {
      type: Object as () => Candidate,
      required: true,
    },
  },
});
</script>
