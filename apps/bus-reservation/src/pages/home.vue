<script setup lang="ts">
import { Box } from '@pbotapps/components';
</script>

<template>
  <article class="grid grid-cols-1 gap-4">
    <Box
      as="header"
      class="p-12 grid grid-cols-1 items-center justify-items-center gap-12"
    >
      <div class="mx-auto flex flex-col gap-4 prose-lg">
        <h1>Welcome to the Bus Reservation application!</h1>
        <p>
          This application is intended for use by permitted users to validate
          that requests for exclusive use of bus parking zones have been
          accepted by PBOT.
        </p>
      </div>
      <div class="mx-auto grid grid-cols-3 gap-12"></div>
    </Box>
  </article>
</template>
