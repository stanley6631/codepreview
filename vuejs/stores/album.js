import { defineStore } from 'pinia'
import { API } from 'aws-amplify'
import axios from 'axios'

import {
  AlbumPhotosUploadUrlsDto,
  AlbumPhotosDownloadUrlsOutputDto,
  CreateAlbumInputDto,
  GetAlbumQueryParamsDto,
  GetAlbumsUsageInputDto
} from 'iamphoto-ms-types'

export const useAlbumStore = defineStore('album-store', {
  state: () => ({
    albumId: undefined,
    albumPhotos: []
  }),
  getters: {},
  actions: {
    async createAlbum(description, name, pricePerPhoto, pricePerAlbum, idToken) {
      const body = {
        ...new CreateAlbumInputDto({
          albumDescription: description,
          albumName: name,
          pricePerPhoto: pricePerPhoto,
          pricePerAlbum: pricePerAlbum
        })
      }

      const res = await API.post('AlbumApi', `/album`, {
        headers: { Authorization: idToken },
        body
      })

      this.albumId = res
      return res
    },
    async createUploadUrls(albumPhotoIds, idToken) {
      const body = {
        ...new AlbumPhotosUploadUrlsDto({
          albumId: this.albumId,
          albumPhotoIds: albumPhotoIds
        })
      }

      return await API.post('AlbumApi', `/album/photos/upload-url`, {
        headers: { Authorization: idToken },
        body
      })
    },
    async uploadFiles(files, uploadUrls) {
      uploadUrls.forEach((object, index) => {
        const init = { headers: { 'Content-Type': files[index].type } }
        const toUpload = new File([files[index]], 'albumPicture', { type: files[index].type })
        return axios.put(object.url, toUpload, init)
      })
    },
    async getAllAlbums(email) {
      const portfolioEmail = email
      const albumId = undefined
      let albumIds

      const queryParams = Object.entries({
        ...new GetAlbumQueryParamsDto({
          ...(portfolioEmail && { portfolioEmail }),
          ...(albumId && { albumId })
        })
      })
        .map(([key, value]) => `${key}=${value}`)
        .join('&')

      const listAlbumsRes = await API.get('AlbumApi', `/album?${queryParams}`, {})
      albumIds = listAlbumsRes.map(({ albumId }) => albumId)

      return listAlbumsRes
    }
  }
})
