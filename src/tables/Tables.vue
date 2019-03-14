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
</template>

<script>
import Table from './Table'
import autolayout from './autolayout'

export default {
  name: 'Tables',
  components: { Table },
  mixins: [autolayout],
  data: () => ({
    tables: [],
  }),
  watch: {
    '$store.state.sequence': {
      immediate: true,
      handler: 'reset',
    },
  },
  methods: {
    dragOver(evt) {
      if (evt.dataTransfer.types.includes('tableid')) evt.preventDefault()
      if (evt.dataTransfer.types.includes('partyid')) evt.preventDefault()
      if (evt.dataTransfer.types.includes('guestid')) evt.preventDefault()
    },
    drop(evt) {
      if (evt.dataTransfer.types.includes('tableid')) this.dropTable(evt)
      if (evt.dataTransfer.types.includes('partyid')) this.dropParty(evt)
      if (evt.dataTransfer.types.includes('guestid')) this.dropGuest(evt)
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
    reset() {
      this.tables = Object.values(this.$store.state.tables)
    },
  },
}
</script>

<style lang="stylus" module>
.top
  position relative
  height 100%
</style>
