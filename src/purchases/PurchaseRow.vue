<!--
PurchaseRow displays one row in the purchase table.
-->

<template lang="pug">
tr(:class="$style.top")
  td(:class="$style.item" v-text="itemName")
  td(:class="$style.bidder" v-text="bidder")
  td(:class="$style.name" v-text="guest.name")
  td(:class="$style.amount" v-text="purchase.amount/100")
  td(:class="$style.payer" v-text="payerName")
  td(:class="$style.actions")
    v-btn(
      v-if="!purchase.paymentTimestamp"
      :class="$style.delete"
      color="indigo"
      flat icon
      @click="deletePurchase"
    )
      v-icon(style="font-size:20px") delete
    v-icon(
      v-else
      :class="$style.paid"
      color="green"
    ) credit_card
    v-icon(
      v-if="!purchase.paymentTimestamp && !purchase.haveCard"
      :class="$style.icon"
      color="red"
    ) warning
</template>

<script>
export default {
  name: 'PurchaseRow',
  props: {
    purchase: { type: Object, required: true },
  },
  data: () => ({
    guest: null,
    itemName: '',
    payerName: '',
  }),
  watch: {
    '$store.state.sequence': {
      immediate: true,
      handler: 'reset',
    },
    purchase: 'reset',
  },
  computed: {
    bidder() {
      if (!this.guest.bidder) return ''
      return this.guest.bidder.toString(16).toUpperCase()
    },
    paymentIcon() {
      if (this.purchase.paymentTimestamp) return ['green', 'check_circle']
      if (this.purchase.haveCard) return ['white', 'access_time']
      return ['red', 'warning']
    },
  },
  methods: {
    async deletePurchase() {
      if (
        await this.$confirm(
          `Are you sure you want to delete the purchase of ${
            this.itemName
          } by ${this.guest.name}?`
        )
      )
        this.$store.dispatch('deletePurchase', this.purchase.id)
    },
    reset() {
      if (!this.purchase) return
      this.guest = this.$store.state.guests[this.purchase.guest]
      this.itemName = this.$store.state.items[this.purchase.item].name
      this.payerName = this.$store.state.guests[this.purchase.payer].name
    },
  },
}
</script>

<style lang="stylus" module>
.top
  border-bottom 1px solid rgba(0, 0, 0, 0.12)
$td
  padding-right 24px
  font-size 14px
  line-height 20px
.item
  @extend $td
  padding-left 8px
.bidder
  @extend $td
  padding-right 8px
  text-align right
.name
  @extend $td
.amount
  @extend $td
  text-align right
.payer
  @extend $td
.icon
  margin-left 2px
  vertical-align inherit
  font-size 20px
  line-height 1
.paid
  @extend .icon
  margin-left 26px
.actions
  @extend $td
  padding-right 8px
.delete
  margin 0
  width 24px
  height 24px
</style>
