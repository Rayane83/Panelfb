import { useAuth } from './useAuth'

const PERMISSIONS_MATRIX = {
  employee: {
    dashboard: true,
    dotations: false,
    impots: false,
    blanchiment: false,
    archives: false,
    documents: false,
    comptabilite: false,
    salaires: false,
    qualifications: false,
    config_staff: false,
    company_config: false,
    superadmin: false,
    hwip_admin: false
  },
  co_patron: {
    dashboard: true,
    dotations: true,
    impots: true,
    blanchiment: true,
    archives: true,
    documents: true,
    comptabilite: true,
    salaires: true,
    qualifications: true,
    config_staff: false,
    company_config: false,
    superadmin: false,
    hwip_admin: false
  },
  patron: {
    dashboard: true,
    dotations: true,
    impots: true,
    blanchiment: true,
    archives: true,
    documents: true,
    comptabilite: true,
    salaires: true,
    qualifications: true,
    config_staff: false,
    company_config: true,
    superadmin: false,
    hwip_admin: false
  },
  dot: {
    dashboard: true,
    dotations: false,
    impots: true,
    blanchiment: false,
    archives: false,
    documents: true,
    comptabilite: false,
    salaires: false,
    qualifications: false,
    config_staff: false,
    company_config: false,
    superadmin: false,
    hwip_admin: false
  },
  staff: {
    dashboard: true,
    dotations: true,
    impots: true,
    blanchiment: true,
    archives: true,
    documents: true,
    comptabilite: true,
    salaires: true,
    qualifications: true,
    config_staff: true,
    company_config: true,
    superadmin: true,
    hwip_admin: true
  },
  superadmin: {
    dashboard: true,
    dotations: true,
    impots: true,
    blanchiment: true,
    archives: true,
    documents: true,
    comptabilite: true,
    salaires: true,
    qualifications: true,
    config_staff: true,
    company_config: true,
    superadmin: true,
    hwip_admin: true
  }
}

export function usePermissions() {
  const { user } = useAuth()
  
  const hasPermission = (permission: keyof typeof PERMISSIONS_MATRIX.employee): boolean => {
    if (!user) return false
    return PERMISSIONS_MATRIX[user.role]?.[permission] ?? false
  }

  const canAccessRoute = (route: string): boolean => {
    switch (route) {
      case '/':
        return hasPermission('dashboard')
      case '/patron-config':
        return hasPermission('company_config')
      case '/superadmin':
        return hasPermission('superadmin')
      case '/staff':
        return hasPermission('config_staff')
      case '/hwip-admin':
        return hasPermission('hwip_admin')
      default:
        return true
    }
  }

  return { hasPermission, canAccessRoute }
}