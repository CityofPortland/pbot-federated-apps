<template>
  <div class="hero-image bg-no-repeat bg-center bg-cover h-[50svh]">
    <div class="w-5/6 md:w-3/4 lg:w-1/2 px-2 pt-6 mx-auto text-white">
      <h1 class="block text-center">Welcome to Portland in the year 2035</h1>
      <section class="flex flex-col md:flex-row">
        <div class="w-full md:w-1/2 p-2">
          <router-link
            to="/streets"
            class="block w-full px-2 py-3 bg-orange-500 border border-orange-900 rounded text-center text-orange-900 hover:bg-orange-600 focus:outline-none focus:shadow-outline focus:bg-orange-600"
            >Browse your streets</router-link
          >
        </div>
        <div class="w-full md:w-1/2 p-2">
          <router-link
            to="/text"
            class="block w-full px-2 py-3 bg-gray-200 border border-gray-900 rounded text-center text-gray-900 hover:bg-gray-400 focus:outline-none focus:shadow-outline focus:bg-gray-400"
            >Read about our plans</router-link
          >
        </div>
      </section>
    </div>
  </div>
  <section class="container max-w-7xl px-4 py-3 mx-auto">
    <h2>Portland's Transportation System Plan</h2>
    <p>
      Portland's 2035 Transportation System Plan (TSP) is a roadmap for the next
      20 years of transportation policy and investment, helping us face the
      challenges of a growing city. The TSP outlines how we balance safety,
      equity and the demands of our economy. It enshrines the values of complete
      neighborhoods with more options for getting around. And it tells the story
      of how all of our planning efforts lead us to a less congested, more
      livable tomorrow.
    </p>
    <h3>What is the TSP?</h3>
    <p>
      The Transportation System Plan is the 20-year plan to guide transportation
      policies and investments in Portland by:
    </p>
    <ul>
      <li>
        supporting the City's commitment to Vision Zero by saving lives and
        reducing injuries to all people using our transportation system
      </li>
      <li>helping transit and freight vehicles to move more reliably</li>
      <li>reducing, carbon emissions and promoting healthy lifestyles</li>
      <li>
        keeping more money in the local economy, as we spend less on vehicles
        and fuel
      </li>
      <li>
        <span>creating great places</span>
      </li>
    </ul>
    <h3>Using the TSP Digital Document</h3>
    <p>
      <span>
        This digital version of the document is intended to serve as a tool and
        resource for people trying to use different components of the TSP.
        Sections available here include Major Projects, Street Classifications,
        Master Street Plans, and Area Plans. This is by no means a full version
        of the document, so visit this site to view the document in its
        entirety:
      </span>
      <a
        href="https://www.portland.gov/transportation/planning/tsp-document-downloads"
        class="border-b-2 border-black"
        >https://www.portland.gov/transportation/planning/tsp-document-downloads</a
      >
    </p>
  </section>
</template>

<script setup lang="ts"></script>

<style scoped>
.hero-image {
  background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
    url('/img/portlandgov-growth-scenario-1920.jpg');
}

h1 {
  @apply text-3xl mb-6;
}

h2 {
  @apply text-2xl mb-5;
}

h3 {
  @apply text-xl mb-4;
}

ul {
  @apply list-disc list-outside pl-4;
}

p {
  @apply mb-3;
}
</style>
