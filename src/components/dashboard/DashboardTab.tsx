import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { useAuth } from '../../hooks/useAuth'
import { getCurrentWeek, formatDate } from '../../lib/utils'
import { Badge } from '../ui/badge'
import { Server, Calendar, User, Building, Activity, TrendingUp, Users, Shield } from 'lucide-react'

export function DashboardTab() {
  const { user } = useAuth()

  const stats = [
    {
      title: 'Semaine ISO',
      value: getCurrentWeek(),
      description: 'Semaine courante',
      icon: Calendar,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Guild Active',
      value: user?.currentGuild?.name?.substring(0, 12) + '...' || 'Non définie',
      description: user?.currentGuild?.name || 'Aucune guilde sélectionnée',
      icon: Server,
      color: 'from-purple-500 to-indigo-500'
    },
    {
      title: 'Rôle Système',
      value: user?.role || 'Inconnu',
      description: `Niveau d'accès ${user?.roleLevel || 0}`,
      icon: Shield,
      color: 'from-orange-500 to-red-500'
    },
    {
      title: 'Statut',
      value: 'En ligne',
      description: 'Connecté depuis 2h',
      icon: Activity,
      color: 'from-green-500 to-emerald-500'
    }
  ]

  const recentActivities = [
    { 
      action: 'Connexion au système', 
      time: '11:30', 
      date: 'Aujourd\'hui',
      type: 'login',
      icon: User
    },
    { 
      action: 'Calcul de salaire effectué', 
      time: '10:15', 
      date: 'Aujourd\'hui',
      type: 'calculation',
      icon: TrendingUp
    },
    { 
      action: 'Export des données', 
      time: '16:45', 
      date: 'Hier',
      type: 'export',
      icon: Activity
    },
    { 
      action: 'Mise à jour profil', 
      time: '14:20', 
      date: 'Hier',
      type: 'profile',
      icon: User
    }
  ]

  const quickActions = [
    {
      title: 'Calculer Salaire',
      description: 'Nouveau calcul de paie',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Gérer Équipe',
      description: 'Voir les employés',
      icon: Users,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Rapports',
      description: 'Générer un rapport',
      icon: Activity,
      color: 'from-purple-500 to-indigo-500'
    },
    {
      title: 'Configuration',
      description: 'Paramètres système',
      icon: Shield,
      color: 'from-orange-500 to-red-500'
    }
  ]

  const getAvatarUrl = () => {
    if (user?.avatar) {
      return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
    }
    return `https://cdn.discordapp.com/embed/avatars/${parseInt(user?.discriminator || '0') % 5}.png`
  }

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#5865F2] to-[#4752C4] p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-4">
            <img
              src={getAvatarUrl()}
              alt={user?.username}
              className="w-16 h-16 rounded-full ring-4 ring-white/20"
            />
            <div>
              <h1 className="text-3xl font-bold">
                Bienvenue, {user?.username} !
              </h1>
              <p className="text-white/80 text-lg">
                Tableau de bord Discord Enterprise Management
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
              {user?.currentGuild?.name || 'Aucune guilde'}
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
              Niveau {user?.roleLevel || 0}
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
              {formatDate(new Date())}
            </Badge>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
      </div>

      {/* Stats grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="card-hover border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* User information */}
        <Card className="lg:col-span-2 card-hover">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-primary" />
              <span>Informations Utilisateur</span>
            </CardTitle>
            <CardDescription>
              Détails de votre compte et permissions système
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground">Nom d'utilisateur:</span>
                  <Badge variant="outline" className="font-mono">
                    {user?.username}#{user?.discriminator}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground">Email:</span>
                  <span className="text-sm">{user?.email || 'Non renseigné'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground">Rôle système:</span>
                  <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                    {user?.role || 'Inconnu'}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground">Niveau d'accès:</span>
                  <Badge variant="outline">Niveau {user?.roleLevel || 0}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground">Dernière connexion:</span>
                  <span className="text-sm">{formatDate(new Date())}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground">Guildes:</span>
                  <Badge variant="outline">{user?.guilds?.length || 0}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-primary" />
              <span>Actions Rapides</span>
            </CardTitle>
            <CardDescription>
              Accès direct aux fonctionnalités principales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <button
                    key={index}
                    className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left w-full"
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color} shadow-sm`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{action.title}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-primary" />
            <span>Activité Récente</span>
          </CardTitle>
          <CardDescription>
            Vos dernières actions dans le système
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => {
              const Icon = activity.icon
              return (
                <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.date}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {activity.time}
                  </Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}