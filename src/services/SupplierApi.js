import api from './api'

export const getSuppliers = (params = {}) => {
  return api.get('/supplier', {
    params,
  })
}

export const getGenerateNumber = (data) => {
  return api.get('/supplier/generate-number', data)
}

export const createSupplier = (data) => {
  return api.post('/supplier', data)
}

export const updateSupplier = (id, data) => {
  return api.post(`/supplier/${id}`, data)
}

export const deleteSupplier = (id, data) => {
  return api.delete(`/supplier/${id}`, data)
}
