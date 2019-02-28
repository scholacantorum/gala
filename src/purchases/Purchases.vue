<!--
Purchases displays the Purchases tab.
-->

<template lang="pug">
v-container(fluid fill-height)
  v-layout(column)
    v-flex(shrink)
      PurchasesTop(
        @bidder="setBidder"
        @item="item = $event"
      )
    v-flex(:class="$style.bottom")
      v-card(:class="$style.card")
        div(:class="$style.tableScroll")
          table(:class="$style.table")
            thead
              tr(:class="$style.heading")
                th(:class="$style.itemTH") Item
                th(:class="$style.bidderTH" colspan="2") Bidder
                th(:class="$style.priceTH") Price
                th(:class="$style.payerTH") Payer
                th(:class="$style.actionsTH")
            tbody
              PurchaseRow(
                v-for="purchase, idx in filteredPurchases"
                :key="purchase.id"
                :purchase="purchase"
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
  }),
  computed: {
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
    setBidder(b) {
      b = parseInt(b, 16)
      this.bidder = !isNaN(b) && b > 0 ? b : 0
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
