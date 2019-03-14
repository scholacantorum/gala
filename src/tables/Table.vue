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
    div(:class="$style.number" v-text="table.number || ''")
    div(:class="$style.name" v-text="table.name")
    v-dialog(v-model="editDialog" persistent max-width="620")
      template(v-slot:activator="{ on }")
        v-icon(:class="$style.edit" v-on="on") edit
      v-card(:class="$style.dialog")
        v-text-field.mx-2(
          v-if="editDialog"
          :class="$style.ednum"
          :value="table.number || ''"
          autofocus mask="##" label="Number"
          @input="table.number = parseInt($event) || 0"
          @keyup.enter="$refs.edname.focus()"
        )
        v-text-field(
          ref="edname"
          v-model="table.name"
          :class="$style.edname"
          label="Name"
          @keyup.enter="save"
        )
        v-btn(color="indigo" dark @click="save") OK
  div(:class="$style.parties")
    TableParty(
      v-for="party in parties"
      :key="party.id"
      :party="party"
    )
</template>

<script>
import TableParty from './TableParty'

export default {
  name: 'Table',
  components: { TableParty },
  props: {
    table: { type: Object, required: true },
  },
  data: () => ({
    editDialog: false,
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
  methods: {
    dragOver(evt) {
      if (
        evt.dataTransfer.types.includes('tableid') ||
        evt.dataTransfer.types.includes('partyid') ||
        evt.dataTransfer.types.includes('guestid')
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
        evt.offsetX + 4,
        evt.offsetY + 4
      )
    },
    drop(evt) {
      if (evt.dataTransfer.types.includes('tableid')) this.dropTable(evt)
      if (evt.dataTransfer.types.includes('partyid')) this.dropParty(evt)
      if (evt.dataTransfer.types.includes('guestid')) this.dropGuest(evt)
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
    reset() {
      this.parties = this.table.parties.map(
        pid => this.$store.state.parties[pid]
      )
      const guestCount = this.parties.reduce((a, p) => a + p.guests.length, 0)
      this.overloaded = guestCount > 10
    },
    save() {
      this.$store.dispatch('saveTable', this.table)
      this.editDialog = false
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
  display flex
  justify-content stretch
  padding 0 4px
  height 16px
  background-color indigo
  color white
  font-weight bold
  line-height 1
  &.overload
    background-color red
.number
  flex none
  width 20px
.name
  flex 1 1 auto
.edit
  flex none
  padding-bottom 2px
  color white !important
  font-size 14px
.dialog
  display flex
.ednum
  flex none
  width 100px
.edname
  flex none
  width 400px
.parties
  padding 4px
</style>
