<template>
  <div class="container">
    <div class="login mx-auto">
      <div class="text-center">
        <h1 class="section-title">{{ $t('signin') }}</h1>
      </div>
      <form class="login-form" novalidate @submit.prevent="submit">
        <Input
          holder-class="mb-3"
          label="E-mail"
          input-id="email"
          type="email"
          required
          :validator="v$.form.email"
        />
        <Input
          holder-class="mb-2"
          :label="$t('pass')"
          input-id="password"
          type="password"
          required
          :validator="v$.form.password"
        />
        <div class="text-end mb-4">
          <router-link :to="`/${$i18n.locale}/pass-recovery`">
            {{ $t('forgotten_pass') }} ?
          </router-link>
        </div>
        <div class="text-center mb-2">
          <button class="btn btn-primary">
            {{ $t('signin') }}
          </button>
        </div>
        <div class="text-center">
          <router-link :to="`/${$i18n.locale}/sign-up`">
            {{ $t('create_account') }}
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { RouterLink } from 'vue-router'
import useVuelidate from '@vuelidate/core'
import Input from '@/components/Input.vue'
import { required, email } from '@/translations/i18n-validators'
import { Auth } from 'aws-amplify'
import { useToast } from 'vue-toastification'

export default {
  components: {
    Input
  },
  setup() {
    return { v$: useVuelidate(), toast: useToast() }
  },
  data() {
    return {
      form: {
        usernameOrEmail: '',
        password: ''
      }
    }
  },
  validations() {
    return {
      form: {
        email: {
          required,
          email
        },
        password: {
          required
        }
      }
    }
  },
  methods: {
    submit() {
      this.v$.form.$touch()
      if (!this.v$.form.$invalid) {
        const signIn = async (username, password) => {
          const loader = document.getElementById('loader')
          loader.classList.remove('d-none')

          try {
            const user = await Auth.signIn(username, password)
          } catch (error) {
            switch (error.message) {
              case 'User does not exist.':
                this.toast.error(this.$t('usernotfound'))
                break
              case 'Incorrect username or password.':
                this.toast.error(this.$t('incorrectsignindata'))
                break
              case 'User is not confirmed.':
                this.toast.error(this.$t('usernotconfirmed'))
                break
              default:
                this.toast.error(this.$t('somethingwentwrong'))
            }
          }

          loader.classList.add('d-none')
        }
        signIn(this.form.email, this.form.password)
      }
    }
  }
}
</script>
