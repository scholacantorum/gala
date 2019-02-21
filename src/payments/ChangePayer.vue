<!--
ChangePayer shows the button, and related dialog, for changing the payer of one
or more purchases on the Payments tab.
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
  ) Change Payer
  v-form(ref="form" @submit.prevent="onSubmit")
    v-card
      v-card-title.headline(primary-title) Change Payer
      v-card-text
        v-select(
          v-if="open"
          v-model="newPayer"
          :items="possiblePayers"
          :rules="[v => !!v || 'New payer is required.']"
          item-text="sortname"
          label="New Payer"
          autofocus dense return-object
        )
        // The v-if above is required so that autofocus works every time.
      v-card-actions
        v-spacer
        v-btn(
          :loading="processing"
          color="indigo" dark
          @click.prevent="onSubmit"
        ) Change Payer
        v-btn(@click.prevent="onCancel") Cancel
</template>

<script>
export default {
  name: 'ChangePayer',
  props: {
    disabled: { type: Boolean, required: true },
    payer: { type: Object, required: true },
    purchases: { type: Array, required: true },
  },
  data: () => ({
    open: false,
    processing: false,
    newPayer: null,
    possiblePayers: [],
  }),
  watch: {
    '$store.state.sequence': {
      immediate: true,
      handler() {
        this.possiblePayers = Object.values(this.$store.state.guests)
          .filter(g => !!g.bidder)
          .sort((a, b) =>
            a.sortname < b.sortname ? -1 : a.sortname > b.sortname ? +1 : 0
          )
      },
    },
    open(n) {
      if (n) this.$emit('error', '')
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
        .dispatch('changePayer', {
          payer: this.newPayer.id,
          purchases: this.purchases.map(p => p.id),
        })
        .catch(e => {
          this.$emit('error', e.message)
        })
      this.open = false
      this.processing = false
      this.$refs.form.reset()
    },
  },
}
</script>
