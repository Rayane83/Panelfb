import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { useAuth } from '../../hooks/useAuth'
import { getCurrentWeek, formatDate } from '../../lib/utils'
import { Badge } from '../ui/badge'
import { Server, Calendar, User, Building } from 'lucide-react'

export function DashboardTab() {
  const { user } = useAuth()

  const stats = [
    {
      title: 'Semaine ISO',
      value: getCurrentWeek(),
      description: 'Semaine courante',
      icon: Calendar
    },
    {
      title: 'Guild ID',
      value: user?.currentGuild?.id || 'Non défini',
      description: user?.currentGuild?.name || 'Aucune guilde sélectionnée',
      icon: Server
    },
    {
      title: 'Rôle',
      value: user?.role || 'Inconnu',
      description: `Niveau ${user?.roleLevel || 0}`,
      icon: User
    },
    {
      title: 'Entreprise',
      value: user?.currentGuild?.name || 'Non assignée',
      description: 'Entreprise courante',
      icon: Building
    }
  ]

  const recentActivities = [
    { action: 'Connexion au système', time: '11:30', date: 'Aujourd\'hui' },
    { action: 'Calcul de salaire', time: '10:15', date: 'Aujourd\'hui' },
    { action: 'Export des données', time: '16:45', date: 'Hier' },
    { action: 'Mise à jour profil', time: '14:20', date: 'Hier' }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Vue d'ensemble de votre activité sur le système Discord Enterprise
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informations Utilisateur</CardTitle>
            <CardDescription>
              Détails de votre compte et permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Nom d'utilisateur:</span>
              <Badge variant="outline">{user?.username}#{user?.discriminator}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Email:</span>
              <span className="text-sm">{user?.email || 'Non renseigné'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Dernière connexion:</span>
              <span className="text-sm">{formatDate(new Date())}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activité Récente</CardTitle>
            <CardDescription>
              Vos dernières actions dans le système
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-2 last:border-b-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.date}</p>
                  </div>
                  <Badge variant="secondary">{activity.time}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}