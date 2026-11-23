import api from './api'

export const getLaporanTransaction = (params = {}) => {
  return api.get('/transaction-report', {
    params,
  })
}
