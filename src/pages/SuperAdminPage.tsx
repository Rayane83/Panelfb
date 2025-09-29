import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { 
  Shield, 
  Building, 
  Users, 
  Settings, 
  TrendingUp,
  AlertTriangle,
  Database,
  Globe,
  Lock,
  Activity
} from 'lucide-react'

export function SuperAdminPage() {
  const [systemStats] = useState({
    totalEnterprises: 12,
    totalUsers: 156,
    activeOperations: 23,
    systemHealth: 98
  })

  const [enterprises] = useState([
    {
      id: '1',
      name: 'FlashbackFA Enterprise',
      owner: 'Jean Dupont',
      employees: 15,
      status: 'Actif',
      lastActivity: '2024-01-20'
    },
    {
      id: '2',
      name: 'TechCorp Solutions',
      owner: 'Marie Martin',
      employees: 8,
      status: 'Actif',
      lastActivity: '2024-01-19'
    }
  ])

  const [taxBrackets] = useState([
    { id: '1', type: 'IS', min: 0, max: 42500, rate: 15 },
    { id: '2', type: 'IS', min: 42500, max: 250000, rate: 25 },
    { id: '3', type: 'IS', min: 250000, max: null, rate: 31 }
  ])

  const stats = [
    {
      title: "Entreprises",
      value: systemStats.totalEnterprises.toString(),
      description: "Total actives",
      icon: Building,
      color: "text-blue-600"
    },
    {
      title: "Utilisateurs",
      value: systemStats.totalUsers.toString(),
      description: "Comptes actifs",
      icon: Users,
      color: "text-green-600"
    },
    {
      title: "Opérations",
      value: systemStats.activeOperations.toString(),
      description: "En cours",
      icon: Activity,
      color: "text-purple-600"
    },
    {
      title: "Santé Système",
      value: `${systemStats.systemHealth}%`,
      description: "Performance",
      icon: TrendingUp,
      color: "text-orange-600"
    }
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center space-x-3">
            <Shield className="h-8 w-8 text-red-600" />
            <span>Administration Système</span>
          </h1>
          <p className="text-muted-foreground">
            Gestion globale du système et surveillance des entreprises
          </p>
        </div>
        <Badge className="bg-red-100 text-red-800 px-4 py-2">
          SuperAdmin Access
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

      {/* Enterprise Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>Gestion des Entreprises</span>
          </CardTitle>
          <CardDescription>
            Surveillance et administration de toutes les entreprises
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {enterprises.map((enterprise) => (
              <div key={enterprise.id} className="flex items-center justify-between p-4 border rounded-lg card-hover">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-medium">{enterprise.name}</h4>
                    <Badge className="bg-green-100 text-green-800">{enterprise.status}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Propriétaire: {enterprise.owner} • 
                    Employés: {enterprise.employees} • 
                    Dernière activité: {new Date(enterprise.lastActivity).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    Détails
                  </Button>
                  <Button variant="outline" size="sm">
                    Configurer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tax Brackets Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Configuration Fiscale</span>
          </CardTitle>
          <CardDescription>
            Gestion des tranches fiscales système
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Tranches Impôt sur les Sociétés (IS)</h4>
              <Button size="sm">Ajouter Tranche</Button>
            </div>
            {taxBrackets.map((bracket) => (
              <div key={bracket.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <span className="font-medium">
                    {formatCurrency(bracket.min)} - {bracket.max ? formatCurrency(bracket.max) : 'et plus'}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-bold text-blue-600">{bracket.rate}%</span>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">Modifier</Button>
                    <Button variant="outline" size="sm">Supprimer</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Configuration */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Base de Données</span>
            </CardTitle>
            <CardDescription className="text-blue-700">
              Gestion et maintenance de la base de données
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant="outline">
              Sauvegarder DB
            </Button>
            <Button className="w-full" variant="outline">
              Optimiser Tables
            </Button>
            <Button className="w-full" variant="outline">
              Logs Système
            </Button>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center space-x-2">
              <Lock className="h-5 w-5" />
              <span>Sécurité</span>
            </CardTitle>
            <CardDescription className="text-red-700">
              Gestion de la sécurité et des accès
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant="outline">
              Audit Sécurité
            </Button>
            <Button className="w-full" variant="outline">
              Gestion Rôles
            </Button>
            <Button className="w-full" variant="outline">
              Logs Connexions
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Global Settings */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="text-purple-800 flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Paramètres Globaux</span>
          </CardTitle>
          <CardDescription className="text-purple-700">
            Configuration système générale
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2 text-purple-800">
                Limite Utilisateurs Simultanés
              </label>
              <input
                type="number"
                defaultValue="500"
                className="w-full px-3 py-2 border border-purple-300 rounded-lg bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-purple-800">
                Timeout Session (minutes)
              </label>
              <input
                type="number"
                defaultValue="60"
                className="w-full px-3 py-2 border border-purple-300 rounded-lg bg-white"
              />
            </div>
          </div>
          <Button className="mt-4 w-full">
            Sauvegarder Configuration
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}