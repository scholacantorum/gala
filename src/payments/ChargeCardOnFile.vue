<!--
ChargeCardOnFile shows the button to charge the card-on-file for a set of
purchases on the Payments tab.
-->

<template lang="pug">
v-btn(
  :disabled="disabled || !payer.useCard"
  :loading="processing"
  @click="onCharge"
)
  div(:class="$style.cardOnFile")
    template(v-if="payer.useCard")
      | Charge Card on File
      br
      span(:class="$style.cardNumber" v-text="payer.stripeDescription")
    template(v-else)
      | No Card on File
</template>

<script>
export default {
  name: 'ChargeCardOnFile',
  props: {
    disabled: { type: Boolean, required: true },
    payer: { type: Object, required: true },
    purchases: { type: Array, required: true },
  },
  data: () => ({
    processing: false,
  }),
  computed: {
    total() {
      return this.purchases.reduce((a, p) => a + p.amount, 0)
    },
  },
  watch: {
    processing(n) {
      this.$emit('processing', n)
    },
  },
  methods: {
    async onCharge() {
      this.processing = true
      this.$emit('error', '')
      await this.$store
        .dispatch('payForPurchases', {
          payer: this.payer.id,
          purchases: this.purchases.map(p => p.id),
          stripeSource: this.payer.stripeSource,
          total: this.total,
        })
        .catch(e => {
          this.$emit('error', e.message)
        })
      this.processing = false
    },
  },
}
</script>

<style lang="stylus" module>
.cardOnFile
  line-height 1
.cardNumber
  text-transform none
  font-weight 400
  font-size 12px
</style>
