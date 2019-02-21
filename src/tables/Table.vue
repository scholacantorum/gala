<!--
Table displays one table on the Tables tab.
-->

<template lang="pug">
div(
  ref="top"
  :class="{[$style.top]: true, [$style.overload]: overloaded}"
  :style="positionStyle"
  @dragover="dragOver"
  @drop="drop"
)
  div(
    :class="{[$style.handle]: true, [$style.overload]: overloaded}"
    draggable
    @dragstart="dragStart"
  )
  div(:class="$style.parties")
    TableParty(
      v-for="party in parties"
      :key="party.id"
      :party="party"
    )
  TableNumber(
    v-if="table.number"
    :number="table.number"
    attached
  )
</template>

<script>
import TableNumber from './TableNumber'
import TableParty from './TableParty'

export default {
  name: 'Table',
  // parent: ,
  // functional: true,
  components: { TableNumber, TableParty },
  // filters: {},
  // extends: ,
  // mixins: [],
  // inheritAttrs: false,
  // model: { prop: '', event: '' },
  props: {
    table: { type: Object, required: true },
  },
  data: () => ({
    overloaded: false,
    parties: [],
  }),
  computed: {
    positionStyle() {
      return {
        top: `${this.table.y}px`,
        left: `${this.table.x}px`,
      }
    },
  },
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
      if (
        evt.dataTransfer.types.includes('tableid') ||
        evt.dataTransfer.types.includes('partyid') ||
        evt.dataTransfer.types.includes('guestid') ||
        evt.dataTransfer.types.includes('tablenum')
      ) {
        evt.preventDefault()
        evt.stopPropagation()
      }
    },
    dragStart(evt) {
      evt.dataTransfer.setData('tableid', this.table.id)
      const cbr = this.$refs.top.getBoundingClientRect()
      const left = cbr.left
      const top = cbr.top - 48
      // TODO adjust left and top for scrolling
      evt.dataTransfer.setData('offsetX', evt.clientX - left)
      evt.dataTransfer.setData('offsetY', evt.clientY - top)
      evt.dataTransfer.dropEffect = 'move'
      evt.dataTransfer.setDragImage(
        this.$refs.top,
        evt.offsetX + 2,
        evt.offsetY + 2
      )
    },
    drop(evt) {
      if (evt.dataTransfer.types.includes('tableid')) this.dropTable(evt)
      if (evt.dataTransfer.types.includes('partyid')) this.dropParty(evt)
      if (evt.dataTransfer.types.includes('guestid')) this.dropGuest(evt)
      if (evt.dataTransfer.types.includes('tablenum')) this.dropTableNumber(evt)
    },
    dropGuest(evt) {
      const guestID = parseInt(evt.dataTransfer.getData('guestid'))
      let guest = this.$store.state.guests[guestID]
      let party = this.$store.state.parties[guest.party]
      if (party.guests.length < 2) {
        // We're really just moving the party.
        party = Object.assign({}, party)
        party.table = this.table.id
        this.$store.dispatch('saveParty', party)
      } else {
        // We're creating a new party for this guest.
        guest = Object.assign({}, guest)
        guest.party = 0
        guest.table = this.table.id
        this.$store.dispatch('saveGuest', guest)
      }
      evt.preventDefault()
      evt.stopPropagation()
    },
    dropParty(evt) {
      const partyID = parseInt(evt.dataTransfer.getData('partyid'))
      const party = Object.assign({}, this.$store.state.parties[partyID])
      party.table = this.table.id
      this.$store.dispatch('saveParty', party)
      evt.preventDefault()
      evt.stopPropagation()
    },
    dropTable(evt) {
      const tableid = parseInt(evt.dataTransfer.getData('tableid'))
      if (tableid !== this.table.id) {
        // merge tables.
        const from = this.$store.state.tables[tableid]
        from.parties.forEach(pid => {
          const party = Object.assign({}, this.$store.state.parties[pid])
          party.table = this.table.id
          this.$store.dispatch('saveParty', party)
        })
      }
      evt.preventDefault()
      evt.stopPropagation()
    },
    dropTableNumber(evt) {
      const tablenum = parseInt(evt.dataTransfer.getData('tablenum'))
      const table = Object.assign({}, this.table)
      table.number = tablenum
      this.$store.dispatch('saveTable', table)
      evt.preventDefault()
      evt.stopPropagation()
    },
    reset() {
      this.parties = this.table.parties.map(
        pid => this.$store.state.parties[pid]
      )
      const guestCount = this.parties.reduce((a, p) => a + p.guests.length, 0)
      this.overloaded = guestCount > 10
    },
  },
}
</script>

<style lang="stylus" module>
.top
  position absolute
  display block
  border 2px solid indigo
  border-radius 4px
  background-color white
  &.overload
    border-color red
.handle
  height 16px
  background-color indigo
  &.overload
    background-color red
.parties
  padding 4px
</style>
