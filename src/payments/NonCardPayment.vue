<!--
NonCardPayment shows the button, and related dialog, for paying for purchases
with a non-card payment on the Payments tab.
-->

<template lang="pug">
v-dialog(
  v-model="open"
  max-width="600px"
  persistent
)
  v-btn(
    slot="activator"
    :disabled="disabled"
  ) Non-Card Payment
  v-form(ref="form" @submit.prevent="onSubmit")
    v-card
      v-card-title.headline(primary-title) Non-Card Payment
      v-card-text
        v-text-field(
          v-if="open"
          v-model="paymentDescription"
          :rules="[v => !!v || 'Description is required.']"
          hint="e.g. \"Check #12345\""
          label="Payment Description"
          autofocus persistent-hint
        )
        // The v-if above is required so that autofocus works every time.
      v-card-actions
        v-spacer
        v-btn(
          :loading="processing"
          color="indigo" dark
          @click.prevent="onSubmit"
        ) Record Payment
        v-btn(@click.prevent="onCancel") Cancel
</template>

<script>
export default {
  name: 'NonCardPayment',
  props: {
    disabled: { type: Boolean, required: true },
    payer: { type: Object, required: true },
    purchases: { type: Array, required: true },
  },
  data: () => ({
    processing: false,
    open: false,
    paymentDescription: '',
  }),
  computed: {
    total() {
      return this.purchases.reduce((a, p) => a + p.amount, 0)
    },
  },
  watch: {
    open(n) {
      if (n) this.$emit('error', '')
    },
  },
  methods: {
    onCancel() {
      this.open = false
      this.$refs.form.reset()
    },
    async onSubmit() {
      if (!this.$refs.form.validate()) return
      this.processing = true
      await this.$store
        .dispatch('payForPurchases', {
          payer: this.payer.id,
          purchases: this.purchases.map(p => p.id),
          otherMethod: this.paymentDescription,
          total: this.total,
        })
        .catch(e => {
          this.$emit('error', e.message)
          this.error = e.message
        })
      this.open = false
      this.processing = false
      this.$refs.form.reset()
    },
  },
}
</script>
