import api from './api'

export const getStockTransaction = (params = {}) => {
  return api.get('/stock-transaction', {
    params,
  })
}

export const detailStockTransaction = (id, data) => {
  return api.get(`/stock-transaction/${id}`, data)
}

export const getGenerateNumberTransaction = (data) => {
  return api.get('/stock-transaction/generate-number-transaction', data)
}

export const createStockTransaction = (data) => {
  return api.post('/stock-transaction', data)
}

export const deleteStockTransaction = (id, data) => {
  return api.delete(`/stock-transaction/${id}`, data)
}
