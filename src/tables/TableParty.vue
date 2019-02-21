<!--
TableParty displays one party at a table in the Tables tab.
-->

<template lang="pug">
div(
  ref="top"
  :class="$style.top"
  @dragover="dragOver"
  @drop="drop"
)
  div(
    :class="$style.handle"
    draggable
    @dragstart="dragStart"
  )
  div
    TableGuest(v-for="guest in guests" :key="guest.id" :guest="guest")
</template>

<script>
import TableGuest from './TableGuest'

export default {
  name: 'TableParty',
  // parent: ,
  // functional: true,
  components: { TableGuest },
  // filters: {},
  // extends: ,
  // mixins: [],
  // inheritAttrs: false,
  // model: { prop: '', event: '' },
  props: {
    party: { type: Object, required: true },
  },
  data: () => ({
    guests: [],
  }),
  // computed: {},
  watch: {
    '$store.state.sequence': { immediate: true, handler: 'reset' },
  },
  // beforeCreate() {},
  // created() {},
  // beforeMount() {},
  // mounted() {},
  // beforeRouteUpdate(to, from, next) {},
  // beforeUpdate() {},
  // updated() {},
  // activated() {},
  // beforeRouteEnter(to, from, next) {},
  // beforeRouteLeave(to, from, next) {},
  // deactivated() {},
  // beforeDestroy() {},
  // destroyed() {},
  methods: {
    dragOver(evt) {
      if (evt.dataTransfer.types.includes('guestid')) {
        evt.preventDefault()
        evt.stopPropagation()
      }
    },
    dragStart(evt) {
      evt.dataTransfer.setData('partyid', this.party.id)
      const cbr = this.$refs.top.getBoundingClientRect()
      const left = cbr.left
      const top = cbr.top - 48
      // TODO adjust left and top for scrolling
      evt.dataTransfer.setData('offsetX', evt.clientX - left)
      evt.dataTransfer.setData('offsetY', evt.clientY - top)
      evt.dataTransfer.dropEffect = 'move'
      evt.dataTransfer.setDragImage(
        this.$refs.top,
        evt.offsetX + 1,
        evt.offsetY
      )
    },
    drop(evt) {
      const guestID = parseInt(evt.dataTransfer.getData('guestid'))
      if (!guestID) return
      const guest = Object.assign({}, this.$store.state.guests[guestID])
      guest.party = this.party.id
      this.$store.dispatch('saveGuest', guest)
      evt.preventDefault()
      evt.stopPropagation()
    },
    reset() {
      this.guests = this.party.guests.map(gid => this.$store.state.guests[gid])
    },
  },
}
</script>

<style lang="stylus" module>
.top
  display flex
  border 1px solid black
.handle
  flex none
  width 16px
  background-color #ccc
</style>
