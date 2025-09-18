import { useAuth } from '../hooks/useAuth'
import { usePermissions } from '../hooks/usePermissions'

interface RoleGateProps {
  children: React.ReactNode
  requiredAccess: string
}

export default function RoleGate({ children, requiredAccess }: RoleGateProps) {
  const { user } = useAuth()
  const { hasPermission } = usePermissions()

  // Mapping des accès aux permissions
  const accessMapping = {
    canAccessDotation: 'dotations',
    canAccessImpot: 'impots',
    canAccessBlanchiment: 'blanchiment',
    canAccessStaffConfig: 'config_staff'
  }

  const permission = accessMapping[requiredAccess as keyof typeof accessMapping]
  
  if (!permission || !hasPermission(permission)) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">Accès Refusé</div>
        <p className="text-muted-foreground">
          Vous n'avez pas les permissions nécessaires pour accéder à cette section.
        </p>
      </div>
    )
  }

  return <>{children}</>
}