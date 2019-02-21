<!--
Guest displays the Guests tab.
-->

<template lang="pug">
v-container(fluid fill-height)
  v-layout
    GuestList(
      :selected="selected"
      @select="select"
    )
    keep-alive
      GuestPanel(
        v-if="selected || adding"
        :guestID="selected ? selected.id : 0"
        @done="selected = adding = null"
        @dirty="dirty = $event"
      )
      v-btn(
        v-else
        :class="$style.add"
        color="indigo" dark
        @click="addGuest"
      ) Add Guest
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
    select(g) {
      if (!this.dirty) this.selected = g
    },
  },
}
</script>

<style lang="stylus" module>
.add
  flex 1 1 auto
  margin auto 0 auto auto
  max-width 120px
</style>
