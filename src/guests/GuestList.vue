<!--
GuestList displays the list of guests on the LHS of the Guests tab.
-->

<template lang="pug">
v-layout(column shrink)
  div.headline Guests
  GuestSearch(v-model="search")
  GuestTable(
    :search="search"
    :selected="selected"
    @select="$emit('select', $event)"
  )
</template>

<script>
import GuestSearch from './GuestSearch'
import GuestTable from './GuestTable'

export default {
  name: 'GuestList',
  components: { GuestSearch, GuestTable },
  model: { prop: 'selected', event: 'select' },
  props: {
    selected: Object,
  },
  data: () => ({
    search: '',
  }),
}
</script>
