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
    authToken: '',
  },
  mutations: {
    setAuthToken(state, t) {
      state.authToken = t
    },
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
      const response = await fetch(`${process.env.VUE_APP_BACKEND_URL}/login`, {
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
          commit('setAuthToken', response.headers.get('Auth'))
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
      const response = await fetch(`${process.env.VUE_APP_BACKEND_URL}/ping`, {
        headers: { Auth: store.state.authToken },
      }).catch(e => {
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
      const ws = new WebSocket(
        `${process.env.VUE_APP_WEBSOCKET_URL}?auth=${store.state.authToken}`
      )
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
      const response = await fetch(
        `${process.env.VUE_APP_BACKEND_URL}/guest/${payer}`,
        {
          method: 'PUT',
          body: JSON.stringify({ payingForPurchasesAdd: purchases }),
          headers: { Auth: store.state.authToken },
        }
      ).catch(e => {
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
      const response = await fetch(
        `${process.env.VUE_APP_BACKEND_URL}/guest/${guestID}`,
        {
          method: 'DELETE',
          headers: { Auth: store.state.authToken },
        }
      ).catch(e => {
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
      const response = await fetch(
        `${process.env.VUE_APP_BACKEND_URL}/item/${itemID}`,
        {
          method: 'DELETE',
          headers: { Auth: store.state.authToken },
        }
      ).catch(e => {
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
      const response = await fetch(
        `${process.env.VUE_APP_BACKEND_URL}/purchase/${purchaseID}`,
        {
          method: 'DELETE',
          headers: { Auth: store.state.authToken },
        }
      ).catch(e => {
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
      const response = await fetch(`${process.env.VUE_APP_BACKEND_URL}/all`, {
        headers: { Auth: store.state.authToken },
      }).catch(e => {
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
      const response = await fetch(
        `${process.env.VUE_APP_BACKEND_URL}/payments`,
        {
          method: 'POST',
          body: JSON.stringify(data),
          headers: { Auth: store.state.authToken },
        }
      ).catch(e => {
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
    async pickupPurchase({ commit }, purchaseID) {
      const response = await fetch(
        `${process.env.VUE_APP_BACKEND_URL}/purchase/${purchaseID}/pickup`,
        {
          method: 'POST',
          headers: { Auth: store.state.authToken },
        }
      ).catch(e => {
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
    async saveGuest({ commit }, guest) {
      const url = guest.id
        ? `${process.env.VUE_APP_BACKEND_URL}/guest/${guest.id}`
        : `${process.env.VUE_APP_BACKEND_URL}/guests`
      const method = guest.id ? 'PUT' : 'POST'
      const response = await fetch(url, {
        method,
        body: JSON.stringify(guest),
        headers: { Auth: store.state.authToken },
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
      const url = item.id
        ? `${process.env.VUE_APP_BACKEND_URL}/item/${item.id}`
        : `${process.env.VUE_APP_BACKEND_URL}/items`
      const method = item.id ? 'PUT' : 'POST'
      const response = await fetch(url, {
        method,
        body: JSON.stringify(item),
        headers: { Auth: store.state.authToken },
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
      const response = await fetch(
        `${process.env.VUE_APP_BACKEND_URL}/party/${party.id}`,
        {
          method: 'PUT',
          body: JSON.stringify(party),
          headers: { Auth: store.state.authToken },
        }
      ).catch(e => {
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
      const response = await fetch(
        `${process.env.VUE_APP_BACKEND_URL}/table/reposition`,
        {
          method: 'POST',
          body: JSON.stringify(positions),
          headers: { Auth: store.state.authToken },
        }
      ).catch(e => {
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
        ? `${process.env.VUE_APP_BACKEND_URL}/purchase/${purchase.id}`
        : `${process.env.VUE_APP_BACKEND_URL}/purchases`
      const method = purchase.id ? 'PUT' : 'POST'
      const response = await fetch(url, {
        method,
        body: JSON.stringify(purchase),
        headers: { Auth: store.state.authToken },
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
      const response = await fetch(
        `${process.env.VUE_APP_BACKEND_URL}/table/${table.id}`,
        {
          method: 'PUT',
          body: JSON.stringify(table),
          headers: { Auth: store.state.authToken },
        }
      ).catch(e => {
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
