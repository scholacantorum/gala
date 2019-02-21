<!--
Failure displays the Failure banner message.
-->

<template lang="pug">
  v-container(fluid fill-height)
    v-layout(align-center justify-center column)
      span(class="headline") A software error has occurred.
      span.subheading Please report this to the webmaster.  Provide details from the Javascript console if you know how.
      v-btn.mt-5(@click="restart") Restart
</template>

<script>
export default {
  name: 'Failure',
  methods: {
    restart() {
      window.location.reload()
    },
  },
}
</script>
