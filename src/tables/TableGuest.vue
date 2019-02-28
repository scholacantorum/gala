<!--
TableGuest displays one guest at a table on the Tables tab.
-->

<template lang="pug">
div(
  ref="top"
  :class="{ [$style.top]: true, [$style.hasRequests]: !!guest.requests }"
  :title="guest.requests"
  draggable
  @dragstart="dragStart"
  v-text="guest.sortname"
)
</template>

<script>
export default {
  name: 'TableGuest',
  props: {
    guest: { type: Object, required: true },
  },
  methods: {
    dragStart(evt) {
      evt.dataTransfer.setData('guestid', this.guest.id)
      const cbr = this.$refs.top.getBoundingClientRect()
      const left = cbr.left
      const top = cbr.top - 48
      // TODO adjust left and top for scrolling
      evt.dataTransfer.setData('offsetX', evt.clientX - left)
      evt.dataTransfer.setData('offsetY', evt.clientY - top)
      evt.dataTransfer.dropEffect = 'move'
    },
  },
}
</script>

<style lang="stylus" module>
.top
  overflow hidden
  padding 0 4px
  width 150px
  border-top 1px solid #ccc
  background-color white
  text-overflow ellipsis
  white-space nowrap
  font-size 12px
  &:first-child
    border-top none
.hasRequests
  color #f57c00
</style>
