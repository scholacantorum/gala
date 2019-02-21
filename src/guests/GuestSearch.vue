<!--
GuestSearch displays the search bar for the guest list on the Guests tab.
-->

<template lang="pug">
div(:class="$style.top")
  v-text-field(
    :value="value"
    append-icon="search"
    label="Search"
    clearable single-line hide-details
    @input="$emit('input', $event)"
  )
</template>

<script>
export default {
  name: 'GuestSearch',
  props: {
    value: String,
  },
}
</script>

<style lang="stylus" module>
.top
  flex 0 0 auto
</style>
