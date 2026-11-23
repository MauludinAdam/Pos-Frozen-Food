import api from './api'

export const getSatuans = async (params = {}) => {
  return api.get('/satuan', {
    params,
  })
}

export const getSatuanOptions = (data) => {
  return api.get('/satuan', data)
}

export const createSatuans = (data) => {
  return api.post('/satuan', data)
}

export const updateSatuans = (id, data) => {
  return api.put(`/satuan/${id}`, data)
}

export const deleteSatuans = (id, data) => {
  return api.delete(`/satuan/${id}`, data)
}
