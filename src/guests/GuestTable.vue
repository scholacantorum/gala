<!--
GuestTable displays the data table of guests.
-->

<template lang="pug">
div(:class="$style.top")
  v-data-table(
    :class="$style.table"
    :custom-filter="filter"
    :custom-sort="sort"
    :headers="headers"
    :items="guests"
    :pagination="pagination"
    :search="search"
    :value="selected ? [selected] : []"
    hide-actions must-sort
    @update:pagination="pagination=$event"
  )
    template(slot="items" slot-scope="props")
      GuestTableRow(
        :guest="props.item"
        :selected="!!props.selected"
        @select="$emit('select', props.item)"
      )
</template>

<script>
import GuestTableRow from './GuestTableRow'

export default {
  name: 'GuestTable',
  components: { GuestTableRow },
  props: {
    search: String,
    selected: Object,
  },
  data: () => ({
    allGuests: [],
    pagination: {
      sortBy: 'sortname',
      descending: false,
      page: 1,
      rowsPerPage: 1000,
      totalItems: 1000,
    },
  }),
  computed: {
    headers() {
      return [
        {
          text: 'Bidder',
          value: 'bidder',
          sortable: true,
          class: this.$style.bidderTH,
        },
        {
          text: 'Name',
          value: 'sortname',
          sortable: true,
          class: this.$style.nameTH,
        },
      ]
    },
    guests() {
      const search = (this.search || '').toLowerCase()
      const bidder = parseInt(search, 16)
      if (
        search &&
        search[0] >= '0' &&
        search[0] <= '9' &&
        !isNaN(bidder) &&
        bidder > 0
      )
        return this.allGuests.filter(g => g.bidder === bidder)
      return this.allGuests.filter(g => g.name.toLowerCase().includes(search))
    },
  },
  watch: {
    '$store.state.sequence': {
      immediate: true,
      handler() {
        this.allGuests = Object.values(this.$store.state.guests)
        if (this.selected)
          this.$emit(
            'select',
            this.allGuests.find(g => g.id === this.selected.id)
          )
      },
    },
  },
  methods: {
    filter(guests, search) {
      let bidder = parseInt(search, 16)
      if (
        !search ||
        search[0] < '0' ||
        search[0] > '9' ||
        isNaN(bidder) ||
        bidder < 1
      )
        bidder = null
      search = search.toLowerCase()
      return guests.filter(g =>
        bidder ? g.bidder === bidder : g.name.toLowerCase().includes(search)
      )
    },
    sort(guests, column, desc) {
      let sorted
      switch (column) {
        case 'bidder':
          sorted = guests.sort((a, b) => {
            if (a.bidder && !b.bidder) return -1
            if (!a.bidder && b.bidder) return +1
            if (a.bidder && a.bidder !== b.bidder) return a.bidder - b.bidder
            return a.sortname < b.sortname
              ? -1
              : a.sortname > b.sortname
                ? +1
                : 0
          })
          break
        case 'sortname':
          sorted = guests.sort((a, b) => {
            return a.sortname < b.sortname
              ? -1
              : a.sortname > b.sortname
                ? +1
                : 0
          })
          break
      }
      if (desc) sorted = sorted.reverse()
      return sorted
    },
  },
}
</script>

<style lang="stylus" module>
.top
  flex 1 1 0
  overflow-y auto
  margin 16px 0 0
  height calc(100% - 16px)
.table :global(table.v-table)
  width auto
  thead tr
    height auto
.bidderTH
  padding 8px 16px 8px 16px !important
.nameTH
  padding 8px 16px 8px 0 !important
  min-width 180px
</style>
