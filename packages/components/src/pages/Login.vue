<template>
  <main class="max-w-7xl mt-8 px-4 mx-auto">
    <section class="grid grid-cols-1 gap-4">
      <p>
        You must sign in before you can view this site. City Employees should
        login with their Office 365 credentials. Guests/contractors can login
        with their approved Office 365 account.
      </p>
      <SignIn
        size="large"
        color="blue"
        variant="neutral"
        class="flex-initial w-64"
        :redirect="redirect"
      />
    </section>
  </main>
</template>

<script setup lang="ts">
import SignIn from '../components/login/SignIn.vue';

defineProps({
  redirect: {
    type: String,
    required: false,
    default: () => '/'
  }
})

</script>
