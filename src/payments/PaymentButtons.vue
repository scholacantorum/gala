<!--
PaymentButtons show the buttons under the purchases table on the Payments tab.
-->

<template lang="pug">
div(:class="$style.top")
  v-alert(
    :value="error"
    type="error"
    v-text="error"
  )
  div(:class="$style.buttons")
    ChargeCardOnFile(
      :disabled="!allPayable || chargingCardOnFile"
      :payer="payer"
      :purchases="purchases"
      @error="error = $event"
      @processing="chargingCardOnFile = $event"
    )
    ChargeOtherCard(
      :disabled="!allPayable || chargingCardOnFile"
      :payer="payer"
      :purchases="purchases"
      @error="error = $event"
    )
    NonCardPayment(
      :disabled="!allPayable || chargingCardOnFile"
      :payer="payer"
      :purchases="purchases"
      @error="error = $event"
    )
    ChangePayer(
      :disabled="!allPayable || chargingCardOnFile"
      :payer="payer"
      :purchases="purchases"
      @error="error = $event"
    )
</template>

<script>
import ChangePayer from './ChangePayer'
import ChargeCardOnFile from './ChargeCardOnFile'
import ChargeOtherCard from './ChargeOtherCard'
import NonCardPayment from './NonCardPayment'

export default {
  name: 'PaymentButtons',
  components: {
    ChangePayer,
    ChargeCardOnFile,
    ChargeOtherCard,
    NonCardPayment,
  },
  props: {
    payer: { type: Object, required: true },
    purchases: { type: Array, required: true },
  },
  data: () => ({
    error: '',
    chargingCardOnFile: false,
  }),
  computed: {
    allPayable() {
      return (
        this.purchases.length && this.purchases.every(p => !p.paymentTimestamp)
      )
    },
  },
  watch: {
    payer() {
      this.error = ''
    },
  },
}
</script>

<style lang="stylus" module>
.top
  flex 1 0 auto
.buttons
  display flex
  justify-content center
  align-items flex-start
</style>
