<!--
Disconnected displays the Disconnected banner message.
-->

<template lang="pug">
  v-container(fluid fill-height)
    v-layout(align-center justify-center column)
      span(class="headline") Lost connection to Gala server.
      span.subheading You may be having network difficulties, or the server may have been restarted.
      v-btn.mt-5(@click="restart") Reconnect
</template>

<script>
export default {
  name: 'Disconnected',
  methods: {
    restart() {
      window.location.reload()
    },
  },
}
</script>
