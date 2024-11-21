<script setup lang="ts">
import { Anchor, FieldList, Field, Box } from '@pbotapps/components';
import { onMounted, ref, toRefs } from 'vue';
import { onBeforeRouteUpdate } from 'vue-router';

import MissingImage from '../components/MissingImage.vue';
import { useRuleStore, useSignStore } from '../store';
import { Sign } from '../types';

const rules = useRuleStore();
const signs = useSignStore();

const props = defineProps({
  code: { type: String, required: true },
});

const { code } = toRefs(props);

const sign = ref<Sign>();

onMounted(async () => {
  sign.value = await signs.get(code.value);
});

const get = async (code: string) => {
  const s = signs.sign(code);

  if (s) {
    sign.value = { ...s };
  }
};

onMounted(async () => {
  get(code.value);
});
onBeforeRouteUpdate(async to => {
  get(to.params.code as string);
  return true;
});
</script>

<template>
  <article v-if="sign">
    <header class="prose prose-lg max-w-none flex">
      <h1 class="flex-1">{{ sign.code }}</h1>
      <router-link
        v-if="rules.has('edit', 'sign')"
        :to="`/${sign.code}/edit`"
        custom
        v-slot="{ href, navigate }"
      >
        <Anchor :url="href" @click="navigate" class="no-underline">Edit</Anchor>
      </router-link>
    </header>
    <main class="mt-8 flex flex-col sm:flex-row gap-4">
      <section class="sm:w-1/2">
        <figure class="justify-self-start mb-8">
          <MissingImage
            v-if="!sign.image || !sign.image.full"
            class="w-64 h-64"
          />
          <img
            v-else
            class="flex justify-center items-center max-h-80"
            :src="sign.image.full"
          />
        </figure>
        <section class="flex flex-col gap-4">
          <FieldList class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              v-if="
                sign.image &&
                (sign.image.design || sign.image.full || sign.image.thumbnail)
              "
              name="Image"
              display="above"
              class="not-prose"
            >
              <ul class="flex gap-1 list-none">
                <li v-if="sign.image.thumbnail">
                  <Anchor :url="sign.image.thumbnail" class="no-underline">
                    Thumbnail
                  </Anchor>
                </li>
                <li v-if="sign.image.full">
                  <Anchor :url="sign.image.full" class="no-underline">
                    Full
                  </Anchor>
                </li>
                <li>
                  <Anchor
                    v-if="sign.image.design"
                    :url="sign.image.design"
                    class="no-underline"
                  >
                    Design file
                  </Anchor>
                </li>
              </ul>
            </Field>
            <Field name="Type" display="above">
              {{ sign.type || 'NULL' }}
            </Field>
            <Field v-if="sign.mutcdCode" name="MUTCD code" display="above">
              {{ sign.mutcdCode }}
            </Field>
            <Field v-if="sign.odotCode" name="ODOT code" display="above">
              {{ sign.odotCode }}
            </Field>
            <Field name="Shape" display="above">
              {{ sign.shape || 'NULL' }}
            </Field>
            <Field name="Color" display="above">
              {{ sign.color || 'NULL' }}
            </Field>
            <Field name="Size" display="above">
              {{ `${sign.width}" by ${sign.height}"` || 'NULL' }}
            </Field>
          </FieldList>
          <FieldList class="grid grid-cols-1 gap-4">
            <Field name="Legend" display="above">
              {{ sign.legend || 'NULL' }}
            </Field>
            <Field v-if="sign.source" name="Source" display="above">
              {{ sign.source }}
            </Field>
            <Field v-if="sign.comment" name="Comments" display="above">
              {{ sign.comment || 'NULL' }}
            </Field>
          </FieldList>
        </section>
      </section>
      <aside class="grid grid-cols-1 gap-4">
        <FieldList class="justify-self-start space-y-2 md:text-sm">
          <Box
            :color="sign.status == 'obsolete' ? 'tangerine' : 'transparent'"
            variant="light"
            :class="{
              'p-2 -mx-2 border border-current rounded-md':
                sign.status == 'obsolete',
            }"
          >
            <Field name="Status" display="above">
              {{ sign.status }}
            </Field>
            <Field
              v-if="sign.obsoletePolicy"
              name="Obsoletion policy"
              display="above"
            >
              {{ sign.obsoletePolicy }}
            </Field>
            <Field
              v-if="sign.replacedBy"
              name="Replaced by"
              display="above"
              class="not-prose"
            >
              <router-link
                :to="`/${sign.replacedBy}`"
                custom
                v-slot="{ href, navigate }"
              >
                <Anchor :url="href" @click="navigate">
                  {{ sign.replacedBy }}
                </Anchor>
              </router-link>
            </Field>
          </Box>
          <Field v-if="sign.created" name="Created" display="above">
            {{
              new Date(Date.parse(sign.created.toString())).toLocaleString(
                'en-US',
                {
                  dateStyle: 'long',
                  timeStyle: 'medium',
                }
              )
            }}
          </Field>
          <Field v-if="sign.creator" name="Created by" display="above">
            {{ sign.creator }}
          </Field>
          <Field v-if="sign.updated" name="Changed" display="above">
            {{
              new Date(Date.parse(sign.updated.toString())).toLocaleString(
                'en-US',
                {
                  dateStyle: 'long',
                  timeStyle: 'medium',
                }
              )
            }}
          </Field>
          <Field v-if="sign.updater" name="Changed by" display="above">
            {{ sign.updater }}
          </Field>
          <Field
            v-if="sign._revisions"
            name="Revisions"
            display="above"
            class="not-prose"
          >
            <router-link
              :to="`/${sign.code}/revisions`"
              custom
              v-slot="{ href, navigate }"
            >
              <Anchor :url="href" @click="navigate">
                {{ `${sign._revisions.length} revisions` }}
              </Anchor>
            </router-link>
          </Field>
        </FieldList>
      </aside>
    </main>
  </article>
  <span v-else>Loading...</span>
</template>
