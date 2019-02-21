<!--
PayerSearch displays the search bar for the payer list on the Payments tab.
-->

<template lang="pug">
div(:class="$style.top")
  v-text-field(
    :value="value"
    append-icon="search"
    label="Search"
    single-line
    hide-details
    @input="$emit('input', $event)"
  )
</template>

<script>
export default {
  name: 'PayerSearch',
  props: {
    value: String,
  },
}
</script>

<style lang="stylus" module>
.top
  flex 0 0 auto
</style>
