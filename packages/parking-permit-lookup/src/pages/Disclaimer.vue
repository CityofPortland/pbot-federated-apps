<template>
  <article>
    <h1 class="text-2xl font-bold mb-8">Legal disclaimer</h1>
    <main class="grid grid-cols-1 gap-3 prose">
      <p>
        In an effort to make parking information more accessible, the Bureau of
        Transportation has created this application. Every effort has been made
        to offer the most current and correct information possible. The
        information included in this tool is subject to change without notice.
        The City of Portland makes no representations, express or implied, as to
        the accuracy, quality, content, completeness of the data queried through
        this function. The City reserves the right to make changes at any time
        without notice.
      </p>
      <p>
        By using this application, you assume all risks arising out of or
        associated with access to these pages, including but not limited to
        risks of damage to your computer, peripherals, software and data from
        any virus, software, file or other cause associated with access to this
        application. The City will not be liable for any damages whatsoever
        arising out of any cause relating to use of this application, including
        but not limited to mistakes, omissions, deletions, errors, or defects in
        any information contained in these pages, or any failure to receive or
        delay in receiving information.
      </p>
      <p>
        The City of Portland monitors network traffic to identify unauthorized
        attempts to upload or change information or to otherwise cause damage to
        the site. By using this Web site you expressly consent to such
        monitoring. The City's Bureau of Technology Services takes appropriate
        security measures to protect against unauthorized access, alteration or
        destruction of data. Unauthorized attempts to upload information or
        change information on this site are prohibited and may be punishable
        under the state Computer Trespass law and federal statutes including the
        Computer Fraud and Abuse Act of 1984 and the National Information
        Infrastructure Protection Act of 1996.
      </p>
    </main>
  </article>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Disclaimer',
});
</script>
