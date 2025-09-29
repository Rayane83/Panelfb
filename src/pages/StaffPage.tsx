import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { 
  Settings, 
  Users, 
  Shield, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database
} from 'lucide-react'

export function StaffPage() {
  const [staffStats] = useState({
    managedEnterprises: 5,
    activeUsers: 78,
    pendingApprovals: 3,
    systemAlerts: 1
  })

  const [pendingApprovals] = useState([
    {
      id: '1',
      type: 'Nouvelle Entreprise',
      requester: 'Pierre Durand',
      details: 'Création TechStart Solutions',
      date: '2024-01-20',
      priority: 'Haute'
    },
    {
      id: '2',
      type: 'Modification Grade',
      requester: 'Sophie Laurent',
      details: 'Promotion Manager → Directeur',
      date: '2024-01-19',
      priority: 'Moyenne'
    }
  ])

  const [systemAlerts] = useState([
    {
      id: '1',
      type: 'Performance',
      message: 'Utilisation CPU élevée détectée',
      severity: 'Warning',
      timestamp: '2024-01-20 14:30'
    }
  ])

  const stats = [
    {
      title: "Entreprises Gérées",
      value: staffStats.managedEnterprises.toString(),
      description: "Sous supervision",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Utilisateurs Actifs",
      value: staffStats.activeUsers.toString(),
      description: "Connectés aujourd'hui",
      icon: Activity,
      color: "text-green-600"
    },
    {
      title: "Approbations",
      value: staffStats.pendingApprovals.toString(),
      description: "En attente",
      icon: Clock,
      color: "text-orange-600"
    },
    {
      title: "Alertes Système",
      value: staffStats.systemAlerts.toString(),
      description: "À traiter",
      icon: AlertTriangle,
      color: "text-red-600"
    }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Haute': return 'bg-red-100 text-red-800'
      case 'Moyenne': return 'bg-yellow-100 text-yellow-800'
      case 'Basse': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-800'
      case 'Warning': return 'bg-yellow-100 text-yellow-800'
      case 'Info': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center space-x-3">
            <Shield className="h-8 w-8 text-purple-600" />
            <span>Administration Staff</span>
          </h1>
          <p className="text-muted-foreground">
            Gestion des entreprises et supervision système
          </p>
        </div>
        <Badge className="bg-purple-100 text-purple-800 px-4 py-2">
          Staff Access
        </Badge>
      </div>

      {/* Staff Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
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

      {/* Pending Approvals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Approbations en Attente</span>
          </CardTitle>
          <CardDescription>
            Demandes nécessitant une validation staff
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingApprovals.map((approval) => (
              <div key={approval.id} className="flex items-center justify-between p-4 border rounded-lg card-hover">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-medium">{approval.type}</h4>
                    <Badge className={getPriorityColor(approval.priority)}>
                      {approval.priority}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Demandeur: {approval.requester} • 
                    Détails: {approval.details}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Date: {new Date(approval.date).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approuver
                  </Button>
                  <Button variant="outline" size="sm">
                    Rejeter
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Alertes Système</span>
          </CardTitle>
          <CardDescription>
            Notifications système importantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {systemAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg card-hover">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-medium">{alert.type}</h4>
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {alert.message}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {alert.timestamp}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm">
                    Traiter
                  </Button>
                  <Button variant="outline" size="sm">
                    Ignorer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Staff Tools */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-blue-200 bg-blue-50 card-hover">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Gestion Utilisateurs</span>
            </CardTitle>
            <CardDescription className="text-blue-700">
              Administration des comptes utilisateurs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant="outline">
              Liste Utilisateurs
            </Button>
            <Button className="w-full" variant="outline">
              Permissions
            </Button>
            <Button className="w-full" variant="outline">
              Logs Connexions
            </Button>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50 card-hover">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Configuration</span>
            </CardTitle>
            <CardDescription className="text-green-700">
              Paramètres système et entreprises
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant="outline">
              Paramètres Globaux
            </Button>
            <Button className="w-full" variant="outline">
              Templates
            </Button>
            <Button className="w-full" variant="outline">
              Notifications
            </Button>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50 card-hover">
          <CardHeader>
            <CardTitle className="text-purple-800 flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Maintenance</span>
            </CardTitle>
            <CardDescription className="text-purple-700">
              Outils de maintenance système
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant="outline">
              Sauvegarde
            </Button>
            <Button className="w-full" variant="outline">
              Nettoyage
            </Button>
            <Button className="w-full" variant="outline">
              Rapports
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}