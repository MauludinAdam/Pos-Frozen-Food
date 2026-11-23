import api from './api'

export const getProducts = (params = {}) => {
  return api.get('/product', {
    params,
  })
}

export const getProduct = (id) => {
  return api.get(`/product/${id}`)
}

export const createProduct = (data) => {
  return api.post('/product', data)
}

export const generateBarcodeNumber = () => {
  return api.get('/product/generate-code-product')
}

export const updateProduct = (id, data) => {
  return api.post(`/product/${id}`, data)
}

export const deleteProduct = (id, data) => {
  return api.delete(`/product/${id}`, data)
}
