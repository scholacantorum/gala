<!--
Items displays the Items tab.
-->

<template lang="pug">
v-container(fluid fill-height)
  v-layout(column)
    v-flex(shrink)
      ItemsTop(
        :item="editing"
        @done="editing = null"
      )
    v-flex(:class="$style.bottom")
      v-card(:class="$style.card")
        div(:class="$style.tableScroll")
          table(:class="$style.table")
            thead
              tr(:class="$style.heading")
                th(:class="$style.nameTH") Name
                th(:class="$style.priceTH") Price
                th(:class="$style.valueTH") Value
                th(:class="$style.actionsTH")
            tbody
              ItemRow(
                v-for="item in allItems"
                :key="item.id"
                :item="item"
                @edit="editing = item"
              )
</template>

<script>
import ItemRow from './ItemRow'
import ItemsTop from './ItemsTop'

export default {
  name: 'Items',
  components: { ItemRow, ItemsTop },
  data: () => ({
    allItems: [],
    editing: null,
  }),
  watch: {
    '$store.state.sequence': {
      immediate: true,
      handler() {
        this.allItems = Object.values(this.$store.state.items).sort((a, b) =>
          a.name < b.name ? -1 : a.name > b.name ? +1 : 0
        )
      },
    },
  },
}
</script>

<style lang="stylus" module>
.bottom
  display flex
  flex 1 1 0
  flex-direction column
  margin-top 24px
.card
  height 100%
.tableScroll
  overflow-y auto
  margin 16px 0
  height calc(100% - 32px)
.table
  margin 0 auto
  border-collapse collapse
.heading
  height 40px
  border-bottom 1px solid #808080
$th
  padding-right 24px
  color rgba(0, 0, 0, 0.54)
  vertical-align middle
  text-transform uppercase
  font-weight 500
  font-size 12px
  line-height 18px
.nameTH
  @extend $th
  padding-left 8px
  min-width 160px
  text-align left
.priceTH, .valueTH
  @extend $th
  min-width 40px
  text-align right
.actionsTH
  @extend $th
  padding-right 8px
  min-width 56px
</style>
