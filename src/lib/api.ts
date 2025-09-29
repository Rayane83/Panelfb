import axios from 'axios'
import { z } from 'zod'

const API_BASE_URL = '/api/v1'

// Schémas de validation Zod
export const CreateEnterpriseSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  type: z.string().default('SARL'),
  description: z.string().optional(),
  guildId: z.string().min(1, 'Guild ID requis'),
  ownerId: z.string().min(1, 'Owner ID requis')
})

export const DotationEmployeeSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
  grade: z.string().min(1, 'Le grade est requis'),
  run: z.number().min(0, 'RUN doit être positif'),
  facture: z.number().min(0, 'Facture doit être positive'),
  vente: z.number().min(0, 'Vente doit être positive')
})

export const TaxSimulationSchema = z.object({
  baseAmount: z.number().min(0, 'Le montant de base doit être positif'),
  period: z.enum(['mensuel', 'trimestriel', 'annuel']),
  taxType: z.enum(['IS', 'richesse'])
})

export const BlanchimentOperationSchema = z.object({
  statut: z.enum(['En cours', 'Terminé', 'Annulé']),
  dateRecu: z.string().min(1, 'Date de réception requise'),
  dateRendu: z.string().optional(),
  groupe: z.string().optional(),
  employe: z.string().optional(),
  donneur: z.string().optional(),
  recep: z.string().optional(),
  somme: z.number().min(0, 'La somme doit être positive'),
  percEntreprise: z.number().min(0).max(100),
  percGroupe: z.number().min(0).max(100)
})

// Configuration Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('discord_user') || '{}')
  if (user.token) {
    config.headers.Authorization = `Bearer ${user.token}`
  }
  return config
})

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('discord_user')
      window.location.href = '/auth'
    }
    return Promise.reject(error)
  }
)

// API Enterprises
export const enterpriseApi = {
  getAll: () => api.get('/enterprises'),
  getById: (id: string) => api.get(`/enterprises/${id}`),
  create: (data: z.infer<typeof CreateEnterpriseSchema>) => {
    const validated = CreateEnterpriseSchema.parse(data)
    return api.post('/enterprises', validated)
  },
  update: (id: string, data: Partial<z.infer<typeof CreateEnterpriseSchema>>) => 
    api.put(`/enterprises/${id}`, data),
  delete: (id: string) => api.delete(`/enterprises/${id}`)
}

// API Dotations
export const dotationApi = {
  getAll: (enterpriseId: string) => api.get(`/enterprises/${enterpriseId}/dotations`),
  getById: (enterpriseId: string, id: string) => api.get(`/enterprises/${enterpriseId}/dotations/${id}`),
  create: (enterpriseId: string, data: any) => api.post(`/enterprises/${enterpriseId}/dotations`, data),
  update: (enterpriseId: string, id: string, data: any) => 
    api.put(`/enterprises/${enterpriseId}/dotations/${id}`, data),
  archive: (enterpriseId: string, id: string) => 
    api.post(`/enterprises/${enterpriseId}/dotations/${id}/archive`)
}

// API Impôts
export const taxApi = {
  getBrackets: (type: string) => api.get(`/tax-brackets?type=${type}`),
  simulate: (enterpriseId: string, data: z.infer<typeof TaxSimulationSchema>) => {
    const validated = TaxSimulationSchema.parse(data)
    return api.post(`/enterprises/${enterpriseId}/tax-simulations`, validated)
  },
  getSimulations: (enterpriseId: string) => api.get(`/enterprises/${enterpriseId}/tax-simulations`)
}

// API Blanchiment
export const blanchimentApi = {
  getOperations: (enterpriseId: string) => api.get(`/enterprises/${enterpriseId}/blanchiment`),
  saveOperations: (enterpriseId: string, operations: z.infer<typeof BlanchimentOperationSchema>[]) => {
    const validated = operations.map(op => BlanchimentOperationSchema.parse(op))
    return api.post(`/enterprises/${enterpriseId}/blanchiment`, { operations: validated })
  },
  getConfig: (enterpriseId: string) => api.get(`/enterprises/${enterpriseId}/blanchiment/config`),
  updateConfig: (enterpriseId: string, config: any) => 
    api.put(`/enterprises/${enterpriseId}/blanchiment/config`, config)
}

// API Documents
export const documentApi = {
  getAll: (enterpriseId: string) => api.get(`/enterprises/${enterpriseId}/documents`),
  upload: (enterpriseId: string, file: File, metadata: any) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('metadata', JSON.stringify(metadata))
    return api.post(`/enterprises/${enterpriseId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  delete: (enterpriseId: string, id: string) => 
    api.delete(`/enterprises/${enterpriseId}/documents/${id}`),
  download: (enterpriseId: string, id: string) => 
    api.get(`/enterprises/${enterpriseId}/documents/${id}/download`, { responseType: 'blob' })
}

// API Archives
export const archiveApi = {
  getAll: (enterpriseId: string) => api.get(`/enterprises/${enterpriseId}/archives`),
  updateStatus: (enterpriseId: string, id: string, status: string) => 
    api.put(`/enterprises/${enterpriseId}/archives/${id}/status`, { status }),
  update: (enterpriseId: string, id: string, data: any) => 
    api.put(`/enterprises/${enterpriseId}/archives/${id}`, data),
  delete: (enterpriseId: string, id: string) => 
    api.delete(`/enterprises/${enterpriseId}/archives/${id}`)
}

// API Admin
export const adminApi = {
  getSystemStats: () => api.get('/admin/stats'),
  getAllEnterprises: () => api.get('/admin/enterprises'),
  updateEnterpriseStatus: (id: string, status: string) => 
    api.put(`/admin/enterprises/${id}/status`, { status }),
  getTaxBrackets: () => api.get('/admin/tax-brackets'),
  createTaxBracket: (data: any) => api.post('/admin/tax-brackets', data),
  updateTaxBracket: (id: string, data: any) => api.put(`/admin/tax-brackets/${id}`, data),
  deleteTaxBracket: (id: string) => api.delete(`/admin/tax-brackets/${id}`),
  getSystemUsers: () => api.get('/admin/users'),
  updateUserRole: (id: string, role: UserRole) => api.put(`/admin/users/${id}/role`, { role })
}

// API HWIP
export const hwipApi = {
  getDevices: () => api.get('/hwip/devices'),
  authorizeDevice: (deviceId: string) => api.post(`/hwip/devices/${deviceId}/authorize`),
  blockDevice: (deviceId: string) => api.post(`/hwip/devices/${deviceId}/block`),
  revokeDevice: (deviceId: string) => api.post(`/hwip/devices/${deviceId}/revoke`)
}

export default api