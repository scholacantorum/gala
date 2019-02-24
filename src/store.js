import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    state: 'connecting',
    bidderToGuest: {},
    tables: {},
    parties: {},
    guests: {},
    items: {},
    purchases: {},
    sequence: 0,
  },
  mutations: {
    setState(state, s) {
      state.state = s
    },
    mergeData(state, { seq, data }) {
      state.sequence = seq
      ;['tables', 'parties', 'guests', 'items', 'purchases'].forEach(t => {
        if (!data[t]) return
        for (let tid in data[t]) {
          if (!data[t][tid]) Vue.delete(state[t], tid)
          else Vue.set(state[t], tid, data[t][tid])
        }
      })
      if (data.bidderToGuest) state.bidderToGuest = data.bidderToGuest
    },
  },
  actions: {
    async login({ commit, dispatch }, { username, password }) {
      const response = await fetch('/backend/login', {
        method: 'POST',
        body: new URLSearchParams({ username, password }),
      }).catch(e => {
        console.error(e)
        commit('setState', 'failed')
        return null
      })
      if (!response) return false
      switch (response.status) {
        case 204:
          commit('setState', 'connecting')
          dispatch('connect')
          return true
        case 401:
          return false
        default:
          console.error(response.statusText)
          commit('setState', 'failed')
          return false
      }
    },
    async connect({ commit, dispatch }) {
      const response = await fetch('/backend/ping').catch(e => {
        console.error(e)
        commit('setState', 'failed')
        return null
      })
      if (!response) return
      switch (response.status) {
        case 404:
          break
        case 401:
          commit('setState', 'notLoggedIn')
          return
        default:
          console.error(response.statusText)
          commit('setState', 'failed')
          return
      }
      const url = new URL('/backend/ws', location.origin)
      if (url.protocol === 'https:') {
        // Talking to the real server, and Dreamhost's proxy doesn't forward
        // websockets.  So we'll skip the proxy and talk directly to our server
        // on its TLS port.
        url.protocol = 'wss:'
        url.port = 9001
        url.pathname = '/ws'
      } else {
        // Talking to localhost in development.  Stay on same non-TLS port.
        url.protocol = 'ws:'
      }
      const ws = new WebSocket(url)
      ws.onopen = () => {
        dispatch('getAll')
      }
      ws.onerror = e => {
        console.error(e)
        commit('setState', 'failed')
      }
      ws.onclose = () => {
        console.error('web socket closed')
        commit('setState', 'disconnected')
      }
      ws.onmessage = evt => {
        try {
          const data = JSON.parse(evt.data)
          commit('mergeData', data)
        } catch (e) {
          console.error(e)
          commit('setState', 'failed')
        }
      }
    },
    async changePayer({ commit }, { payer, purchases }) {
      const response = await fetch(`/backend/guest/${payer}`, {
        method: 'PUT',
        body: JSON.stringify({ payingForPurchasesAdd: purchases }),
      }).catch(e => {
        console.error(e)
        commit('setState', 'failed')
        return null
      })
      if (!response) return
      switch (response.status) {
        case 204:
          break
        case 400:
          throw new Error(await response.text())
        case 401:
          commit('setState', 'notLoggedIn')
          break
        default:
          console.error(response.statusText)
          commit('setState', 'failed')
      }
    },
    async deleteGuest({ commit }, guestID) {
      const response = await fetch(`/backend/guest/${guestID}`, {
        method: 'DELETE',
      }).catch(e => {
        console.error(e)
        commit('setState', 'failed')
        return null
      })
      if (!response) return
      switch (response.status) {
        case 204:
          break
        case 401:
          commit('setState', 'notLoggedIn')
          break
        default:
          console.error(response.statusText)
          commit('setState', 'failed')
      }
    },
    async deleteItem({ commit }, itemID) {
      const response = await fetch(`/backend/item/${itemID}`, {
        method: 'DELETE',
      }).catch(e => {
        console.error(e)
        commit('setState', 'failed')
        return null
      })
      if (!response) return
      switch (response.status) {
        case 204:
          break
        case 401:
          commit('setState', 'notLoggedIn')
          break
        default:
          console.error(response.statusText)
          commit('setState', 'failed')
      }
    },
    async deletePurchase({ commit }, purchaseID) {
      const response = await fetch(`/backend/purchase/${purchaseID}`, {
        method: 'DELETE',
      }).catch(e => {
        console.error(e)
        commit('setState', 'failed')
        return null
      })
      if (!response) return
      switch (response.status) {
        case 204:
          break
        case 401:
          commit('setState', 'notLoggedIn')
          break
        default:
          console.error(response.statusText)
          commit('setState', 'failed')
      }
    },
    async getAll({ commit }) {
      const response = await fetch('/backend/all').catch(e => {
        console.error(e)
        commit('setState', 'failed')
        return null
      })
      if (!response) return
      switch (response.status) {
        case 200:
          break
        case 401:
          commit('setState', 'notLoggedIn')
          return
        default:
          console.error(response.statusText)
          commit('setState', 'failed')
          return
      }
      const all = await response.json().catch(e => {
        console.error(e)
        commit('setState', 'failed')
        return null
      })
      if (!all) return
      commit('mergeData', all)
      commit('setState', 'ok')
    },
    async payForPurchases({ commit }, data) {
      const response = await fetch('/backend/payments', {
        method: 'POST',
        body: JSON.stringify(data),
      }).catch(e => {
        console.error(e)
        commit('setState', 'failed')
        return null
      })
      if (!response) return
      switch (response.status) {
        case 204:
          break
        case 400:
          throw new Error(await response.text())
        case 401:
          commit('setState', 'notLoggedIn')
          break
        default:
          console.error(response.statusText)
          commit('setState', 'failed')
      }
    },
    async saveGuest({ commit }, guest) {
      const url = guest.id ? `/backend/guest/${guest.id}` : '/backend/guests'
      const method = guest.id ? 'PUT' : 'POST'
      const response = await fetch(url, {
        method,
        body: JSON.stringify(guest),
      }).catch(e => {
        console.error(e)
        commit('setState', 'failed')
        return null
      })
      if (!response) return
      switch (response.status) {
        case 204:
          break
        case 400:
          throw new Error(await response.text())
        case 401:
          commit('setState', 'notLoggedIn')
          break
        default:
          console.error(response.statusText)
          commit('setState', 'failed')
      }
    },
    async saveItem({ commit }, item) {
      const url = item.id ? `/backend/item/${item.id}` : '/backend/items'
      const method = item.id ? 'PUT' : 'POST'
      const response = await fetch(url, {
        method,
        body: JSON.stringify(item),
      }).catch(e => {
        console.error(e)
        commit('setState', 'failed')
        return null
      })
      if (!response) return
      switch (response.status) {
        case 204:
          break
        case 400:
          throw new Error(await response.text())
        case 401:
          commit('setState', 'notLoggedIn')
          break
        default:
          console.error(response.statusText)
          commit('setState', 'failed')
      }
    },
    async saveParty({ commit }, party) {
      const response = await fetch(`/backend/party/${party.id}`, {
        method: 'PUT',
        body: JSON.stringify(party),
      }).catch(e => {
        console.error(e)
        commit('setState', 'failed')
        return null
      })
      if (!response) return
      switch (response.status) {
        case 204:
          break
        case 400:
          throw new Error(await response.text())
        case 401:
          commit('setState', 'notLoggedIn')
          break
        default:
          console.error(response.statusText)
          commit('setState', 'failed')
      }
    },
    async savePositions({ commit }, positions) {
      const response = await fetch(`/backend/table/reposition`, {
        method: 'POST',
        body: JSON.stringify(positions),
      }).catch(e => {
        console.error(e)
        commit('setState', 'failed')
        return null
      })
      if (!response) return
      switch (response.status) {
        case 204:
          break
        case 400:
          throw new Error(await response.text())
        case 401:
          commit('setState', 'notLoggedIn')
          break
        default:
          console.error(response.statusText)
          commit('setState', 'failed')
      }
    },
    async savePurchase({ commit }, purchase) {
      const url = purchase.id
        ? `/backend/purchase/${purchase.id}`
        : '/backend/purchases'
      const method = purchase.id ? 'PUT' : 'POST'
      const response = await fetch(url, {
        method,
        body: JSON.stringify(purchase),
      }).catch(e => {
        console.error(e)
        commit('setState', 'failed')
        return null
      })
      if (!response) return
      switch (response.status) {
        case 204:
          break
        case 400:
          throw new Error(await response.text())
        case 401:
          commit('setState', 'notLoggedIn')
          break
        default:
          console.error(response.statusText)
          commit('setState', 'failed')
      }
    },
    async saveTable({ commit }, table) {
      const response = await fetch(`/backend/table/${table.id}`, {
        method: 'PUT',
        body: JSON.stringify(table),
      }).catch(e => {
        console.error(e)
        commit('setState', 'failed')
        return null
      })
      if (!response) return
      switch (response.status) {
        case 204:
          break
        case 400:
          throw new Error(await response.text())
        case 401:
          commit('setState', 'notLoggedIn')
          break
        default:
          console.error(response.statusText)
          commit('setState', 'failed')
      }
    },
  },
})
export default store
store.dispatch('connect')
