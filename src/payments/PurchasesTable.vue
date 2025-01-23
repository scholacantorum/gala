<!--
PurchasesTable displays the table of purchases to be paid by the selected payer
in the Payments tab.
-->

<template lang="pug">
div(:class="$style.top")
  v-data-table(
    :class="$style.table"
    :headers="headers"
    :items="purchases"
    :value="selected"
    hide-actions select-all
    @input="$emit('select', $event)"
  )
    template(slot="items" slot-scope="props")
      PurchasesTableRow(
        :purchase="props.item"
        :selected="!!props.selected"
        @select="props.selected = !props.selected"
      )
</template>

<script>
import PurchasesTableRow from './PurchasesTableRow'

export default {
  name: 'PurchasesTable',
  components: { PurchasesTableRow },
  model: { prop: 'selected', event: 'select' },
  props: {
    includePaid: { type: Boolean, required: true },
    payer: { type: Object, required: true },
    selected: { type: Array, required: true },
  },
  data: () => ({
    purchases: [],
  }),
  computed: {
    sequence() {
      return this.$store.state.sequence
    },
    headers() {
      return [
        // Select All column is automatically added here
        {
          text: 'Item',
          value: 'item',
          sortable: false,
          class: this.$style.itemTH,
        },
        {
          text: 'Bidder',
          value: 'bidder',
          sortable: false,
          class: this.$style.bidderTH,
        },
        {
          text: 'Price',
          value: 'amount',
          sortable: false,
          class: this.$style.amountTH,
        },
        {
          text: 'Payment',
          value: 'payment',
          sortable: false,
          class: this.$style.paymentTH,
        },
        {
          text: '',
          value: 'paytime',
          sortable: false,
          class: this.$style.paytimeTH,
        },
      ]
    },
  },
  watch: {
    includePaid: 'reset',
    payer: 'reset',
    sequence: 'reset',
  },
  mounted() {
    this.reset()
  },
  methods: {
    reset() {
      this.purchases = this.payer.payingForPurchases.map(
        p => this.$store.state.purchases[p]
      )
      this.purchases = this.purchases.filter(p => !p.unbid)
      if (!this.includePaid)
        this.purchases = this.purchases.filter(p => !p.paymentTimestamp)
      this.$emit(
        'select',
        this.selected.filter(p => this.purchases.includes(p))
      )
    },
  },
}
</script>

<style lang="stylus" module>
.top
  flex 0 1 auto
  overflow-y auto
  margin 16px 0
  height calc(100% - 32px)
.table :global(table.v-table)
  width 100%
  thead tr
    height auto
    &:first-child th:first-child
      padding 4px 16px !important
  & :global(.v-input--selection-controls__input), & :global(.v-icon)
    width 20px
    height 20px
    font-size 20px
.itemTH
  padding 8px 16px 8px 0 !important
  min-width 160px
.bidderTH
  padding 8px 16px !important
  min-width 200px
.amountTH
  padding 8px 16px 8px 0 !important
  text-align right
.paymentTH
  padding 8px 0 !important
  min-width 200px
.paytimeTH
  padding 8px 16px 8px 8px !important
  min-width 100px
  width 100%
</style>
