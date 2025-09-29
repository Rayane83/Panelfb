import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { useAuth } from '../../hooks/useAuth'
import { 
  Building, 
  Users, 
  TrendingUp, 
  FileText, 
  Calendar,
  Shield,
  Globe,
  Clock
} from 'lucide-react'

export function DashboardTab() {
  const { user } = useAuth()

  const getWeekNumber = () => {
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 1)
    const diff = now.getTime() - start.getTime()
    const oneWeek = 1000 * 60 * 60 * 24 * 7
    return Math.floor(diff / oneWeek) + 1
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin': return 'bg-red-500'
      case 'staff': return 'bg-purple-500'
      case 'dot': return 'bg-blue-500'
      case 'patron': return 'bg-orange-500'
      case 'co_patron': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'superadmin': return 'SuperAdmin'
      case 'staff': return 'Staff'
      case 'dot': return 'DOT'
      case 'patron': return 'Patron'
      case 'co_patron': return 'Co-Patron'
      case 'employee': return 'Employé'
      default: return role
    }
  }

  const stats = [
    {
      title: "Entreprises",
      value: "3",
      description: "Entreprises gérées",
      icon: Building,
      color: "text-blue-600"
    },
    {
      title: "Employés",
      value: "45",
      description: "Effectif total",
      icon: Users,
      color: "text-green-600"
    },
    {
      title: "CA Total",
      value: "€125,000",
      description: "Chiffre d'affaires",
      icon: TrendingUp,
      color: "text-purple-600"
    },
    {
      title: "Documents",
      value: "28",
      description: "Fichiers stockés",
      icon: FileText,
      color: "text-orange-600"
    }
  ]

  const quickActions = [
    {
      title: "Dotations",
      description: "Gérez vos dotations et calculs salariaux",
      color: "border-green-200 bg-green-50",
      textColor: "text-green-800"
    },
    {
      title: "Impôts",
      description: "Calculs fiscaux et simulations",
      color: "border-blue-200 bg-blue-50",
      textColor: "text-blue-800"
    },
    {
      title: "Administration",
      description: "Gestion système et configuration",
      color: "border-purple-200 bg-purple-50",
      textColor: "text-purple-800"
    }
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <Shield className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                Bienvenue, {user?.username} !
              </h1>
              <p className="text-white/80 text-lg">
                Discord Enterprise Management System
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-5 w-5" />
                <span className="font-medium">Semaine ISO</span>
              </div>
              <div className="text-2xl font-bold">Semaine {getWeekNumber()}</div>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
              <div className="flex items-center space-x-2 mb-2">
                <Globe className="h-5 w-5" />
                <span className="font-medium">Guild Active</span>
              </div>
              <div className="text-lg font-semibold truncate">
                {user?.currentGuild?.name || 'Aucune'}
              </div>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-5 w-5" />
                <span className="font-medium">Rôle</span>
              </div>
              <Badge className={`${getRoleBadgeColor(user?.role || '')} text-white`}>
                Niv.{user?.roleLevel} {getRoleLabel(user?.role || '')}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-3">
        {quickActions.map((action, index) => (
          <Card key={index} className={`${action.color} border card-hover`}>
            <CardHeader>
              <CardTitle className={`${action.textColor} flex items-center space-x-2`}>
                <span>{action.title}</span>
              </CardTitle>
              <CardDescription className={action.textColor}>
                {action.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Informations Système</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Utilisateur Discord</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>ID: {user?.id}</p>
                <p>Username: {user?.username}#{user?.discriminator}</p>
                <p>Niveau d'accès: {user?.roleLevel}/6</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Guildes Configurées</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                {user?.guilds?.map((guild, index) => (
                  <p key={index}>
                    {guild.name} ({guild.id})
                  </p>
                )) || <p>Aucune guilde configurée</p>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}