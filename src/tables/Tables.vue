<!--
Tables displays the Tables tab.
-->

<template lang="pug">
div(
  ref="top"
  :class="$style.top"
  @dragover="dragOver"
  @drop.prevent="drop"
)
  Table(
    v-for="table in tables"
    :key="table.id"
    :table="table"
  )
  TableNumber(
    :number="nextTableNumber"
    :attached="false"
  )
</template>

<script>
import Table from './Table'
import TableNumber from './TableNumber'
import autolayout from './autolayout'

export default {
  name: 'Tables',
  // parent: ,
  // functional: true,
  components: { Table, TableNumber },
  // filters: {},
  // extends: ,
  mixins: [autolayout],
  // inheritAttrs: false,
  // model: { prop: '', event: '' },
  // props: {},
  data: () => ({
    nextTableNumber: 0,
    tables: [],
  }),
  // computed: {},
  watch: {
    '$store.state.sequence': {
      immediate: true,
      handler: 'reset',
    },
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
      if (evt.dataTransfer.types.includes('tableid')) evt.preventDefault()
      if (evt.dataTransfer.types.includes('partyid')) evt.preventDefault()
      if (evt.dataTransfer.types.includes('guestid')) evt.preventDefault()
      if (evt.dataTransfer.types.includes('tablenum')) evt.preventDefault()
    },
    drop(evt) {
      if (evt.dataTransfer.types.includes('tableid')) this.dropTable(evt)
      if (evt.dataTransfer.types.includes('partyid')) this.dropParty(evt)
      if (evt.dataTransfer.types.includes('guestid')) this.dropGuest(evt)
      if (evt.dataTransfer.types.includes('tablenum')) this.dropTableNumber(evt)
    },
    dropGuest(evt) {
      const guestID = parseInt(evt.dataTransfer.getData('guestid'))
      const offsetX = parseInt(evt.dataTransfer.getData('offsetX'))
      const offsetY = parseInt(evt.dataTransfer.getData('offsetY'))
      let guest = this.$store.state.guests[guestID]
      const party = this.$store.state.parties[guest.party]
      if (party.guests.length == 1) {
        // we're really moving the party.
        this.dropPartyInner(evt, party, offsetX + 16, offsetY)
        return
      }
      // We want to create a new table with a new party with the guest.
      guest = Object.assign({}, guest)
      guest.party = 0
      guest.x = Math.max(0, evt.clientX - offsetX - 22)
      guest.y = Math.max(0, evt.clientY - offsetY - 22)
      this.$store.dispatch('saveGuest', guest)
    },
    dropParty(evt) {
      const partyID = parseInt(evt.dataTransfer.getData('partyid'))
      const offsetX = parseInt(evt.dataTransfer.getData('offsetX'))
      const offsetY = parseInt(evt.dataTransfer.getData('offsetY'))
      const party = this.$store.state.parties[partyID]
      this.dropPartyInner(evt, party, offsetX, offsetY)
    },
    dropPartyInner(evt, party, offsetX, offsetY) {
      const table = this.$store.state.tables[party.table]
      if (table.parties.length == 1) {
        // we're really moving the table.
        this.dropTableInner(evt, table, offsetX + 6, offsetY + 22)
        return
      }
      // We want to create a new table with the party.
      this.$store.dispatch('saveParty', {
        id: party.id,
        table: 0,
        x: Math.max(0, evt.clientX - offsetX - 6),
        y: Math.max(0, evt.clientY - offsetY - 22),
      })
    },
    dropTable(evt) {
      const tableID = parseInt(evt.dataTransfer.getData('tableid'))
      const offsetX = parseInt(evt.dataTransfer.getData('offsetX'))
      const offsetY = parseInt(evt.dataTransfer.getData('offsetY'))
      const table = this.$store.state.tables[tableID]
      this.dropTableInner(evt, table, offsetX, offsetY)
    },
    dropTableInner(evt, table, offsetX, offsetY) {
      table = Object.assign({}, table)
      table.x = Math.max(0, evt.clientX - offsetX)
      table.y = Math.max(0, evt.clientY - offsetY)
      this.$store.dispatch('saveTable', table)
    },
    dropTableNumber(evt) {
      const tablenum = parseInt(evt.dataTransfer.getData('tablenum'))
      let table = this.tables.find(t => t.number === tablenum)
      if (!table) return
      table = Object.assign({}, table)
      table.number = 0
      this.$store.dispatch('saveTable', table)
    },
    reset() {
      this.tables = Object.values(this.$store.state.tables)
      let n
      for (n = 1; ; n++) if (!this.tables.some(t => t.number === n)) break
      this.nextTableNumber = n
    },
  },
}
</script>

<style lang="stylus" module>
.top
  position relative
  height 100%
</style>
