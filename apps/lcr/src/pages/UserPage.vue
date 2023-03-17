<script setup lang="ts">
defineProps({ userid: { type: String, required: true } });
</script>

<template>
  <div>Maximo User Page {{ userid }}</div>
</template>
