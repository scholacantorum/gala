<!--
CardEntry extends Vuetify v-input to contain a Stripe card entry element.  It
emits a 'valid' event when the card entry is changed; the value of the event is
true if the card entry has complete, valid data; false if the card entry has
incomplete or invalid data; and null if the card entry is empty.  CardEntry
provides three directly callable methods:

clear() empties the card entry field and removes any errors

focus() causes the card entry field to take focus

getCardSource(name, email, address, city, state, zip) submits the card entry
to Stripe, with the supplied customer contact information (of which name and
email are required), and gets a source token back.  getCardSource returns a
promise that resolves to the source token string.  (Failures are not expected;
even invalid cards aren't caught at this stage.)
-->

<template lang="pug">
v-input(ref='input', :class='$style.top', :error-messages='errors', :rules='errors')
  div(:class='{ [$style.cardEntryWrapper]: true, [$style.cardEntryFocused]: focused }')
    div(ref='cardEntry', :class='$style.cardEntry')
</template>

<script>
// eslint-disable-next-line
const stripe = Stripe(process.env.VUE_APP_STRIPE_KEY)
const elementParams = {
  hidePostalCode: true,
  style: {
    base: {
      fontFamily: 'Roboto, sans-serif',
      fontSize: '16px',
      lineHeight: '1',
      '::placeholder': {
        color: 'rgba(0,0,0,0.54)',
      },
    },
  },
}

export default {
  name: 'CardEntry',
  data: () => ({
    clearing: false,
    complete: false,
    element: null,
    empty: true,
    entryError: null,
    focused: false,
  }),
  mounted() {
    const elements = stripe.elements()
    this.element = elements.create('card', elementParams)
    this.element.mount(this.$refs.cardEntry)
    this.element.on('focus', this.cardEntryFocus)
    this.element.on('blur', this.cardEntryBlur)
    this.element.on('change', this.cardEntryChange)
  },
  beforeDestroy() {
    this.element.unmount()
  },
  watch: {
    valid(n) {
      this.$emit('valid', n)
    },
  },
  computed: {
    errors() {
      if (this.clearing) return []
      if (this.entryError) return [this.entryError]
      if (!this.empty && !this.complete && !this.focused)
        return ['The card information is not complete.']
      return []
    },
    valid() {
      if (this.complete && !this.entryError) return true
      if (this.empty && !this.entryError) return null
      return false
    },
  },
  methods: {
    cardEntryChange(evt) {
      // Some code outside this component reacts to receiving focus by calling
      // clear().  If the current card entry contents are incomplete when the
      // card entry loses focus, we'll get a change event from the card entry
      // with that error, which would cause us to take focus back.  To avoid
      // this, we're going to ignore change events from the card entry between
      // when clear() is called and when we receive one reflecting an empty
      // card entry.
      if (this.clearing && evt.empty) this.clearing = false
      if (this.clearing) return

      this.complete = evt.complete
      this.empty = evt.empty
      this.entryError = evt.error ? evt.error.message : null
    },
    cardEntryBlur() {
      this.focused = false
    },
    cardEntryFocus() {
      this.focused = true
    },
    clear() {
      if (!this.empty) this.clearing = true
      this.element.clear()
    },
    focus() {
      if (!this.element) return
      this.element.focus()
      this.focused = true
    },
    async getPaymentMethod(name, email, address, city, state, zip) {
      const result = await stripe.createPaymentMethod({
        type: 'card',
        card: this.element,
        billing_details: {
          name,
          email,
          address: {
            line1: address,
            city,
            state,
            postal_code: zip,
            country: 'US',
          },
        },
      })
      if (result.error) throw new Error(result.error.message)
      return result.paymentMethod.id
    },
  },
}
</script>

<style lang="stylus" module>
.top :global(.v-input__control)
  width 100%
.cardEntry
  padding 8px 0
.cardEntryWrapper
  position relative
  flex 1 1 auto
  max-width 380px
  &::before
    position absolute
    bottom -1px
    left 0
    width 100%
    border-top thin solid rgba(0, 0, 0, 0.42)
    content ''
  &::after
    position absolute
    bottom -1px
    left 0
    width 100%
    border-top thin solid rgba(0, 0, 0, 0.87)
    border-bottom thin solid rgba(0, 0, 0, 0.87)
    content ''
    transition 0.3s cubic-bezier(0.25, 0.8, 0.5, 1)
    transform scaleX(0)
.cardEntryFocused
  &::after
    border-color #1976d2
    transform scaleX(1)
</style>
