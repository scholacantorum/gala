const tableWidth = 2 + 4 + 1 + 16 + 150 + 1 + 4 + 2
const tableMargin = 8
const maxWidth = 1280

function overlaps(r1, r2) {
  if (r1.x >= r2.x + r2.w || r2.x >= r1.x + r1.w) return false
  if (r1.y >= r2.y + r2.h || r2.y >= r1.y + r1.h) return false
  return true
}

function placeTable(region, regions) {
  region.x = 0
  region.y = 0
  let minY = 10000
  let floor = 0
  let overlapped = true
  while (overlapped) {
    overlapped = false
    for (let i = 0; i < regions.length; i++) {
      if (overlaps(region, regions[i])) {
        region.x = regions[i].x + regions[i].w
        const bottom = regions[i].y + regions[i].h
        if (bottom > floor) minY = Math.min(minY, bottom)
        if (region.x + region.w > maxWidth) {
          region.x = 0
          region.y = minY
          floor = minY
          minY = 10000
        }
        overlapped = true
        break
      }
    }
  }
  regions.push(region)
}

export default {
  mounted() {
    const regions = []
    let toplace = []
    this.tables.forEach(t => {
      const region = {
        w: tableWidth + 2 * tableMargin,
        h: this.tableHeight(t) + 2 * tableMargin,
      }
      if (t.x || t.y) {
        region.x = t.x - tableMargin
        region.y = t.y - tableMargin
        regions.push(region)
      } else {
        region.t = t
        toplace.push(region)
      }
    })
    if (!toplace.length) return
    toplace = toplace.sort((a, b) => {
      const ap = this.$store.state.parties[a.t.parties[0]]
      const bp = this.$store.state.parties[b.t.parties[0]]
      const ag = this.$store.state.guests[ap.guests[0]]
      const bg = this.$store.state.guests[bp.guests[0]]
      return ag.sortname < bg.sortname ? -1 : ag.sortname > bg.sortname ? +1 : 0
    })
    toplace.forEach(r => {
      placeTable(r, regions)
    })
    this.$store.dispatch(
      'savePositions',
      toplace.map(r => ({
        id: r.t.id,
        x: r.x + tableMargin,
        y: r.y + tableMargin,
      }))
    )
  },
  methods: {
    tableHeight(table) {
      let height = 2 + 16 + 4 + /* parties + */ 4 + 2
      table.parties.forEach(pid => {
        const party = this.$store.state.parties[pid]
        height += 19 * party.guests.length // 18 name, 1 top border
        height += 1 // bottom border
      })
      return height
    },
  },
}
