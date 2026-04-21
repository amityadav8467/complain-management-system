import api from './api'

export const complaintService = {
  submit: async (formData) => {
    const { data } = await api.post('/complaints', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  getMyComplaints: async (params = {}) => {
    const { data } = await api.get('/complaints/my', { params })
    return data
  },

  getComplaint: async (id) => {
    const { data } = await api.get(`/complaints/${id}`)
    return data
  },

  updateComplaint: async (id, payload) => {
    const { data } = await api.put(`/complaints/${id}`, payload)
    return data
  },

  deleteComplaint: async (id) => {
    const { data } = await api.delete(`/complaints/${id}`)
    return data
  },

  // Admin
  getAllComplaints: async (params = {}) => {
    const { data } = await api.get('/complaints', { params })
    return data
  },

  updateStatus: async (id, status, adminNote) => {
    const { data } = await api.put(`/complaints/${id}/status`, { status, adminNote })
    return data
  },

  assignComplaint: async (id, assignedTo) => {
    const { data } = await api.put(`/complaints/${id}/assign`, { assignedTo })
    return data
  },

  getStats: async () => {
    const { data } = await api.get('/complaints/admin/stats')
    return data
  },
}

export const userService = {
  getAllUsers: async (params = {}) => {
    const { data } = await api.get('/users', { params })
    return data
  },

  updateUser: async (id, payload) => {
    const { data } = await api.put(`/users/${id}`, payload)
    return data
  },

  deleteUser: async (id) => {
    const { data } = await api.delete(`/users/${id}`)
    return data
  },
}
