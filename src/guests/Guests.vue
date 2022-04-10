<!--
Guest displays the Guests tab.
-->

<template lang="pug">
v-container(fluid, fill-height)
  v-layout
    GuestList(:selected='selected', @select='select')
    keep-alive
      GuestPanel(
        v-if='selected || adding',
        :guestID='selected ? selected.id : 0',
        @done='selected = adding = null',
        @dirty='dirty = $event'
      )
      div(v-else, :class='$style.buttons')
        v-btn(color='indigo', dark, @click='addGuest') Add Guest
        v-btn(color='indigo', dark, @click='checkinForms') Check-In Forms
        v-btn(color='indigo', dark, @click='programLabels') Program Labels
        v-btn(color='indigo', dark, @click='exportPurchases') Export Purchases
        v-btn(color='indigo', dark, @click='renderReceipts') Print Receipts
</template>

<script>
import GuestList from './GuestList'
import GuestPanel from './GuestPanel'

export default {
  name: 'Guests',
  components: { GuestList, GuestPanel },
  data: () => ({
    adding: false,
    dirty: false,
    selected: null,
  }),
  methods: {
    addGuest() {
      this.adding = true
    },
    checkinForms() {
      location.href = `${process.env.VUE_APP_BACKEND_URL
        }/guests/checkin-forms?auth=${this.$store.state.authToken}`
    },
    programLabels() {
      location.href = `${process.env.VUE_APP_BACKEND_URL
        }/guests/program-labels?auth=${this.$store.state.authToken}`
    },
    exportPurchases() {
      location.href = `${process.env.VUE_APP_BACKEND_URL
        }/purchases/export?auth=${this.$store.state.authToken}`
    },
    renderReceipts() {
      window.open(
        `${process.env.VUE_APP_BACKEND_URL}/guests/receipts?auth=${this.$store.state.authToken
        }`,
        '_blank'
      )
    },
    select(g) {
      if (!this.dirty) this.selected = g
    },
  },
}
</script>

<style lang="stylus" module>
.buttons
  display flex
  flex 1 1 auto
  flex-direction column
  margin auto 0 auto auto
  max-width 200px
</style>
