<!--
TableNumber displays a draggable table number badge.
-->

<template lang="pug">
div(
  :class="attached ? $style.attached : $style.unattached"
  draggable
  @dragstart="dragStart"
  v-text="number"
)
</template>

<script>
export default {
  name: 'TableNumber',
  props: {
    number: { type: Number, required: true },
    attached: { type: Boolean, required: true },
  },
  methods: {
    dragStart(evt) {
      evt.dataTransfer.setData('tablenum', this.number)
      evt.dataTransfer.dropEffect = 'move'
    },
  },
}
</script>

<style lang="stylus" module>
$common
  position absolute
  display flex
  justify-content center
  align-items center
  width 28px
  height 28px
  border-radius 50%
  background-color green
  color white
  font-size 20px
.unattached
  @extend $common
  bottom 16px
  left 16px
.attached
  @extend $common
  top -14px
  right -14px
</style>
