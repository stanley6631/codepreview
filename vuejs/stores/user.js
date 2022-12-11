import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { API } from 'aws-amplify'
import axios from 'axios'

export const useUserStore = defineStore('user-store', {
  state: () => ({
    email: useStorage('email', undefined),
    portfolio: useStorage('portfolio', [])
  }),
  getters: {
    getEmail: (state) => state.email,
    getPortfolio: (state) => state.portfolio,
    getProfilePictureId: (state) => {
      if (state.portfolio.portfolioProfilePhotoId) {
        return state.portfolio.portfolioProfilePhotoId
      } else {
        return null
      }
    },
    getTitlePictureId: (state) => {
      if (state.portfolio.portfolioPhotos) {
        return state.portfolio.portfolioPhotos[0].portfolioPhotoId
      } else {
        return null
      }
    }
  },
  actions: {
    setPortfolio(portfolio) {
      this.portfolio = portfolio
    },
    setEmail(email) {
      this.email = email
    },
    setPortfolioTitleUrl(url) {
      this.portfolio.portfolioPhotos[0].portfolioPhotoId = url
    },
    clearState() {
      this.$patch((state) => {
        state.email = undefined
        state.portfolio = []
        state.portfolioPictures = []
      })
    },
    /**
     * @param {string} portfolioEmail
     * @param {string[]} portfolioPhotoIds - array of photo ids (uuids)
     * @param {("thumbnail"|"small"|"medium"|"large")} photosType
     * @typedef {Object} Response
     * @property {("thumbnail"|"small"|"medium"|"large")} Response.photosType - The id of the photo
     * @property {string} Response.portfolioEmail
     * @typedef {Object} PortfolioPhoto
     * @property {string} PortfolioPhoto.portfolioPhotoId - The id of the photo
     * @property {string} PortfolioPhoto.url - The upload url, if photo does not exist it will be null
     * @property {Array<PortfolioPhoto>} Response.portfolioPhotos
     * @returns {Promise<Array<Response>>} - array of upload photos urls
     */
    createPortfolioPhotoDownloadUrls(portfolioEmail, photosType, portfolioPhotoIds) {
      const init = {
        body: { portfolioEmail, photosType, portfolioPhotoIds }
      }
      return API.post('PortfolioApi', '/portfolios/photos/download-url', init)
    },
    /**
     * @param {string[]} portfolioPhotoIds - array of photo ids (uuids)
     * @typedef {Object} ResponseElement
     * @property {string} ResponseElement.portfolioPhotoId - The id of the photo
     * @property {string} ResponseElement.url - The upload url
     * @returns {Promise<Array<ResponseElement>>} - array of upload photos urls
     */
    createPortfolioPhotoUploadUrls(portfolioPhotoIds, idToken) {
      const init = {
        body: { portfolioPhotoIds },
        headers: { Authorization: idToken }
      }
      return API.post('PortfolioApi', '/portfolios/photos/upload-url', init)
    },
    /**
     * @param {string} url - upload url retrieved from createPortfolioPhotoUploadUrls
     * @param {*} file - file to upload
     */
    async createPortfolioPhoto(url, file) {
      const init = { headers: { 'Content-Type': file.type } }
      return axios.put(url, file, init)
    },
    async uploadFile(file, uuid, idToken) {
      const urlRes = await this.createPortfolioPhotoUploadUrls([uuid], idToken)
      const { url } = urlRes[0]
      const toUpload = new File([file], 'profilePicture', { type: file.type })
      await this.createPortfolioPhoto(url, toUpload)
    }
  }
})
