<script setup lang="ts">
import { query, useLogin } from '@pbotapps/components';
import showdown from 'showdown';
import { onMounted, ref } from 'vue';
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router';

const { getToken } = useLogin();
const route = useRoute();
const router = useRouter();

const content = ref('');
const pageElement = ref<HTMLElement>();
const scripts = ref(new Array<{ body?: string; src?: string }>());

async function getPage(tree: string | Array<string>) {
  content.value = '';

  const token = await getToken();

  tree = Array.isArray(route.params.tree)
    ? route.params.tree
    : [route.params.tree];

  try {
    const res = await query<{
      page: {
        content: string;
        scripts?: Array<{ body?: string; src?: string }>;
      };
    }>({
      operation: `
          query getPage {
            page(tree: ["${tree.join('","')}"]) {
                title
                scripts {
                  src
                  body
                }
                content
            }
          }`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.errors) {
      // display them somehow
    }

    if (!res.data) {
      return;
    }

    if (res.data.page.scripts) {
      scripts.value = res.data.page.scripts;
    }

    const converter = new showdown.Converter({
      noHeaderId: true,
    });

    content.value = converter.makeHtml(res.data.page.content);
  } catch (err) {
    console.error(err);
  }
}

onMounted(() => {
  getPage(route.params.tree);

  if (pageElement.value) {
    pageElement.value.onclick = event => {
      const target = event.target as HTMLElement | null;

      if (target) {
        if (['a'].includes(target.tagName.toLowerCase())) {
          const href = target.attributes.getNamedItem('href');

          if (href) {
            const re = new RegExp('^(?:[a-z+]+:)?//', 'i');

            if (!re.test(href.value)) {
              event.preventDefault();
              router.push({
                path: href.value,
              });
            }
          }
        }
      }
    };
  }
});
onBeforeRouteUpdate(to => {
  getPage(to.params.tree);
  return true;
});
</script>

<template>
  <article class="mb-12" ref="pageElement">
    <main v-if="content" v-html="content" class="prose"></main>
    <main v-else>Loading...</main>
  </article>
  <Teleport to="head" v-for="(script, idx) in scripts" :key="idx">
    <component :is="'script'" type="text/javascript" :src="script.src">{{
      script.body
    }}</component>
  </Teleport>
</template>

<style>
main.prose a {
  @apply no-underline border-b-2 border-current font-bold;
}
</style>
