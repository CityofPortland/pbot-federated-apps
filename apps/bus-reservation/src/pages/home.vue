<script setup lang="ts">
import { computed, ref } from 'vue';
import { Anchor, Box, Button } from '@pbotapps/components';

const now = new Date();

function generateRandomDate(from: Date, to: Date) {
  return new Date(
    from.getTime() + Math.random() * (to.getTime() - from.getTime())
  );
}

const data = ref(
  [...Array(5).keys()].map(() => {
    return {
      timestamp: generateRandomDate(new Date(2020, 1, 1), now).toISOString(),
      data: Math.random() * 2 ** 20,
    };
  })
);

const enriched = computed(() => {
  return data.value
    .map(d => {
      return {
        timestamp: new Date(d.timestamp),
        data: d.data,
      };
    })
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    .map(d => {
      return {
        year: d.timestamp.getFullYear(),
        month: d.timestamp.getMonth() + 1,
        timestamp: d.timestamp,
        data: d.data,
      };
    });
});
</script>

<template>
  <article class="grid grid-cols-1 gap-4">
    <Box
      as="header"
      class="p-12 grid grid-cols-1 md:grid-cols-2 items-center justify-items-center gap-12"
    >
      <div class="mx-auto flex flex-col gap-4 prose-lg">
        <h1>Welcome to the Bus Reservation application!</h1>
        <p>
          This application is intended for use by permitted users to validate
          that requests for exclusive use of bus parking zones have been
          accepted by PBOT. This application will also allow permitted users to
          privately negotiate transfers of those exclusive reservations.
        </p>
      </div>
      <div class="mx-auto grid grid-cols-3 gap-12"></div>
    </Box>
  </article>
</template>
