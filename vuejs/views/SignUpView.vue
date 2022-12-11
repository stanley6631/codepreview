<template>
  <div class="container">
    <div class="login mx-auto">
      <form v-if="!confirmationEmailSent" class="login-form" novalidate @submit.prevent="submit">
        <div class="text-center">
          <h1 class="section-title">{{ $t('registration') }}</h1>
        </div>
        <Input
          holder-class="mb-3"
          label="E-mail"
          input-id="email"
          type="email"
          required
          :validator="v$.form.email"
        />
        <Input
          holder-class="mb-3"
          :label="$t('pass')"
          input-id="password"
          type="password"
          required
          :validator="v$.form.password"
        />
        <div class="mb-5">
          <div class="form-check mb-1">
            <input
              id="termsOfService"
              v-model.trim="v$.form.termsOfService.$model"
              class="form-check-input me-1"
              type="checkbox"
              value=""
              required
            />
            <label class="form-check-label" for="termsOfService">
              <span class="form-check-label-text"
                ><CheckIcon />{{ $t('agreement') }}&nbsp;<a href="#">{{
                  $t('terms_of_service_2')
                }}</a></span
              >
            </label>
          </div>
          <div
            v-for="(error, index) of v$.form.termsOfService.$errors"
            :key="index"
            class="input-errors mt-1"
          >
            <span class="error-msg">{{ error.$message }}</span>
          </div>
          <div class="form-check">
            <input
              id="privacyPolicy"
              v-model.trim="v$.form.privacyPolicy.$model"
              class="form-check-input me-1"
              type="checkbox"
              value=""
              required
            />
            <label class="form-check-label" for="privacyPolicy">
              <span class="form-check-label-text"
                ><CheckIcon />{{ $t('agreement') }}&nbsp;<a href="#">{{
                  $t('privacy_policy_2')
                }}</a></span
              >
            </label>
          </div>
          <div
            v-for="(error, index) of v$.form.privacyPolicy.$errors"
            :key="index"
            class="input-errors mt-1"
          >
            <span class="error-msg">{{ error.$message }}</span>
          </div>
        </div>
        <div class="text-center mb-2">
          <button class="btn btn-primary">
            {{ $t('register') }}
          </button>
        </div>
        <div class="text-center">
          <router-link :to="`/${$i18n.locale}/sign-in`">
            {{ $t('signin') }}
          </router-link>
        </div>
      </form>
      <form v-if="confirmationEmailSent" class="login-form" novalidate @submit.prevent="submitCode">
        <div class="text-center">
          <h1 class="section-title mb-4">{{ $t('registration') }}</h1>
        </div>
        <p class="text-center mb-4">
          {{ $t('confirmation_text') }}
        </p>
        <Input
          holder-class="mb-5"
          :label="$t('confirmation_code')"
          input-id="confirmation"
          type="text"
          :validator="v$.form_confirmation.confirmation"
          required
        />
        <div class="text-center mb-2">
          <button class="btn btn-primary">
            {{ $t('confirm_registration') }}
          </button>
        </div>
        <div class="text-center">
          <a href="" @click.prevent="resendCode">
            {{ $t('resend_code') }}
          </a>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { RouterLink } from 'vue-router'
import useVuelidate from '@vuelidate/core'
import { helpers } from '@vuelidate/validators'
import { required, minLength, email, withI18nMessage } from '@/translations/i18n-validators'
import Input from '@/components/Input.vue'
import CheckIcon from '@/components/icons/IconCheck.vue'
import { Auth } from 'aws-amplify'
import { useToast } from 'vue-toastification'

//check if password contains at least one letter and one number
const passwordCharacters = helpers.regex(/^(?=.*?\d)(?=.*?[a-zA-Z])[a-zA-Z\d]+$/)

const terms = (value) => value
const privacy = (value) => value

export default {
  components: {
    Input,
    CheckIcon
  },
  setup() {
    const toast = useToast()

    return { v$: useVuelidate(), toast }
  },
  data() {
    return {
      form: {
        email: '',
        password: '',
        termsOfService: '',
        privacyPolicy: ''
      },
      form_confirmation: {
        conformation: ''
      },
      confirmationEmailSent: false
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
          required,
          minLength: minLength(6),
          passwordCharacters: withI18nMessage(passwordCharacters)
        },
        termsOfService: {
          terms: withI18nMessage(terms)
        },
        privacyPolicy: {
          privacy: withI18nMessage(privacy)
        }
      },
      form_confirmation: {
        confirmation: {
          required
        }
      }
    }
  },
  methods: {
    //submits first form, basic registration data
    submit() {
      this.v$.form.$touch()

      if (!this.v$.form.$invalid) {
        if (this.form.termsOfService && this.form.privacyPolicy) {
          const loader = document.getElementById('loader')
          const signUp = async (loader) => {
            loader.classList.remove('d-none')

            try {
              const { user } = await Auth.signUp({
                username: this.form.email,
                password: this.form.password,
                attributes: {
                  'custom:privacy_policy': 'AGREED',
                  'custom:terms_of_service': 'AGREED'
                }
              })
              this.confirmationEmailSent = true
              this.toast.info(this.$t('recover_pass_email'))
            } catch (error) {
              switch (error.message) {
                case 'An account with the given email already exists.':
                  this.toast.error(this.$t('emailtaken'))
                  break
                default:
                  this.toast.error(this.$t('somethingwentwrong'))
              }
            }

            await new Promise((resolve, reject) => setTimeout(resolve, 350))
            loader.classList.add('d-none')
          }
          signUp(loader)
        }
      }
    },

    //submits second form, for registration confirmation
    submitCode() {
      const loader = document.getElementById('loader')
      const confirmSignUp = async (loader) => {
        loader.classList.remove('d-none')

        try {
          await Auth.confirmSignUp(this.form.email, this.form_confirmation.confirmation)
          this.toast.success(this.$t('accountcreated'))
          this.$router.push('sign-in')
        } catch (error) {
          switch (error.message) {
            case 'Invalid verification code provided, please try again.':
              this.toast.error(this.$t('invalidcode'))
              break
          }
        }

        await new Promise((resolve, reject) => setTimeout(resolve, 350))
        loader.classList.add('d-none')
      }
      confirmSignUp(loader)
    },

    //confirmation code resend method
    resendCode() {
      const loader = document.getElementById('loader')
      const resendConfirmationCode = async () => {
        loader.classList.remove('d-none')

        try {
          await Auth.resendSignUp(this.form.email)
          this.toast.info(this.$t('coderesent'))
        } catch (err) {
          this.toast.info(this.$t('wrong'))
        }

        await new Promise((resolve, reject) => setTimeout(resolve, 350))
        loader.classList.add('d-none')
      }
      resendConfirmationCode(loader)
    }
  }
}
</script>
