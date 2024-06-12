<script setup lang="ts">
import { Box, Panel } from '@pbotapps/components';
import { computed, ref } from 'vue';

import location1 from './location_1.jpg';
import location2 from './location_2.jpg';
import location3 from './location_3.jpg';

const props = defineProps({
  orientation: {
    default: 'vertical',
    type: String as () => 'horizontal' | 'vertical',
  },
});
const showImages = ref(false);

const innerClasses = computed(() => {
  const classMap = new Map([
    [
      'horizontal',
      [
        'grid',
        'grid-cols-1',
        'md:grid-cols-3',
        'divide-y',
        'md:divide-y-0',
        'md:divide-x',
        'divide-current',
        'rounded-b-md',
      ],
    ],
    [
      'vertical',
      ['grid', 'grid-cols-1', 'divide-y', 'divide-current', 'rounded-b-md'],
    ],
  ]);

  return classMap.get(props.orientation);
});
</script>

<template>
  <Panel
    class="flex-1 w-full"
    :open="showImages"
    @toggle="showImages = !showImages"
  >
    <template v-slot:header>
      <div class="flex flex-col gap-1 items-start text-left">
        <span>Bus spot images</span>
        <small>
          Expand to view images and descriptions of the bus spot locations
        </small>
      </div>
    </template>
    <Box :class="innerClasses">
      <figure class="p-2">
        <a :href="location2">
          <img
            class="border border-current"
            :src="location2"
            alt="Three red rectangles with numbers within them labelling them 1, 2, and 3. The rectangles encompass a space on the southern blockface of Southwest Harvey Milk Street between Southwest 6th Avenue and Southwest Broadway Street"
          />
        </a>
        <figcaption class="text-sm italic">
          Spots 1, 2, and 3 on Southwest Harvey Milk Street are located on the
          southern side of the street between Southwest 6th Avenue and Southwest
          Broadway Street
        </figcaption>
      </figure>
      <figure class="p-2">
        <a :href="location1">
          <img
            class="border border-current"
            :src="location1"
            alt="One red rectangle with the number 4 within it. The rectangle encompasses a space on the southern blockface of Southwest Harvey Milk Street Southwest Broadway Street and Southwest Park Avenue"
          />
        </a>
        <figcaption class="text-sm italic">
          Spot 4 on Southwest Harvey Milk Street is located on the southern side
          of the street between Southwest Broadway Street and Southwest Park
          Avenue
        </figcaption>
      </figure>
      <figure class="p-2">
        <a :href="location3">
          <img
            class="border border-current"
            :src="location3"
            alt="One red rectangle with the number 1 within it. The rectangle encompasses a space on the norther blockface of Southeast Ankeny Street between Southeast 8th Avenue and Southeast 9th Avenue"
          />
        </a>
        <figcaption class="text-sm italic">
          Spot 1 on Southeast Ankeny is located on the northern side of the
          street Street between Southeast 8th Avenue and Southeast 9th Avenue
        </figcaption>
      </figure>
    </Box>
  </Panel>
</template>
