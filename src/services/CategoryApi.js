import api from './api'

export const getCategories = async (params = {}) => {
  return api.get('/category', {
    params,
  })
}

export const getCategoriesOptions = (data) => {
  return api.get('/category', data)
}

export const createCategories = (data) => {
  return api.post('/category', data)
}

export const updateCategories = (id, data) => {
  return api.post(`/category/${id}`, data)
}

export const deleteCategories = (id, data) => {
  return api.delete(`/category/${id}`, data)
}
