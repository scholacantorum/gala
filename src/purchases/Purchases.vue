<!--
Purchases displays the Purchases tab.
-->

<template lang="pug">
v-container(fluid fill-height)
  v-layout(column)
    v-flex(shrink)
      PurchasesTop(
        @bidder="bidder = $event"
        @item="item = $event"
      )
    v-flex(:class="$style.bottom")
      v-card(:class="$style.card")
        div(:class="$style.tableScroll")
          v-data-table(
            :class="$style.table"
            :custom-sort="sort"
            :headers="headers"
            :items="filteredPurchases"
            :pagination="pagination"
            hide-actions must-sort
            @update:pagination="pagination=$event"
          )
            template(slot="items" slot-scope="props")
              PurchaseRow(
                :key="props.item.id"
                :purchase="props.item"
              )
</template>

<script>
import PurchaseRow from './PurchaseRow'
import PurchasesTop from './PurchasesTop'

export default {
  name: 'Purchases',
  components: { PurchaseRow, PurchasesTop },
  data: () => ({
    allPurchases: [],
    bidder: 0,
    item: null,
    pagination: {
      sortBy: 'id',
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
          text: 'Item',
          value: 'item',
          sortable: true,
          class: this.$style.itemTH,
        },
        {
          text: '#',
          align: 'right',
          value: 'bidnum',
          sortable: true,
          class: this.$style.bidderNumTH,
        },
        {
          text: 'Bidder',
          value: 'bidder',
          sortable: true,
          class: this.$style.bidderTH,
        },
        {
          text: 'Price',
          align: 'right',
          value: 'price',
          sortable: true,
          class: this.$style.priceTH,
        },
        {
          text: 'Payer',
          value: 'payer',
          sortable: true,
          class: this.$style.payerTH,
        },
        {
          text: '',
          value: 'actions',
          sortable: false,
          class: this.$style.actionsTH,
        },
      ]
    },
    filteredPurchases() {
      return this.allPurchases.filter(p => {
        if (this.item && this.item.id !== p.item) return false
        if (!this.bidder) return true
        return this.bidder === this.$store.state.guests[p.guest].bidder
      })
    },
  },
  watch: {
    '$store.state.sequence': {
      immediate: true,
      handler() {
        this.allPurchases = Object.values(this.$store.state.purchases)
      },
    },
  },
  methods: {
    sort(purchases, column, desc) {
      let sorted = purchases
      switch (column) {
        case 'item':
          sorted = purchases.sort((a, b) => {
            const an = this.$store.state.items[a.item].name
            const bn = this.$store.state.items[b.item].name
            return an < bn ? -1 : an > bn ? 1 : 0
          })
          break
        case 'bidnum':
          sorted = purchases.sort((a, b) => {
            const ab = this.$store.state.guests[a.guest].bidder
            const bb = this.$store.state.guests[b.guest].bidder
            return ab - bb
          })
          break
        case 'bidder':
          sorted = purchases.sort((a, b) => {
            const an = this.$store.state.guests[a.guest].sortname
            const bn = this.$store.state.guests[b.guest].sortname
            return an < bn ? -1 : an > bn ? 1 : 0
          })
          break
        case 'price':
          sorted = purchases.sort((a, b) => {
            return a.amount - b.amount
          })
          break
        case 'payer':
          sorted = purchases.sort((a, b) => {
            const an = this.$store.state.guests[a.payer].sortname
            const bn = this.$store.state.guests[b.payer].sortname
            return an < bn ? -1 : an > bn ? 1 : 0
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
.bottom
  display flex
  flex 1 1 0
  flex-direction column
  margin-top 24px
.card
  height 100%
.tableScroll
  overflow-y auto
  margin 16px 0
  height calc(100% - 32px)
.table
  margin 0 auto
  border-collapse collapse
.table tbody th, .table tbody td
  height: auto
.heading
  height 40px
  border-bottom 1px solid #808080
$th
  padding-right 24px
  color rgba(0, 0, 0, 0.54)
  vertical-align middle
  text-transform uppercase
  font-weight 500
  font-size 12px
  line-height 18px
.itemTH
  @extend $th
  padding-left 8px
  min-width 160px
  text-align left
.bidderNumTH
  @extend $th
  min-width 40px
  text-align right
.bidderTH
  @extend $th
  min-width 200px
  text-align left
.priceTH
  @extend $th
  min-width 40px
  text-align right
.payerTH
  @extend $th
  min-width 180px
  text-align left
.actionsTH
  @extend $th
  padding-right 8px
  min-width 40px
</style>
