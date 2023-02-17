<script setup lang="ts">
import { Anchor, Box, Button, FieldList, Field } from '@pbotapps/components';
import { computed } from 'vue';
import Status from '../components/Status.vue';
import { useStore } from '../store';
import { Sign } from '../types';

const store = useStore();

const props = defineProps({
  code: { type: String, required: true },
});

const sign = computed(() => store.sign(props.code) ?? ({} as Sign));
</script>

<template>
  <article>
    <header class="prose prose-lg max-w-none flex">
      <h1 class="flex-1">{{ sign.code }}</h1>
      <router-link
        :to="`/${sign.code}/edit`"
        custom
        v-slot="{ href, navigate }"
      >
        <Anchor :url="href" @click="navigate" class="no-underline">Edit</Anchor>
      </router-link>
    </header>
    <main class="mt-8 flex flex-col md:flex-row">
      <section class="prose w-full md:w-3/4">
        <figure>
          <Box
            v-if="!sign.image"
            color="gray"
            variant="light"
            class="flex justify-center items-center h-64 w-64 p-4"
          >
            Sign image here
          </Box>
          <img
            v-else
            class="flex justify-center items-center h-64"
            :src="sign.image.full"
          />
        </figure>
        <section>
          <FieldList>
            <Field
              v-if="sign.image"
              name="Image"
              display="above"
              class="not-prose"
            >
              <ul class="flex gap-1 list-none">
                <li>
                  <Anchor :url="sign.image.thumbnail" class="no-underline">
                    Thumbnail
                  </Anchor>
                </li>
                <li>
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
            <Field name="Status" display="above">
              <Status :status="sign.status" />
            </Field>
            <Field name="Type" display="above">
              {{ sign.type || 'NULL' }}
            </Field>
            <Field name="MUTCD code" display="above">
              {{ sign.mutcdCode || 'NULL' }}
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
            <Field name="Legend" display="above">
              {{ sign.legend || 'NULL' }}
            </Field>
            <Field v-if="sign.description" name="Comments" display="above">
              {{ sign.description || 'NULL' }}
            </Field>
          </FieldList>
        </section>
      </section>
      <aside class="w-full md:w-1/4 prose md:prose-sm">
        <FieldList>
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
</template>
