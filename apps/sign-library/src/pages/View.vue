<script setup lang="ts">
import { Anchor, FieldList, Field, Box } from '@pbotapps/components';
import { onMounted, ref, toRefs } from 'vue';

import MissingImage from '../components/MissingImage.vue';
import { useStore } from '../store';
import { Sign } from '../types';
import { onBeforeRouteUpdate } from 'vue-router';

const store = useStore();

const props = defineProps({
  code: { type: String, required: true },
});

const { code } = toRefs(props);

const sign = ref<Partial<Sign>>({});

//const sign = computed(() => await store.getSign(code.value));

onMounted(async () => {
  sign.value = { ...(await store.getSign(code.value)) };
});
onBeforeRouteUpdate(async to => {
  sign.value = { ...(await store.getSign(to.params.code as string)) };
  return true;
});
</script>

<template>
  <article v-if="sign">
    <header class="prose prose-lg max-w-none flex">
      <h1 class="flex-1">{{ sign.code }}</h1>
      <router-link
        v-if="store.hasRule('edit', 'sign')"
        :to="`/${sign.code}/edit`"
        custom
        v-slot="{ href, navigate }"
      >
        <Anchor :url="href" @click="navigate" class="no-underline">Edit</Anchor>
      </router-link>
    </header>
    <main class="mt-8 space-y-8">
      <header class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <figure class="justify-self-center">
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
          <Field v-if="sign._created" name="Created" display="above">
            {{
              new Date(Date.parse(sign._created.toString())).toLocaleString(
                'en-US',
                {
                  dateStyle: 'long',
                  timeStyle: 'medium',
                }
              )
            }}
          </Field>
          <Field v-if="sign._createdBy" name="Created by" display="above">
            {{ sign._createdBy }}
          </Field>
          <Field v-if="sign._changed" name="Changed" display="above">
            {{
              new Date(Date.parse(sign._changed.toString())).toLocaleString(
                'en-US',
                {
                  dateStyle: 'long',
                  timeStyle: 'medium',
                }
              )
            }}
          </Field>
          <Field v-if="sign._changedBy" name="Changed by" display="above">
            {{ sign._changedBy }}
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
      </header>
      <section class="md:w-3/4">
        <FieldList class="space-y-2">
          <Field
            v-if="
              sign.image &&
              (sign.image.design || sign.image.full || sign.image.thumbnail)
            "
            name="Image"
            display="inline"
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
          <Field name="Type" display="inline">
            {{ sign.type || 'NULL' }}
          </Field>
          <Field v-if="sign.mutcdCode" name="MUTCD code" display="inline">
            {{ sign.mutcdCode }}
          </Field>
          <Field v-if="sign.odotCode" name="ODOT code" display="inline">
            {{ sign.odotCode }}
          </Field>
          <Field name="Shape" display="inline">
            {{ sign.shape || 'NULL' }}
          </Field>
          <Field name="Color" display="inline">
            {{ sign.color || 'NULL' }}
          </Field>
          <Field name="Size" display="inline">
            {{ `${sign.width}" by ${sign.height}"` || 'NULL' }}
          </Field>
          <Field name="Legend" display="inline">
            {{ sign.legend || 'NULL' }}
          </Field>
          <Field v-if="sign.source" name="Source" display="inline">
            {{ sign.source }}
          </Field>
          <Field v-if="sign.comment" name="Comments" display="inline">
            {{ sign.comment || 'NULL' }}
          </Field>
        </FieldList>
      </section>
    </main>
  </article>
  <span v-else>Loading...</span>
</template>
