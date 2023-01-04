<script setup>
import DefaultTheme from 'vitepress/theme';
const { Layout } = DefaultTheme;
</script>

<template>
  <Layout />
</template>

<style>
.theme {
  @apply font-sans;
}
.page {
  @apply prose prose-slate font-sans;
}
</style>