<!--
ItemRow displays one row in the item table.
-->

<template lang="pug">
tr(:class="$style.top")
  td(:class="$style.name" v-text="item.name")
  td(:class="$style.amount" v-text="item.amount?item.amount/100:''")
  td(:class="$style.value" v-text="item.value/100")
  td(:class="$style.actions")
    v-btn(
      :class="$style.icon"
      color="indigo"
      flat icon
      @click="$emit('edit')"
    )
      v-icon(style="font-size:20px") edit
    v-btn(
      v-if="!item.purchases.length"
      :class="$style.icon"
      color="indigo"
      flat icon
      @click="deleteItem"
    )
      v-icon(style="font-size:20px") delete
</template>

<script>
export default {
  name: 'ItemRow',
  props: {
    item: { type: Object, required: true },
  },
  methods: {
    async deleteItem() {
      if (
        await this.$confirm(
          `Are you sure you want to delete "${this.item.name}"?`
        )
      )
        this.$store.dispatch('deleteItem', this.item.id)
    },
  },
}
</script>

<style lang="stylus" module>
.top
  border-bottom 1px solid rgba(0, 0, 0, 0.12)
$td
  padding-right 24px
  font-size 14px
  line-height 20px
.name
  @extend $td
  padding-left 8px
.amount, .value
  @extend $td
  text-align right
.actions
  @extend $td
  padding-right 8px
.icon
  margin 0
  width 24px
  height 24px
</style>
