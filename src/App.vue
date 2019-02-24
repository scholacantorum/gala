<template lang="pug">
  v-app(:class="$style.top")
    v-toolbar(app dark dense color="indigo")
      v-tabs(v-if="state === 'ok'" v-model="tab" color="indigo" :class="$style.tabs")
        v-tab(href="#guests") Guests
        v-tab(href="#tables") Tables
        v-tab(href="#items") Items
        v-tab(href="#purchases") Purchases
        v-tab(href="#payments") Payments
      v-spacer
      v-toolbar-title(class="headline")
        img(:src="require('./assets/logo.png')" :class="$style.logo")
        span Schola Cantorum Gala Manager
    v-content(:class="$style.content")
      keep-alive(exclude="Tables")
        Connecting(v-if="state === 'connecting'")
        Disconnected(v-else-if="state === 'disconnected'")
        Failure(v-else-if="state === 'failed'")
        Login(v-else-if="state === 'notLoggedIn'")
        Guests(v-else-if="tab === 'guests'")
        Tables(v-else-if="tab === 'tables'")
        Items(v-else-if="tab === 'items'")
        Purchases(v-else-if="tab === 'purchases'")
        Payments(v-else-if="tab === 'payments'")
</template>

<script>
import Connecting from './Connecting'
import Disconnected from './Disconnected'
import Failure from './Failure'
import Guests from './guests/Guests'
import Items from './items/Items'
import Login from './Login'
import Payments from './payments/Payments'
import Purchases from './purchases/Purchases'
import Tables from './tables/Tables'

export default {
  name: 'App',
  components: {
    Connecting,
    Disconnected,
    Failure,
    Guests,
    Items,
    Login,
    Payments,
    Purchases,
    Tables,
  },
  data() {
    return {
      tab: 'guests',
    }
  },
  computed: {
    state() {
      return this.$store.state.state
    },
  },
}
</script>

<style lang="stylus" module>
.top
  height 100vh
.logo
  margin 0 24px -4px 0
  height 24px
.tabs
  width auto !important
.content
  flex 1 1 auto
.fullHeightTabs, .fullHeightTabs > :global(.v-window__container)
  height 100%
</style>
