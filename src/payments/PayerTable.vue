<!--
PayerTable displays the data table of payers.
-->

<template lang="pug">
div(:class="$style.top")
  v-data-table(
    :class="$style.table"
    :custom-filter="filter"
    :custom-sort="sort"
    :headers="headers"
    :items="payers"
    :pagination="pagination"
    :search="search"
    :value="selected ? [selected] : []"
    hide-actions must-sort
    @update:pagination="pagination=$event"
  )
    template(slot="items" slot-scope="props")
      PayerTableRow(
        :payer="props.item"
        :selected="!!props.selected"
        @select="$emit('select', props.item)"
      )
</template>

<script>
import PayerTableRow from './PayerTableRow'

export default {
  name: 'PayerTable',
  components: { PayerTableRow },
  props: {
    search: { type: String, required: true },
    selected: Object,
  },
  data: () => ({
    allPayers: [],
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
          text: '',
          value: 'icons',
          sortable: true,
          class: this.$style.iconsTH,
        },
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
    payers() {
      const bidder = parseInt(this.search)
      if (!isNaN(bidder) && bidder > 0)
        return this.allPayers.filter(p => p.bidder === bidder)
      const search = this.search.toLowerCase()
      return this.allPayers.filter(p => p.name.toLowerCase().includes(search))
    },
  },
  watch: {
    '$store.state.sequence': {
      immediate: true,
      handler() {
        this.allPayers = Object.values(this.$store.state.guests).filter(
          g => !!g.payingForPurchases.length
        )
        if (this.selected)
          this.$emit(
            'select',
            this.allPayers.find(p => p.id === this.selected.id)
          )
      },
    },
  },
  methods: {
    filter(payers, search) {
      let bidder = parseInt(search)
      if (isNaN(bidder) || bidder < 1) bidder = null
      search = search.toLowerCase()
      return payers.filter(p =>
        bidder ? p.bidder === bidder : p.name.toLowerCase().includes(search)
      )
    },
    sort(payers, column, desc) {
      let sorted
      switch (column) {
        case 'icons':
          sorted = payers.sort((a, b) => {
            if (a.allPaid && !b.allPaid) return +1
            if (!a.allPaid && b.allPaid) return -1
            if (!a.allPaid && a.useCard && !b.useCard) return +1
            if (!a.allPaid && !a.useCard && b.useCard) return -1
            return a.sortname < b.sortname
              ? -1
              : a.sortname > b.sortname
              ? +1
              : 0
          })
          break
        case 'bidder':
          sorted = payers.sort((a, b) => {
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
          sorted = payers.sort((a, b) => {
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
  margin 16px 0
  height calc(100% - 32px)
.table :global(table.v-table)
  width auto
  thead tr
    height auto
.iconsTH
  padding 8px 16px !important
  min-width 52px
.bidderTH
  padding 8px 16px 8px 0 !important
.nameTH
  padding 8px 16px 8px 0 !important
  min-width 180px
</style>
