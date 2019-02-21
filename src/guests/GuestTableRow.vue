<!--
GuestTableRow displays one row in the GuestTable.
-->

<template lang="pug">
tr(
  :class="[$style.top, selected ? 'blue lighten-3' : null]"
  :draggable="draggable"
  @click="$emit('select')"
  @dragstart="dragStart"
)
  td(
    :class="$style.bidder"
    v-text="guest.bidder || ''"
  )
  td(
    :class="$style.guest"
    v-text="guest.sortname"
  )
</template>

<script>
export default {
  name: 'PayerTableRow',
  props: {
    guest: { type: Object, required: true },
    selected: { type: Boolean, required: true },
  },
  computed: {
    draggable() {
      return !this.selected
    },
  },
  methods: {
    dragStart(evt) {
      evt.dataTransfer.setData('guestid', this.guest.id)
      evt.dataTransfer.dropEffect = 'link'
    },
  },
}
</script>

<style lang="stylus" module>
.top
  user-select none
.bidder
  padding 4px 32px 4px 0 !important
  height auto !important
  text-align right
.guest
  padding 4px 16px 4px 0 !important
  height auto !important
</style>
