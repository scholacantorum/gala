<!--
PayerTableRow displays one row in the PayerTable.
-->

<template lang="pug">
tr(
  :class="[$style.top, selected ? 'blue lighten-3' : null]"
  @click="$emit('select')"
)
  td(:class="$style.icons")
    v-icon(
      v-if="payer.allPaid"
      :class="$style.icon"
      color="green"
      title="All purchases paid"
    ) check_circle
    v-icon(
      v-else-if="!payer.useCard"
      :class="$style.icon"
      color="red"
      title="No card on file"
    ) warning
  td(
    :class="$style.bidder"
    v-text="payer.bidder || ''"
  )
  td(
    :class="$style.payer"
    v-text="payer.sortname"
  )
</template>

<script>
export default {
  name: 'PayerTableRow',
  props: {
    payer: { type: Object, required: true },
    selected: { type: Boolean, required: true },
  },
}
</script>

<style lang="stylus" module>
.top
  user-select none
.icons
  padding 4px 16px !important
  height auto !important
.icon
  vertical-align inherit
  font-size 20px
  line-height 1
.bidder
  padding 4px 32px 4px 0 !important
  height auto !important
  text-align right
.payer
  padding 4px 16px 4px 0 !important
  height auto !important
</style>
