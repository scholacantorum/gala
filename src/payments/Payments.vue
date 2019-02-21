<!--
Payments displays the Payments tab.
-->

<template lang="pug">
v-container(fluid fill-height)
  v-layout
    PayerList(v-model="selectedPayer")
    PaymentsPanel(v-if="selectedPayer" :payer="selectedPayer")
</template>

<script>
import PayerList from './PayerList'
import PaymentsPanel from './PaymentsPanel'

export default {
  name: 'Payments',
  components: { PayerList, PaymentsPanel },
  data: () => ({
    selectedPayer: null,
  }),
}
</script>
