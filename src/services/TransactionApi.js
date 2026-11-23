import api from './api'

export const getTransactions = (params = {}) => {
  return api.get('/transaction', {
    params,
  })
}

export const createTransaction = (data) => {
  return api.post('/transaction', data)
}

export const getDetailTransaction = (id, data) => {
  return api.get(`/transaction/${id}`, data)
}

export const deleteTransaction = (id, data) => {
  return api.delete(`/transaction/${id}`, data)
}
