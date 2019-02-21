<!--
PayerList displays the list of payers on the LHS of the Payments tab.
-->

<template lang="pug">
v-layout(column shrink)
  div.headline Payers
  PayerSearch(v-model="search")
  PayerTable(
    :search="search"
    :selected="selected"
    @select="$emit('select', $event)"
  )
</template>

<script>
import PayerSearch from './PayerSearch'
import PayerTable from './PayerTable'

export default {
  name: 'PayerList',
  components: { PayerSearch, PayerTable },
  model: { prop: 'selected', event: 'select' },
  props: {
    selected: Object,
  },
  data: () => ({
    search: '',
  }),
}
</script>
