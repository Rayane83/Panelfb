import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Plus, Calculator, FileText, Users, Eye, Download } from 'lucide-react'

export function DotationsTab() {
  const [dotations] = useState([
    {
      id: '1',
      period: 'Janvier 2024',
      totalCA: 85000,
      totalSalaries: 12500,
      totalBonuses: 4250,
      employees: 8,
      status: 'Validé',
      createdAt: '2024-01-31'
    },
    {
      id: '2',
      period: 'Décembre 2023',
      totalCA: 78000,
      totalSalaries: 11800,
      totalBonuses: 3900,
      employees: 7,
      status: 'Payé',
      createdAt: '2023-12-31'
    }
  ])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Validé': return 'bg-green-100 text-green-800'
      case 'Payé': return 'bg-blue-100 text-blue-800'
      case 'Brouillon': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const stats = [
    {
      title: "CA Total",
      value: formatCurrency(85000),
      description: "Chiffre d'affaires",
      icon: Calculator,
      color: "text-blue-600"
    },
    {
      title: "Salaires",
      value: formatCurrency(12500),
      description: "Total mensuel",
      icon: FileText,
      color: "text-green-600"
    },
    {
      title: "Primes",
      value: formatCurrency(4250),
      description: "Total calculé",
      icon: Plus,
      color: "text-purple-600"
    },
    {
      title: "Employés",
      value: "8",
      description: "Actifs",
      icon: Users,
      color: "text-orange-600"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestion des Dotations</h2>
          <p className="text-muted-foreground">
            Saisie et calcul automatique des dotations avec import Excel/CSV
          </p>
        </div>
        <Button className="btn-glow">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Dotation
        </Button>
      </div>

      {/* Stats */}
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

      {/* Dotations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Dotations Récentes</CardTitle>
          <CardDescription>
            Historique des dotations avec calculs automatiques
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dotations.map((dotation) => (
              <div key={dotation.id} className="flex items-center justify-between p-4 border rounded-lg card-hover">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-medium">Dotation {dotation.period}</h4>
                    <Badge className={getStatusColor(dotation.status)}>
                      {dotation.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    CA: {formatCurrency(dotation.totalCA)} • 
                    Salaires: {formatCurrency(dotation.totalSalaries)} • 
                    Primes: {formatCurrency(dotation.totalBonuses)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {dotation.employees} employés • Créé le {new Date(dotation.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Voir
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-green-200 bg-green-50 card-hover">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Nouvelle Dotation</span>
            </CardTitle>
            <CardDescription className="text-green-700">
              Créer une nouvelle dotation mensuelle
            </CardDescription>
          </CardHeader>
          <CardContent>
          <CardContent>
            <Button className="w-full">Créer</Button>
          </CardContent>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50 card-hover">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Import CSV</span>
            </CardTitle>
            <CardDescription className="text-blue-700">
              Importer des données depuis Excel/CSV
            </CardDescription>
          </CardHeader>
          <CardContent>
          <CardContent>
            <Button variant="outline" className="w-full">Importer</Button>
          </CardContent>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50 card-hover">
          <CardHeader>
            <CardTitle className="text-purple-800 flex items-center space-x-2">
              <Calculator className="h-4 w-4" />
              <span>Calculateur</span>
            </CardTitle>
            <CardDescription className="text-purple-700">
              Calculateur de salaires intégré
            </CardDescription>
          </CardHeader>
          <CardContent>
          <CardContent>
            <Button variant="outline" className="w-full">Calculer</Button>
          </CardContent>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}