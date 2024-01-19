<script setup lang="ts">
import { computed, ref } from 'vue';
import { Anchor, Box, Button } from '@pbotapps/components';

const now = new Date();

function generateRandomDate(from: Date, to: Date) {
  return new Date(
    from.getTime() + Math.random() * (to.getTime() - from.getTime())
  );
}

const data = ref(
  [...Array(5).keys()].map(() => {
    return {
      timestamp: generateRandomDate(new Date(2020, 1, 1), now).toISOString(),
      data: Math.random() * 2 ** 20,
    };
  })
);

const enriched = computed(() => {
  return data.value
    .map(d => {
      return {
        timestamp: new Date(d.timestamp),
        data: d.data,
      };
    })
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    .map(d => {
      return {
        year: d.timestamp.getFullYear(),
        month: d.timestamp.getMonth() + 1,
        timestamp: d.timestamp,
        data: d.data,
      };
    });
});
</script>

<template>
  <article class="grid grid-cols-1 gap-4">
    <Box
      as="header"
      class="p-12 grid grid-cols-1 md:grid-cols-2 items-center justify-items-center gap-12"
    >
      <div class="mx-auto flex flex-col gap-4 prose-lg">
        <h1>Welcome to PUDL</h1>
        <p>
          PUDL, short for Portland Urban Data Lake, is a project aimed at
          transforming the
          <Anchor url="https://portland.gov/transportation"
            >Portland Bureau of Transportation's</Anchor
          >
          (PBOT) approach to ingesting, analyzing, and managing data at any
          scale. Developed on
          <Anchor url="https://azure.microsoft.com/">Microsoft Azure</Anchor>,
          PUDL leverages open source technologies such as
          <Anchor url="https://kubernetes.io">Kubernetes</Anchor>,
          <Anchor url="https://spark.apache.org">Spark</Anchor>,
          <Anchor url="https://airflow.apache.org">Airflow</Anchor>,
          <Anchor url="https://hive.apache.org">Hive</Anchor>,
          <Anchor url="https://trino.io">Trino</Anchor> and
          <Anchor url="https://jupyter.org">Jupyter Notebooks</Anchor>. PBOT's
          Technical Services Group oversees PUDL, with support from Portland's
          <Anchor url="https://portland.gov/bts"
            >Bureau of Technology Services</Anchor
          >
          and
          <Anchor url="https://portland.gov/bps"
            >Bureau of Planning and Sustainability</Anchor
          >.
        </p>
      </div>
      <div class="mx-auto grid grid-cols-3 gap-12">
        <svg
          v-for="x in 3"
          :key="x"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-24 h-24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m21 7.5-2.25-1.313M21 7.5v2.25m0-2.25-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3 2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75 2.25-1.313M12 21.75V19.5m0 2.25-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25"
          />
        </svg>
        <svg
          v-for="x in 3"
          :key="x"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-24 h-24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
          />
        </svg>
        <svg
          v-for="x in 3"
          :key="x"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-24 h-24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
          />
        </svg>
      </div>
    </Box>
    <Box as="main" class="text-lg leading-relaxed">
      <Box
        as="section"
        color="red"
        variant="dark"
        class="p-12 grid grid-cols-1"
      >
        <p class="max-w-prose prose-lg mx-auto">
          PUDL is organized into distinct "zones" that represent the stages of
          data as it undergoes processing from original sources to warehoused
          data marts.
        </p>
      </Box>
      <Box
        color="red"
        variant="light"
        as="section"
        class="p-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center justify-items-center"
      >
        <Box as="div" class="flex flex-col gap-4">
          <header
            class="mx-auto text-7xl uppercase flex flex-col gap-4 items-center not-prose"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-24 h-24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
              />
            </svg>
            <h2 class="text-3xl text-center font-bold">Twilight Zone</h2>
            <h3 class="text-xl text-center font-semibold">
              Initial Data Intake
            </h3>
          </header>
          <main class="prose prose-lg text-current">
            <p>
              The "twilight" zone contains data that is captured from an
              external source. Those external sources may be an API, an internal
              database, or even a file.
            </p>
            <p>
              Data in this zone is not processed and typically only exists until
              it is processed. It is not cataloged for use by Data Analysts.
            </p>
          </main>
        </Box>
        <figure class="flex flex-col">
          <Box
            as="code"
            color="gray"
            variant="light"
            class="border border-current rounded-md p-2"
            >{{ JSON.stringify(data, null, 1).trim() }}</Box
          >
          <figcaption class="text-base italic mt-2">
            A snippet of data in JSON format to demonstrate data that might be
            stored in the "Twilight" zone. This data will be transformed in
            later sections.
          </figcaption>
        </figure>
      </Box>
      <Box as="section" color="orange" variant="dark" class="p-12">
        <p class="max-w-prose mx-auto">
          Data at this stage is stored in PUDL but requires further processing
          before it is ready for exploration by Data Analysts in tools like
          Tableau.
        </p>
      </Box>
      <Box as="main">
        <Box
          color="orange"
          variant="light"
          class="p-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center justify-items-center"
        >
          <Box as="div" class="flex flex-col gap-4">
            <header
              class="mx-auto uppercase flex flex-col gap-2 items-center not-prose"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-24 h-24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
                />
              </svg>

              <h2 class="text-3xl text-center font-bold">Raw Zone</h2>
              <h3 class="text-xl text-center font-semibold">
                Cataloging for Exploration
              </h3>
            </header>
            <main class="prose prose-lg text-current">
              <p>
                The "raw" zone contains cataloged data that Data Engineers have
                transformed into a tabular structure. Data here is typically
                unaltered from its initial intake except for necessary
                processing. Raw data may be duplicative, massive, and otherwise
                difficult to use use. Raw data here is mainly available to PUDL
                Data Engineers and Data Analysts to explore and to help develop
                enrichment processes.
              </p>
            </main>
            <footer class="mt-auto flex flex-col items-center not-prose">
              <router-link to="/zones/raw">
                <Button label="Browse raw data" size="large" color="orange" />
              </router-link>
            </footer>
          </Box>
          <figure class="flex flex-col">
            <Box
              as="span"
              color="gray"
              variant="light"
              class="not-prose w-full border border-current rounded-md p-2"
            >
              <table
                class="w-full table-auto border-separate border-spacing-2 text-left"
              >
                <thead>
                  <tr>
                    <th>timestamp</th>
                    <th>data</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(d, i) in data" :key="i">
                    <td>{{ d.timestamp }}</td>
                    <td>{{ d.data }}</td>
                  </tr>
                </tbody>
              </table>
            </Box>
            <figcaption class="text-base italic mt-2">
              A table of data demonstrating the transformation of data in JSON
              format to a tabular structure in the "Raw" zone. This data has not
              had other transformations done.
            </figcaption>
          </figure>
        </Box>
        <Box as="section" color="cyan" variant="dark" class="p-12">
          <p class="max-w-prose mx-auto">
            Data Engineers use Jupyter notebooks to explore and develop
            transformations, focusing on tasks like normalization of data types
            and field names. These transformations will evolve into pipelines
            managed by Apache Airflow.
          </p>
        </Box>
        <Box
          as="section"
          color="cyan"
          variant="light"
          class="p-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center justify-items-center"
        >
          <Box as="div" class="flex flex-col gap-4">
            <header
              class="mx-auto uppercase flex flex-col gap-2 items-center not-prose"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-24 h-24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z"
                />
              </svg>
              <h2 class="text-3xl text-center font-bold">Enriched Zone</h2>
              <h3 class="text-xl text-center font-semibold">
                Data Ready for Consumption
              </h3>
            </header>
            <main class="prose prose-lg text-current">
              <p>
                The "enriched" zone contains data derived from the raw data but
                processed for consumption in dashboards. Data has undergone
                tnormalization for consistency across datasets. Datasets are
                structured for easy joining using common dimensions or similar
                fields.
              </p>
              <p>
                Privacy and data stewardship needs are addressed through
                partitioning, filtering, and modification. Enriched data is
                suitable for sharing with a broader audience, though sensitive
                information may be restricted to Data Analysts responsible for
                stewardship.
              </p>
            </main>
            <footer class="mt-auto flex flex-col items-center not-prose">
              <router-link to="/zones/enriched">
                <Button
                  label="Browse enriched data"
                  size="large"
                  color="orange"
                  class="text-center"
                />
              </router-link>
            </footer>
          </Box>
          <figure class="flex flex-col overflow-auto">
            <Box
              as="span"
              color="gray"
              variant="light"
              class="not-prose w-full border border-current rounded-md p-2 overflow-auto"
            >
              <table
                class="w-full table-auto border-separate border-spacing-2 text-left"
              >
                <thead>
                  <tr>
                    <th>year</th>
                    <th>month</th>
                    <th>timestamp</th>
                    <th>data</th>
                    <th>diff_prev</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(x, i) in enriched" :key="i">
                    <td>{{ x.year }}</td>
                    <td>{{ x.month }}</td>
                    <td>{{ x.timestamp.toLocaleString() }}</td>
                    <td>{{ x.data }}</td>
                    <td>{{ x.data - enriched[i - 1]?.data }}</td>
                  </tr>
                </tbody>
              </table>
            </Box>
            <figcaption class="text-base italic mt-2">
              A table of data demonstrating the transformation of data from its
              "raw" form to an "enriched" form. There are now extra columns to
              help aggregate data, timestamps have been formatted and localized,
              and calculated columns are added to allow more robust analysis.
            </figcaption>
          </figure>
        </Box>
      </Box>
    </Box>
  </article>
</template>
