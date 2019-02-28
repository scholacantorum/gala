<!--
PurchasesTop is the top form on the Purchases tab, used to add new purchases as
well as to filter the list in the bottom part of the tab.
-->

<template lang="pug">
v-card.px-3
  v-layout.justify-center
    span.headline(:class="$style.headline") Purchases
    v-select(
      ref="item"
      v-model="item"
      :class="$style.item"
      :items="items"
      clearable
      dense
      item-text="name"
      item-value="id"
      label="Item"
      return-object
    )
    v-text-field(
      ref="bidder"
      :class="$style.bidder"
      :error="!!bidderErrors.length"
      :value="bidderNum"
      label="Bidder"
      @input="setBidder"
      @keyup.enter="addPurchase"
    )
    v-text-field(
      :class="$style.bidderName"
      :error-messages="bidderErrors"
      :value="bidderName"
      readonly
      tabindex="-1"
    )
    v-text-field(
      ref="amount"
      :value="amount?amount/100:''"
      :class="$style.amount"
      label="Price"
      mask="####"
      prefix="$"
      @input="setAmount"
      @keyup.enter="addPurchase"
    )
    v-btn.ml-3(
      color="indigo"
      dark
      @click="addPurchase"
    ) Add
</template>

<script>
export default {
  name: 'PurchasesTop',
  data: () => ({
    amount: 0,
    bidder: 0,
    bidderGuest: null,
    item: null,
    items: [],
  }),
  computed: {
    bidderName() {
      return this.bidderGuest ? this.bidderGuest.name : ''
    },
    bidderNum() {
      return this.bidder ? this.bidder.toString(16).toUpperCase() : ''
    },
    bidderErrors() {
      if (!this.bidder || this.bidderGuest) return []
      return ['No such bidder number']
    },
  },
  watch: {
    '$store.state.sequence': {
      immediate: true,
      handler() {
        this.items = Object.values(this.$store.state.items).sort((a, b) =>
          a.name < b.name ? -1 : a.name > b.name ? +1 : 0
        )
        this.calcBidderGuest()
      },
    },
    bidder(n) {
      this.calcBidderGuest()
      this.$emit('bidder', n)
    },
    item(n) {
      if (n) {
        this.$refs.bidder.focus()
        this.$refs.item.blur()
        this.bidder = ''
        this.amount = n.amount || ''
      }
      this.$emit('item', n)
    },
  },
  methods: {
    addPurchase() {
      if (!this.item) {
        this.$refs.item.focus()
        this.$refs.item.activateMenu()
        return
      }
      if (!this.bidderGuest) {
        this.$refs.bidder.focus()
        return
      }
      if (!this.amount) {
        this.$refs.amount.focus()
        return
      }
      this.$store.dispatch('savePurchase', {
        item: this.item.id,
        guest: this.bidderGuest.id,
        amount: this.amount,
      })
      this.bidder = ''
      this.amount = this.item.amount
      this.$refs.bidder.focus()
    },
    calcBidderGuest() {
      this.bidderGuest = null
      if (this.bidder) {
        const gid = this.$store.state.bidderToGuest[this.bidder]
        if (gid) this.bidderGuest = this.$store.state.guests[gid]
      }
    },
    setAmount(t) {
      const n = parseInt(t)
      if (isNaN(n) || n < 1) this.amount = 0
      else this.amount = n * 100
    },
    setBidder(t) {
      const n = parseInt(t, 16)
      if (isNaN(n) || n < 1) this.bidder = 0
      else this.bidder = n
    },
  },
}
</script>

<style lang="stylus" module>
.headline
  align-self center
  margin-right 16px
.item
  flex none
  & :global(.v-select__selection)
    white-space nowrap
    & + input
      width 1px
.bidder
  flex none
  margin-left 16px
  width 60px
  & input
    text-align center
.bidderName
  flex none
  min-width 200px
.amount
  flex none
  margin-left 16px
  width 80px
</style>
