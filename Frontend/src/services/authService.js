import api from './api'

export const authService = {
  register: async (name, email, password, phone, address) => {
    const { data } = await api.post('/auth/register', { name, email, password, phone, address })
    return data
  },

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    return data
  },

  adminLogin: async (email, password) => {
    const { data } = await api.post('/auth/admin-login', { email, password })
    return data
  },

  getMe: async () => {
    const { data } = await api.get('/auth/me')
    return data
  },
}
