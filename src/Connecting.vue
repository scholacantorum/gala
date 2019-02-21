<!--
Connecting displays the Connecting banner message.
-->

<template lang="pug">
  v-container(fluid fill-height)
    v-layout(align-center justify-center)
      span(class="headline") Connecting to server...
</template>

<script>
export default {
  name: 'Connecting',
}
</script>
