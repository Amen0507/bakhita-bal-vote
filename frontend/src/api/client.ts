import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      window.location.href = '/admin/login'
    }
    return Promise.reject(error)
  }
)

export default api

// --- Public endpoints ---
export const getPublicSettings = () => api.get('/public/settings')
export const getCandidates = () => api.get('/public/candidates')
export const getDuos = () => api.get('/public/duos')
export const registerCandidate = (data: object) => api.post('/public/candidates', data)
export const registerDuo = (data: object) => api.post('/public/duos', data)
export const submitVote = (data: object) => api.post('/public/votes/', data)
export const getPublicResults = () => api.get('/public/votes/results')

// --- Admin auth ---
export const adminLogin = (username: string, password: string) => {
  const params = new URLSearchParams()
  params.append('username', username)
  params.append('password', password)
  return api.post('/auth/login', params, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
}

// --- Admin endpoints ---
export const getSettings = () => api.get('/admin/settings')
export const updateSettings = (data: object) => api.patch('/admin/settings', data)
export const getAdminCandidates = () => api.get('/admin/candidates')
export const createAdminCandidate = (data: object) => api.post('/admin/candidates', data)
export const deleteAdminCandidate = (id: string) => api.delete(`/admin/candidates/${id}`)
export const getAdminDuos = () => api.get('/admin/duos')
export const createAdminDuo = (data: object) => api.post('/admin/duos', data)
export const deleteAdminDuo = (id: string) => api.delete(`/admin/duos/${id}`)
export const getVoteResults = () => api.get('/admin/votes/results')
