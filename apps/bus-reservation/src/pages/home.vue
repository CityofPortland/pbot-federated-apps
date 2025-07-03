<script setup lang="ts">
import { Anchor, Box, Message } from '@pbotapps/components';
</script>

<template>
  <article class="grid grid-cols-1 gap-4">
    <Box
      as="header"
      class="p-12 grid grid-cols-1 items-center justify-items-center gap-12"
    >
      <Message
        color="blue"
        variant="light"
        icon="information"
        summary="Bus Parking Reservations Transitioned to TSUP"
        border
        rounded
        class="p-6"
      >
        <p>
          As of July 1st, 2025, all bus parking reservations will be managed by
          the Temporary Street Use Permitting (TSUP) group. For more information
          on requesting a permit, please visit the link below.
        </p>
        <div>
          <Anchor
            href="https://www.portland.gov/transportation/permitting/temporary-street-use-permitting-tsup#toc-on-street-bus-or-motorcoach-parking"
          >
            Click here to continue
          </Anchor>
        </div>
      </Message>
    </Box>
  </article>
</template>
