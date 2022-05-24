<template>
  <Box as="footer" :color="color" :variant="variant">
    <div class="max-w-7xl mx-auto p-4">
      <div class="grid grid-cols-1 gap-3">
        <section>
          <div class="grid grid-cols-1 gap-3">
            <h2 class="sr-only">ADA accommodations</h2>
            <p>
              The City of Portland ensures meaningful access to city programs,
              services, and activities to comply with Civil Rights Title VI and
              ADA Title II laws and reasonably provides: translation,
              interpretation, modifications, accommodations, alternative
              formats, auxiliary aids and services. To request these services,
              contact
              <Anchor url="tel:503-823-5185">503-823-5185</Anchor>, City TTY
              <Anchor url="tel:503-823-6868">503-823-6868</Anchor>, Relay
              Service <Anchor url="tel:711">711</Anchor>.
            </p>
            <p>
              Traducción e Interpretación | Biên Dịch và Thông Dịch | अनुवादन
              तथा व्याख्या 口笔译服务 | Устный и письменный перевод | Turjumaad
              iyo Fasiraad Письмовий і усний переклад | Traducere și
              interpretariat | Chiaku me Awewen Kapas | Translation and
              Interpretation
              <Anchor url="tel:503-823-5185">503-823-5185</Anchor>
            </p>
          </div>
        </section>
        <section v-if="hasTop">
          <slot name="top"></slot>
        </section>
        <section class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div class="order-last md:order-first">
            <Copyright />
          </div>
          <div class="md:col-span-3">
            <slot name="middle"></slot>
          </div>
        </section>
        <section v-if="hasBottom">
          <slot name="bottom"></slot>
        </section>
      </div>
    </div>
  </Box>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Anchor from '@/elements/anchor/Anchor.vue';
import Box, { BoxColor, BoxColorVariant } from '@/elements/box/Box';
import Copyright from '@/components/copyright/Copyright.vue';

export default defineComponent({
  name: 'Footer',
  components: { Anchor, Box, Copyright },
  props: {
    color: {
      type: String as () => BoxColor,
      default: 'white',
    },
    variant: {
      type: String as () => BoxColorVariant,
      default: 'neutral',
    },
  },
  setup(_, { slots }) {
    return {
      hasTop: slots.top !== undefined,
      hasBottom: slots.bottom !== undefined,
    };
  },
});
</script>
