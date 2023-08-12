<script setup lang="ts">
import { query, useLogin } from '@pbotapps/components';
import showdown from 'showdown';
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const { getToken } = useLogin();

const content = ref('');

async function getPage(tree: string | Array<string>) {
  const token = await getToken();

  tree = Array.isArray(route.params.tree)
    ? route.params.tree
    : [route.params.tree];

  try {
    const res = await query({
      operation: `
          query getPage($tree: [String!]!) {
            page(tree: $tree) {
                id
                slug
                index
                depth
                title
                scripts
                content
            }
          }`,
      variables: {
        tree,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.errors) {
      // display them somehow
    }

    const converter = new showdown.Converter({});

    content.value = converter.makeHtml(res.data.page.content);
  } catch {
    return;
  }
}

watch(route, async route => getPage(route.params.tree));

onMounted(() => getPage(route.params.tree));
</script>

<template>
  <article class="mb-12">
    <main v-html="content" class="prose"></main>
  </article>
</template>
