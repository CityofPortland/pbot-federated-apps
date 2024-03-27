<script setup lang="ts">
import { createAuthStore } from '@pbotapps/authorization';
import { query } from '@pbotapps/components';
import showdown from 'showdown';
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../store';

type Heading = {
  id: string;
  text: string;
  ref: HTMLElement;
};

const route = useRoute();
const router = useRouter();

const content = ref('');
const headings = ref<Array<Heading>>([]);
const pageElement = ref<HTMLElement>();
const scripts = ref(new Array<{ body?: string; src?: string }>());

async function getPage(tree: string | Array<string>) {
  content.value = '';

  const { getToken } = useAuthStore();

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

    const converter = new showdown.Converter({});

    content.value = converter.makeHtml(res.data.page.content);
  } catch (err) {
    console.error(err);
  }
}

onMounted(() => {
  const websiteRegex = new RegExp('^(?:[a-z]+:)?//', 'i');
  const emailRegex = new RegExp('^mailto:', 'i');

  if (pageElement.value) {
    pageElement.value.onclick = event => {
      const target = event.target as HTMLElement | null;

      if (target) {
        if (['a'].includes(target.tagName.toLowerCase())) {
          const href = target.attributes.getNamedItem('href');

          if (href) {
            if (
              !websiteRegex.test(href.value) &&
              !emailRegex.test(href.value)
            ) {
              event.preventDefault();
              router.push({
                path: href.value,
              });
            }
          }
        }
      }
    };

    const mo = new MutationObserver(function (mutations) {
      mutations.forEach(function () {
        pageElement.value?.querySelectorAll('img').forEach(el => {
          const src = el.attributes.getNamedItem('src');
          if (src) {
            if (
              !websiteRegex.test(src.value) &&
              !src.value.startsWith(import.meta.env.BASE_URL)
            ) {
              src.value = `${import.meta.env.BASE_URL}${src.value}`.replaceAll(
                '//',
                '/'
              );
            }
          }
        });

        headings.value = [];

        pageElement.value?.querySelectorAll('h2').forEach(h2 => {
          const id = h2.attributes.getNamedItem('id')?.value;

          if (id) {
            headings.value.push({ id, text: h2.innerText, ref: h2 });
          }
        });
      });
    });

    mo.observe(pageElement.value, { childList: true, subtree: true });
  }
});

watch(() => route.params.tree, getPage, { immediate: true });
</script>

<template>
  <article
    class="flex-1 mb-12 flex flex-col xl:flex-row xl:gap-16 relative"
    ref="pageElement"
  >
    <main v-if="content" v-html="content" class="prose"></main>
    <main v-else>Loading...</main>
    <aside
      v-if="content && headings"
      class="flex-1 relative hidden lg:flex flex-col text-base"
    >
      <nav class="lg:sticky top-8 border-l-2 pl-3 py-2">
        <header class="mb-2">
          <h2 class="font-bold">On this page</h2>
        </header>
        <ul role="navigation" class="flex flex-col gap-2">
          <li v-for="heading in headings" :key="heading.id">
            <a
              :href="`#${heading.id}`"
              class="border-b-2 border-current font-semibold"
              @click.prevent="heading.ref.scrollIntoView({ behavior: 'auto' })"
              >{{ heading.text }}</a
            >
          </li>
        </ul>
      </nav>
      <div class="flex-1" />
    </aside>
  </article>
  <Teleport to="head" v-for="(script, idx) in scripts" :key="idx">
    <component :is="'script'" type="text/javascript" :src="script.src">{{
      script.body
    }}</component>
  </Teleport>
</template>

<style>
main.prose {
  @apply text-current;
}
main.prose a {
  @apply no-underline border-b-2 border-current font-bold;
}
</style>
