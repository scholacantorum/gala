<!--
ItemTop is the top form on the Item tab, used to add new items and edit existing
ones.
-->

<template lang="pug">
v-card.px-3
  v-layout.justify-center
    span.headline(:class='$style.headline') Item
    v-text-field(
      ref='name',
      v-model='name',
      :class='$style.name',
      :error-messages='nameError',
      label='Name',
      @input='nameChange',
      @keyup.enter='addItem'
    )
    v-text-field(
      ref='amount',
      :value='amount ? amount / 100 : ""',
      :class='$style.amount',
      label='Price',
      mask='#####',
      prefix='$',
      @input='setAmount',
      @keyup.enter='addItem'
    )
    v-text-field(
      ref='value',
      :value='value ? value / 100 : ""',
      :class='$style.value',
      label='Value',
      mask='#####',
      prefix='$',
      @input='setValue',
      @keyup.enter='addItem'
    )
    v-btn.ml-3(color='indigo', dark, @click='saveItem', v-text='item ? "Save" : "Add"')
    v-btn(v-if='!!item', @click='$emit("done")') Cancel
</template>

<script>
export default {
  name: 'ItemTop',
  props: {
    item: Object,
  },
  data: () => ({
    allItems: [],
    amount: 0,
    name: '',
    nameError: [],
    value: 0,
  }),
  watch: {
    '$store.state.sequence': {
      immediate: true,
      handler() {
        this.allItems = Object.values(this.$store.state.items)
      },
    },
    item(n) {
      if (n) {
        this.name = n.name
        this.amount = n.amount
        this.value = n.value
        this.$refs.amount.focus()
      } else {
        this.name = ''
        this.amount = this.value = 0
        this.$refs.name.focus()
      }
    },
  },
  methods: {
    nameChange(n) {
      this.nameError = []
      if (!n) return
      this.allItems.forEach((i) => {
        if (this.item && this.item.id === i.id) return
        if (n === i.name) this.nameError = ['Name already in use.']
      })
    },
    saveItem() {
      if (!this.name || this.nameError.length) {
        this.$refs.name.focus()
        return
      }
      this.$store.dispatch('saveItem', {
        id: this.item ? this.item.id : 0,
        name: this.name,
        amount: this.amount,
        value: this.value,
      })
      this.name = ''
      this.amount = this.value = 0
      this.$refs.name.focus()
      this.$emit('done')
    },
    setAmount(t) {
      const n = parseInt(t)
      if (isNaN(n) || n < 1) this.amount = 0
      else this.amount = n * 100
    },
    setValue(t) {
      const n = parseInt(t)
      if (isNaN(n) || n < 1) this.value = 0
      else this.value = n * 100
    },
  },
}
</script>

<style lang="stylus" module>
.headline
  align-self center
  margin-right 16px
.name
  flex none
  min-width 200px
.amount, .value
  flex none
  margin-left 16px
  width 100px
</style>
