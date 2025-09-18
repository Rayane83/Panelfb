import { useAuth } from '../hooks/useAuth'
import { usePermissions } from '../hooks/usePermissions'

interface RoleGateProps {
  children: React.ReactNode
  requiredAccess: string
}

export default function RoleGate({ children, requiredAccess }: RoleGateProps) {
  const { user } = useAuth()
  const { hasPermission } = usePermissions()

  if (!hasPermission(requiredAccess)) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">Accès Refusé</div>
        <p className="text-muted-foreground">
          Vous n'avez pas les permissions nécessaires pour accéder à cette section.
        </p>
        {user?.allGuildRoles && (
          <div className="mt-4 text-xs text-muted-foreground">
            <p>Vos rôles Discord:</p>
            {user.allGuildRoles.map((guildRole, index) => (
              <div key={index}>
                <strong>{guildRole.guildName}:</strong> {guildRole.userRole.roleName} 
                ({guildRole.roles.length} rôles Discord)
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return <>{children}</>
}