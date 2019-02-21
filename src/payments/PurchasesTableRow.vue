<!--
PurchasesTableRow
-->

<template lang="pug">
tr(:class="$style.top")
  td(:class="$style.checkbox")
    v-checkbox(
      :ripple="false"
      :value="selected"
      primary hide-details
      @change="$emit('select')"
    )
  td(
    :class="$style.item"
    v-text="itemName"
  )
  td(
    :class="$style.bidder"
    v-text="bidderLabel"
  )
  td(
    :class="$style.amount"
    v-text="purchase.amount/100"
  )
  td(:class="$style.payment")
    span(v-if="purchase.paymentTimestamp")
      v-icon(:class="$style.icon" color="green") check_circle
      | {{ purchase.paymentDescription }}
</template>

<script>
export default {
  name: 'PurchasesTableRow',
  props: {
    purchase: { type: Object, required: true },
    selected: { type: Boolean, required: true },
  },
  data: () => ({
    bidder: null,
    itemName: '',
  }),
  computed: {
    bidderLabel() {
      if (!this.bidder) return null
      if (!this.bidder.bidder) return `\u2007\u2007 ${this.bidder.name}`
      if (this.bidder.bidder < 10)
        return `\u2007${this.bidder.bidder} ${this.bidder.name}`
      else return `${this.bidder.bidder} ${this.bidder.name}`
    },
    sequence() {
      return this.$store.state.sequence
    },
  },
  watch: {
    purchase() {
      this.reset()
    },
    sequence() {
      this.reset()
    },
  },
  mounted() {
    this.reset()
  },
  methods: {
    reset() {
      if (!this.purchase) return
      this.bidder = this.$store.state.guests[this.purchase.guest]
      this.itemName = this.$store.state.items[this.purchase.item].name
    },
  },
}
</script>

<style lang="stylus" module>
.top
  user-select none
.checkbox
  padding 4px 16px !important
  height auto !important
.item
  padding 4px 16px 4px 0 !important
  height auto !important
.bidder
  padding 4px 16px 4px 0 !important
  height auto !important
.amount
  padding 4px 16px 4px 0 !important
  height auto !important
  text-align right
.payment
  padding 4px 16px 4px 0 !important
  height auto !important
  line-height 1
.icon
  margin-right 4px
  vertical-align middle
  font-size 20px
</style>
