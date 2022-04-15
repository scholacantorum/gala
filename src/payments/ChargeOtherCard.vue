<!--
ChargeOtherCard shows the button, and related dialog, for paying for purchases
with a credit card other than the one on file for the payer.
-->

<template lang="pug">
v-dialog(v-model='open', max-width='600px', persistent)
  v-btn(slot='activator', :disabled='disabled') Charge Other Card
  v-form(ref='form', @submit.prevent='onSubmit')
    v-card
      v-card-title.headline(primary-title) Charge Other Card
      v-card-text
        v-radio-group(v-model='which', :class='$style.radiogroup')
          v-layout(column)
            v-layout(v-if='payer.stripeDescription', :class='$style.savedRow')
              v-radio(value='saved')
              div
                div Card from previous Schola online purchase: {{ payer.stripeDescription }}
                div(v-if='payer.useCard', :class='$style.permission') (Approved for use for gala purchases.)
                div(v-else, :class='$style.noPermission') Select this only if {{ payer.name }} has personally told you to use this card.
            v-layout(align-start)
              v-radio(v-if='payer.stripeDescription', :class='$style.newRadio', value='new')
              CardEntry(ref='cardEntry', @valid='cardValid = $event')
      v-card-actions
        v-spacer
        v-btn(:loading='processing', color='indigo', dark, @click.prevent='onSubmit') Charge Card
        v-btn(@click.prevent='onCancel') Cancel
</template>

<script>
import CardEntry from '../CardEntry'

export default {
  name: 'ChargeOtherCard',
  components: { CardEntry },
  props: {
    disabled: { type: Boolean, required: true },
    payer: { type: Object, required: true },
    purchases: { type: Array, required: true },
  },
  data: () => ({
    cardValid: null,
    open: false,
    processing: false,
    which: 'new',
  }),
  computed: {
    total() {
      return this.purchases.reduce((a, p) => a + p.amount, 0)
    },
  },
  watch: {
    cardValid(n) {
      if (n !== null) this.which = 'new'
    },
    open(n) {
      if (n) {
        this.$nextTick(function () {
          this.$refs.cardEntry.focus()
        })
        this.$emit('error', '')
      }
    },
    which(n) {
      if (n === 'new') this.$refs.cardEntry.focus()
      if (n === 'saved') this.cardEntry = false
    },
  },
  methods: {
    onCancel() {
      this.open = false
      this.which = 'new'
      this.$refs.cardEntry.clear()
    },
    async onSubmit() {
      let cardSource, stripeSource
      if (this.which === 'new') {
        if (!this.cardValid) return
        this.processing = true
        cardSource = await this.$refs.cardEntry
          .getPaymentMethod(
            this.payer.name,
            this.payer.email,
            this.payer.address,
            this.payer.city,
            this.payer.state,
            this.payer.zip
          )
          .catch((err) => {
            this.processing = false
            this.$emit('error', err.toString())
            this.open = false
            throw err
          })
        if (!cardSource) return
      } else {
        stripeSource = this.payer.stripeSource
      }
      this.processing = true
      await this.$store
        .dispatch('payForPurchases', {
          payer: this.payer.id,
          purchases: this.purchases.map((p) => p.id),
          cardSource,
          stripeSource,
          total: this.total,
        })
        .catch((e) => {
          this.$emit('error', e.message)
        })
      this.open = false
      this.processing = false
      this.which = 'new'
      this.$refs.cardEntry.clear()
    },
  },
}
</script>

<style lang="stylus" module>
.radiogroup > :global(.v-input__control)
  flex 1 1 auto
.savedRow
  align-items flex-start
  margin-bottom 16px
.permission
  color rgba(0, 0, 0, 0.54)
  font-size 12px
.noPermission
  color red
  font-size 12px
.newRadio
  margin-top 5px // to align with card entry text
</style>
