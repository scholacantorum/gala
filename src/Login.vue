<!--
Login displays the login form and processes login requests.
-->

<template lang="pug">
v-container(fluid fill-height)
  v-layout(align-center justify-center)
    v-flex(xs12 sm8 md4)
      v-card(class="elevation-12")
        v-toolbar(dark color="indigo")
          v-toolbar-title Login Required
        v-card-text
          v-form(ref="form")
            v-text-field(
              ref="username"
              v-model="username"
              :rules="usernameRules"
              prepend-icon="person"
              name="username"
              label="User name"
              type="text"
              @keyup.enter="$refs.password.focus()"
            )
            v-text-field(
              ref="password"
              v-model="password"
              :rules="passwordRules"
              id="password"
              prepend-icon="lock"
              name="password"
              label="Password"
              type="password"
              @keyup.enter="submit"
            )
        v-card-actions
          div(v-if="failed" class="red--text subheading") Login incorrect
          v-spacer
          v-btn(color="indigo" class="white--text" @click="submit") Login
</template>

<script>
export default {
  name: 'Login',
  data: () => ({ username: '', password: '', failed: false }),
  computed: {
    usernameRules: () => [
      v => (v.trim() === '' ? 'User name is required.' : true),
    ],
    passwordRules: () => [
      v => (v.trim() === '' ? 'Password is required.' : true),
    ],
  },
  mounted() {
    this.$refs.username.focus()
  },
  methods: {
    async submit() {
      if (!this.$refs.form.validate()) return
      if (
        !(await this.$store.dispatch('login', {
          username: this.username,
          password: this.password,
        }))
      ) {
        this.failed = true
        this.password = ''
        this.$refs.form.resetValidation()
        this.$refs.password.focus()
      }
    },
  },
}
</script>
