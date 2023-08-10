<script setup lang="ts">
import { Anchor } from '@pbotapps/components';
</script>

<template>
  <article class="grid grid-cols-1 gap-4 mb-12">
    <header class="prose-lg">
      <h1>Welcome to PUDL</h1>
      <p>
        PUDL stands for Portland Urban Data Lake. It's a project to transform
        the way the
        <Anchor url="https://portland.gov/transportation"
          >Portland Bureau of Transportation</Anchor
        >
        (PBOT) ingests, analyzes, and manages data at any scale. It's built on
        <Anchor url="https://azure.microsoft.com/">Microsoft Azure</Anchor>
        using open source technologies including
        <Anchor url="https://kubernetes.io">Kubernetes</Anchor>,
        <Anchor url="https://spark.apache.org">Spark</Anchor>,
        <Anchor url="https://airflow.apache.org">Airflow</Anchor>,
        <Anchor url="https://hive.apache.org">Hive</Anchor>,
        <Anchor url="https://trino.io">Trino</Anchor> and
        <Anchor url="https://jupyter.org">Jupyter Notebooks</Anchor>. PUDL is
        managed by PBOT's Technical Services Group, with help from Portland's
        <Anchor url="https://portland.gov/bts"
          >Bureau of Technology Services</Anchor
        >
        and
        <Anchor url="https://portland.gov/bps"
          >Bureau of Planning and Sustainability</Anchor
        >.
      </p>
    </header>
    <main>
      <p>
        PUDL is organized into two "zones":
        <router-link to="/zones/raw" custom v-slot="{ href, navigate }">
          <Anchor :url="href" @click="navigate">raw</Anchor>
        </router-link>
        and
        <router-link to="/zones/enriched" custom v-slot="{ href, navigate }">
          <Anchor :url="href" @click="navigate">enriched</Anchor> </router-link
        >. The "raw" zone contains data that has only had the processing
        necessary to transform it into a tabular structure. The "enriched" zone
        contains data created from data in the raw zone. It has had the
        processing done to make it appropriate for consumption in dashboards.
      </p>
    </main>
  </article>
</template>
