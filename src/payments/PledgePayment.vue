<!--
PledgePayment shows the button, and related dialog, for recording a pledge of
future payment for purchases on the Payments tab.
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
  ) Pledge
  v-form(ref="form" @submit.prevent="onSubmit")
    v-card
      v-card-title.headline(primary-title) Pledge
      v-card-text
        v-text-field(
          v-if="open"
          v-model="paymentDescription"
          label="Pledge Description"
          autofocus
        )
        // The v-if above is required so that autofocus works every time.
        v-switch(
          v-model="thirdParty"
          label="Third party payment (e.g., donor advised fund)"
        )
      v-card-actions
        v-spacer
        v-btn(
          :loading="processing"
          color="indigo" dark
          @click.prevent="onSubmit"
        ) Record Pledge
        v-btn(@click.prevent="onCancel") Cancel
</template>

<script>
export default {
  name: 'PledgePayment',
  props: {
    disabled: { type: Boolean, required: true },
    payer: { type: Object, required: true },
    purchases: { type: Array, required: true },
  },
  data: () => ({
    processing: false,
    open: false,
    paymentDescription: '',
    thirdParty: false,
  }),
  computed: {
    total() {
      return this.purchases.reduce((a, p) => a + p.amount, 0)
    },
  },
  watch: {
    open(n) {
      if (n) this.$emit('error', '')
      this.paymentDescription = this.purchases[0].paymentDescription
      this.thirdParty = this.purchases[0].thirdParty
      this.purchases.forEach(p => {
        if (p.paymentDescription !== this.paymentDescription) this.paymentDescription = ''
      })
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
          pledgeMethod: this.paymentDescription,
          thirdParty: this.thirdParty,
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
