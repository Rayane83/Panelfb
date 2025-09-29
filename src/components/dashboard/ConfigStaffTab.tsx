import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Settings, Shield, Users, Database, Globe, Lock, AlertTriangle } from 'lucide-react'

export function ConfigStaffTab() {
  const [systemConfig] = useState({
    maxUsers: 500,
    sessionTimeout: 60,
    backupFrequency: 'daily',
    logLevel: 'info',
    maintenanceMode: false,
    autoBackup: true
  })

  const [permissions] = useState([
    {
      role: 'superadmin',
      level: 6,
      description: 'Accès complet système',
      userCount: 1,
      color: 'bg-red-100 text-red-800'
    },
    {
      role: 'staff',
      level: 5,
      description: 'Administration générale',
      userCount: 3,
      color: 'bg-purple-100 text-purple-800'
    },
    {
      role: 'dot',
      level: 4,
      description: 'Direction fiscale',
      userCount: 2,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      role: 'patron',
      level: 3,
      description: 'Propriétaire entreprise',
      userCount: 8,
      color: 'bg-orange-100 text-orange-800'
    },
    {
      role: 'co_patron',
      level: 2,
      description: 'Co-direction',
      userCount: 12,
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      role: 'employee',
      level: 1,
      description: 'Employé standard',
      userCount: 45,
      color: 'bg-gray-100 text-gray-800'
    }
  ])

  const [systemAlerts] = useState([
    {
      id: '1',
      type: 'Performance',
      message: 'Utilisation mémoire élevée (85%)',
      severity: 'Warning',
      timestamp: '2024-01-20 14:30'
    },
    {
      id: '2',
      type: 'Sécurité',
      message: 'Tentatives de connexion suspectes détectées',
      severity: 'Critical',
      timestamp: '2024-01-20 12:15'
    }
  ])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-800'
      case 'Warning': return 'bg-yellow-100 text-yellow-800'
      case 'Info': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const totalUsers = permissions.reduce((sum, perm) => sum + perm.userCount, 0)

  const stats = [
    {
      title: "Utilisateurs Totaux",
      value: totalUsers.toString(),
      description: "Comptes actifs",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Rôles Configurés",
      value: permissions.length.toString(),
      description: "Niveaux d'accès",
      icon: Shield,
      color: "text-green-600"
    },
    {
      title: "Alertes Actives",
      value: systemAlerts.length.toString(),
      description: "À traiter",
      icon: AlertTriangle,
      color: "text-red-600"
    },
    {
      title: "Uptime Système",
      value: "99.8%",
      description: "Disponibilité",
      icon: Database,
      color: "text-purple-600"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center space-x-3">
            <Settings className="h-8 w-8 text-purple-600" />
            <span>Configuration Staff</span>
          </h2>
          <p className="text-muted-foreground">
            Paramètres système et gestion des permissions avancées
          </p>
        </div>
        <Badge className="bg-purple-100 text-purple-800 px-4 py-2">
          Staff Only
        </Badge>
      </div>

      {/* System Stats */}
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

      {/* System Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Configuration Système</span>
          </CardTitle>
          <CardDescription>
            Paramètres globaux du système
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Limite Utilisateurs Simultanés
                </label>
                <input
                  type="number"
                  value={systemConfig.maxUsers}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Timeout Session (minutes)
                </label>
                <input
                  type="number"
                  value={systemConfig.sessionTimeout}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Fréquence Sauvegarde
                </label>
                <select
                  value={systemConfig.backupFrequency}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                >
                  <option value="hourly">Toutes les heures</option>
                  <option value="daily">Quotidienne</option>
                  <option value="weekly">Hebdomadaire</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Niveau de Log
                </label>
                <select
                  value={systemConfig.logLevel}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                >
                  <option value="debug">Debug</option>
                  <option value="info">Info</option>
                  <option value="warn">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Mode Maintenance</span>
                  <Button 
                    variant={systemConfig.maintenanceMode ? "destructive" : "outline"}
                    size="sm"
                  >
                    {systemConfig.maintenanceMode ? "Activé" : "Désactivé"}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Sauvegarde Auto</span>
                  <Button 
                    variant={systemConfig.autoBackup ? "default" : "outline"}
                    size="sm"
                  >
                    {systemConfig.autoBackup ? "Activé" : "Désactivé"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t">
            <Button className="w-full">
              Sauvegarder Configuration
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Role Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Gestion des Rôles</span>
          </CardTitle>
          <CardDescription>
            Hiérarchie des permissions et répartition des utilisateurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {permissions.map((permission) => (
              <div key={permission.role} className="flex items-center justify-between p-4 border rounded-lg card-hover">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-medium capitalize">{permission.role.replace('_', '-')}</h4>
                    <Badge className={permission.color}>
                      Niveau {permission.level}
                    </Badge>
                    <Badge variant="outline">
                      {permission.userCount} utilisateur{permission.userCount > 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {permission.description}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    Configurer
                  </Button>
                  <Button variant="outline" size="sm">
                    Utilisateurs
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
            Notifications importantes nécessitant une attention
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

      {/* Advanced Tools */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-red-200 bg-red-50 card-hover">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center space-x-2">
              <Lock className="h-5 w-5" />
              <span>Sécurité</span>
            </CardTitle>
            <CardDescription className="text-red-700">
              Outils de sécurité avancés
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant="outline">
              Audit Sécurité
            </Button>
            <Button className="w-full" variant="outline">
              Logs Connexions
            </Button>
            <Button className="w-full" variant="outline">
              Blocage IP
            </Button>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50 card-hover">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Base de Données</span>
            </CardTitle>
            <CardDescription className="text-blue-700">
              Maintenance et optimisation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant="outline">
              Sauvegarde Manuelle
            </Button>
            <Button className="w-full" variant="outline">
              Optimiser Tables
            </Button>
            <Button className="w-full" variant="outline">
              Statistiques DB
            </Button>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50 card-hover">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Maintenance</span>
            </CardTitle>
            <CardDescription className="text-green-700">
              Outils de maintenance système
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant="outline">
              Nettoyer Cache
            </Button>
            <Button className="w-full" variant="outline">
              Redémarrer Services
            </Button>
            <Button className="w-full" variant="outline">
              Rapport Système
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}