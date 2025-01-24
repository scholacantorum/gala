<!--
PaymentsPanel displays the RHS of the Payments tab.
-->

<template lang="pug">
v-card(:class="$style.top")
  div(:class="$style.column")
    div(:class="$style.header")
      div.headline Payer: {{ payer.name }}
      v-switch(
        v-model="includePaid"
        :class="$style.includePaid"
        hide-details
        label="Include paid purchases"
      )
    PurchasesTable(v-model="selected" :payer="payer" :includePaid="includePaid")
    div(v-if="payer.notes" :class="$style.notes" v-text="payer.notes")
    PaymentButtons(:payer="payer" :purchases="selected")
</template>

<script>
import PaymentButtons from './PaymentButtons'
import PurchasesTable from './PurchasesTable'

export default {
  name: 'PaymentsPanel',
  components: { PaymentButtons, PurchasesTable },
  props: {
    payer: { type: Object, required: true },
  },
  data: () => ({
    includePaid: true,
    selected: [],
  }),
  watch: {
    '$store.state.sequence': 'reset',
    payer: {
      immediate: true,
      handler: 'reset',
    },
  },
  methods: {
    reset() {
      this.includePaid = this.payer.payingForPurchases.every(
        pid => !!this.$store.state.purchases[pid].paymentTimestamp
      )
    },
  },
}
</script>

<style lang="stylus" module>
.top
  flex 1 1 auto
  margin-left 24px
.column
  display flex
  flex-direction column
  justify-content flex-start
  margin 24px
  height calc(100% - 48px)
.header
  display flex
  justify-content space-between
  align-items center
.includePaid
  flex none
  margin-top 0
.notes
  margin-bottom 12px
  white-space pre-wrap
.notes::before
  content 'Payer notes: '
  font-weight bold
</style>
