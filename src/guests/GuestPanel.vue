<!--
GuestPanel displays the RHS of the Guests tab.
-->

<template lang="pug">
v-card(:class="$style.top")
  v-form(
    ref="form"
    :class="$style.form"
    @submit.prevent="submit"
  )
    div(:class="$style.header")
      div.headline(v-text="original ? `Guest: ${original.name}` : 'Add Guest'")
    div(:class="$style.body")
      div(:class="$style.row")
        v-text-field(
          v-model="edited.name"
          :class="$style.lhs"
          :rules="nameRules"
          label="Name"
        )
        v-spacer
        v-text-field(
          :class="$style.bidder"
          :value="bidder"
          label="Bidder"
          tabindex="-1"
          @input="setBidder"
        )
      div(:class="$style.row")
        div(:class="$style.lhs")
          v-text-field(
            v-model="edited.email"
            :rules="emailRules"
            label="Email address"
            validate-on-blur
          )
          v-text-field(
            v-model="edited.phone"
            :rules="phoneRules"
            label="Phone number"
            mask="(###) ###-####"
            return-masked-value
            validate-on-blur
          )
        div(:class="$style.rhs")
          v-text-field(
            ref="address"
            v-model="edited.address"
            :rules="addressRules"
            label="Mailing address"
          )
          div(:class="$style.postal2")
            v-text-field(
              ref="city"
              v-model="edited.city"
              label="City"
            )
            v-text-field(
              ref="state"
              v-model="edited.state"
              :class="$style.state"
              :rules="stateRules"
              label="State"
              mask="AA"
              validate-on-blur
            )
            v-text-field(
              ref="zip"
              v-model="edited.zip"
              :class="$style.zip"
              :rules="zipRules"
              label="ZIP code"
              mask="#####"
              validate-on-blur
            )
      div(:class="$style.row3")
        v-textarea(
          v-model="edited.requests"
          auto-grow
          label="Special requests"
          rows="1"
        )
        v-text-field(
          v-if="!edited.id"
          v-model="edited.ticket"
          :class="$style.ticket"
          hint="If this guest paid for their ticket, enter details here (e.g. \"Check #2345\")."
          label="Ticket purchase details"
        )
          v-tooltip(
            slot="append"
            left
          )
            template(#activator="data")
              v-icon(
                color="blue"
                v-on="data.on"
              ) info
            div(style="max-width:400px")
              | A ticket purchase will be added for this guest, so that the deductible amount shows up on their receipt.
              | If you enter payment details here, the purchase will be marked paid, otherwise it will be left unpaid.
      div(:class="$style.row4")
        div(:class="$style.payment")
          div.subheading Default payment method
          v-radio-group(
            v-model="paymentMethod"
            :class="$style.radiogroup"
          )
            v-radio(label="None" value="none")
            v-layout(
              v-if="edited.stripeDescription"
              align-start
            )
              v-radio(
                :class="$style.radioExtLabel"
                value="saved"
              )
              v-layout(column)
                div(
                  :class="$style.savedCard"
                ) Saved card: {{ edited.stripeDescription }}
                div(
                  v-if="!original.useCard"
                  :class="$style.permissionWarning"
                ) Select this only if the guest has given permission.
            v-layout(align-start)
              v-radio(
                :class="$style.cardEntryRadio"
                value="new"
              )
              CardEntry(
                ref="cardEntry"
                @valid="setCardValid"
              )
            v-layout(
              v-if="!this.payingFor.length"
              align-start
            )
              v-radio(
                :class="$style.radioPayer"
                label="Guest"
                value="guest"
              )
              v-text-field(
                v-model="payerName"
                :class="$style.payer"
                clearable
                hide-details
                placeholder="drag name here"
                readonly
                single-line
                @dragover="dragOver"
                @drop.prevent="dropGuest"
              )
        div(
          v-if="!edited.payer"
          :class="$style.payingFor"
        )
          div.subheading Paying for
          v-text-field(
            v-for="pf in payingFor"
            :key="pf.id"
            :value="pf.name"
            clearable
            hide-details
            readonly
            single-line
            @input="clearPayingFor(pf.id)"
          )
          v-text-field(
            key="0"
            hide-details
            placeholder="drag name here"
            readonly
            single-line
            @dragover="dragOver"
            @drop="dropPayingFor"
          )
    div(:class="$style.buttons")
      v-btn(
        v-if="dirty"
        :loading="processing"
        color="indigo" dark
        @click.prevent="submit"
        v-text="edited.id ? 'Save' : 'Add'"
      )
      v-btn(
        :disabled="processing"
        @click.prevent="cancel"
        v-text="dirty ? 'Cancel' : 'Close'"
      )
</template>

<script>
import CardEntry from '../CardEntry'

const emailRE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
const emptyGuest = {
  id: 0,
  name: '',
  sortname: '',
  bidder: 0,
  party: 0,
  email: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  phone: '',
  requests: '',
  ticket: '',
  useCard: false,
  stripeSource: '',
  stripeDescription: '',
  payer: 0,
  payingFor: [],
  purchases: [],
  payingForPurchases: [],
  allPaid: true,
}

export default {
  name: 'GuestsPanel',
  components: { CardEntry },
  props: {
    guestID: Number,
  },
  data: () => ({
    cardValid: null,
    edited: Object.assign({}, emptyGuest, { payingFor: [] }),
    hasPayer: false,
    original: null,
    payingFor: [],
    payerName: '',
    paymentMethod: 'none',
    processing: false,
  }),
  watch: {
    '$store.state.sequence': { immediate: true, handler: 'reset' },
    dirty(n) {
      this.$emit('dirty', n)
    },
    guestID: 'reset',
    payerName(n) {
      if (!n && this.paymentMethod === 'guest') this.paymentMethod = 'none'
    },
    paymentMethod(n) {
      if (n !== 'new') this.$refs.cardEntry.clear()
      if (n !== 'guest') {
        this.edited.payer = 0
        this.payerName = ''
      }
    },
  },
  computed: {
    addressRules() {
      const t = this
      return [
        () => {
          if (!t.$refs.address) return false
          if (t.$refs.address.isFocused) return false
          if (t.$refs.city.isFocused) return false
          if (t.$refs.state.isFocused) return false
          if (t.$refs.zip.isFocused) return false
          if (
            !t.edited.address &&
            !t.edited.city &&
            !t.edited.state &&
            !t.edited.zip
          )
            return false
          if (
            t.edited.address &&
            t.edited.city &&
            t.edited.state &&
            t.edited.zip
          )
            return false
          return 'Address, city, state, and ZIP code: please provide all of them or none of them.'
        },
      ]
    },
    bidder() {
      if (!this.edited.bidder) return ''
      return this.edited.bidder.toString(16).toUpperCase()
    },
    dirty() {
      if (!this.original) return true
      if (this.original.name !== this.edited.name) return true
      if (this.original.bidder !== this.edited.bidder) return true
      if (this.original.email !== this.edited.email) return true
      if (this.original.address !== this.edited.address) return true
      if (this.original.city !== this.edited.city) return true
      if (this.original.state !== this.edited.state) return true
      if (this.original.zip !== this.edited.zip) return true
      if (this.original.phone !== this.edited.phone) return true
      if (this.original.requests !== this.edited.requests) return true
      if (this.original.ticket !== this.edited.ticket) return true
      if (this.original.payer !== this.edited.payer) return true
      if (this.original.payingFor.length !== this.edited.payingFor.length)
        return true
      for (let i = 0; i < this.original.payingFor.length; i++)
        if (this.original.payingFor[i] !== this.edited.payingFor[i]) return true
      if (this.original.useCard !== (this.paymentMethod === 'saved'))
        return true
      if (this.paymentMethod === 'new') return true
      return false
    },
    emailRules() {
      const rules = [
        v => !v || !!v.match(emailRE) || 'This is not a valid email address.',
      ]
      if (this.paymentMethod === 'new')
        rules.push(
          v => !!v || 'An email address is required when adding a credit card.'
        )
      return rules
    },
    nameRules: () => [v => !!v || 'Guest name is required.'],
    phoneRules: () => [
      v =>
        !v ||
        v.length === 0 ||
        v.length === 14 ||
        'Phone number is incomplete.',
    ],
    stateRules: () => [
      v => !v || v.length === 0 || v.length === 2 || 'Invalid',
    ],
    zipRules: () => [
      v => !v || v.length === 0 || v.length === 5 || 'Invalid ZIP',
    ],
  },
  methods: {
    cancel() {
      this.original = {} // guarantee no match in reset
      this.reset()
      this.$emit('done')
    },
    clearPayingFor(id) {
      this.edited.payingFor = this.edited.payingFor.filter(pf => pf !== id)
      this.payingFor = this.payingFor.filter(pf => pf.id !== id)
    },
    dragOver(evt) {
      if (evt.dataTransfer.types.includes('guestid')) evt.preventDefault()
    },
    dropGuest(evt) {
      let payer = parseInt(evt.dataTransfer.getData('guestid'))
      if (payer === this.edited.id) return
      payer = this.$store.state.guests[payer]
      if (payer.payer) {
        window.alert(
          `${this.edited.name ||
            'This guest'}'s purchases cannot be charged to ${
            payer.name
          } because ${payer.name}'s purchases are already being charged to ${
            this.$store.state.guests[payer.payer].name
          }.`
        )
        return
      }
      this.edited.payer = payer.id
      this.payerName = payer.name
      this.paymentMethod = 'guest'
    },
    dropPayingFor(evt) {
      let payfor = parseInt(evt.dataTransfer.getData('guestid'))
      if (payfor === this.edited.id) return
      if (this.edited.payingFor.some(pf => pf === payfor)) return
      payfor = this.$store.state.guests[payfor]
      if (payfor.payingFor.length) {
        window.alert(
          `${this.edited.name || 'This guest'} cannot pay for ${
            payfor.name
          }'s charges because ${payfor.name} is paying for ${
            this.$store.state.guests[payfor.payingFor[0]].name
          }'s charges.`
        )
        return
      }
      this.edited.payingFor.push(payfor.id)
      this.payingFor.push(payfor)
    },
    reset() {
      const original = this.guestID
        ? this.$store.state.guests[this.guestID]
        : null
      if (original !== this.original) {
        this.original = original
        this.edited = Object.assign({}, original || emptyGuest)
        this.edited.payingFor = this.edited.payingFor.slice()
        // note, not copying purchases or payingForPurchases since this component doesn't care about them.
        if (this.edited.payer) this.paymentMethod = 'guest'
        else if (this.edited.useCard) this.paymentMethod = 'saved'
        else this.paymentMethod = 'none'
      }
      this.payingFor = this.edited.payingFor.map(
        id => this.$store.state.guests[id]
      )
      this.payerName = this.edited.payer
        ? this.$store.state.guests[this.edited.payer].name
        : ''
    },
    setBidder(b) {
      const bidder = parseInt(b, 16)
      this.edited.bidder = !isNaN(bidder) && bidder > 0 ? bidder : 0
    },
    setCardValid(v) {
      this.cardValid = v
      if (v !== null) this.paymentMethod = 'new'
    },
    async submit() {
      if (this.processing) return
      if (!this.$refs.form.validate()) return
      this.processing = true
      this.edited.useCard = this.paymentMethod === 'saved'
      if (this.paymentMethod === 'new')
        this.edited.cardSource = await this.$refs.cardEntry.getCardSource(
          this.edited.name,
          this.edited.email,
          this.edited.address,
          this.edited.city,
          this.edited.state,
          this.edited.zip
        )
      await this.$store.dispatch('saveGuest', this.edited)
      this.processing = false
      this.original = {} // guarantee no match in reset
      this.reset()
      this.$emit('done')
    },
  },
}
</script>

<style lang="stylus" module>
.top
  flex 1 1 auto
  margin-left 24px
.form
  display flex
  flex-direction column
  margin 24px
  height calc(100% - 48px)
.header
  display flex
  flex none
  justify-content space-between
  align-items center
.body
  flex 1 1 auto
.buttons
  display flex
  flex none
  justify-content flex-end
.lhs
  flex none
  width 50%
.rhs
  flex none
  margin-left 32px
  width calc(50% - 32px)
.row
  display flex
.bidder
  @extend .rhs
  max-width 80px
.postal2
  display flex
.state
  flex none
  padding-right 16px
  padding-left 16px
  width 80px
.zip
  flex none
  width 80px
.row3
  display flex
  align-items flex-end
.ticket
  @extend .rhs
.row4
  display flex
.payment
  @extend .lhs
  margin-top 16px
.radiogroup
  margin-top 0
  :global(.v-input__control)
    width 100%
.radioExtLabel
  margin-right 0
.savedCard
  color rgba(0, 0, 0, 0.54)
.cardEntryRadio
  margin 4px 0 0 0
.permissionWarning
  margin-bottom 16px
  color red
  font-size 12px
.radioPayer
  margin 4px 6px 0 0
.payer
  margin-top 0
  padding-top 0
  input::placeholder
    text-align center
.payingFor
  @extend .rhs
  margin-top 16px
</style>
