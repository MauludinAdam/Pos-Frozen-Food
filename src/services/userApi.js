import api from './api'

export const getMe = async () => {
  return api.get('/me')
}
