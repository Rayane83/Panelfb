import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Shuffle, Settings, TrendingUp, AlertTriangle, Clock, DollarSign } from 'lucide-react'

export function BlanchimentTab() {
  const [operations] = useState([
    {
      id: '1',
      statut: 'En cours',
      dateRecu: '2024-01-15',
      dateRendu: null,
      duree: 5,
      groupe: 'Alpha',
      employe: 'Jean Dupont',
      donneur: 'Client A',
      recep: 'Récepteur B',
      somme: 50000,
      percEntreprise: 15,
      percGroupe: 5
    },
    {
      id: '2',
      statut: 'Terminé',
      dateRecu: '2024-01-10',
      dateRendu: '2024-01-12',
      duree: 2,
      groupe: 'Beta',
      employe: 'Marie Martin',
      donneur: 'Client C',
      recep: 'Récepteur D',
      somme: 75000,
      percEntreprise: 15,
      percGroupe: 5
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
      case 'En cours': return 'bg-yellow-100 text-yellow-800'
      case 'Terminé': return 'bg-green-100 text-green-800'
      case 'Annulé': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const stats = [
    {
      title: "Opérations Actives",
      value: "3",
      description: "En cours",
      icon: Clock,
      color: "text-yellow-600"
    },
    {
      title: "Volume Total",
      value: formatCurrency(125000),
      description: "Ce mois",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Taux Moyen",
      value: "15%",
      description: "Commission",
      icon: TrendingUp,
      color: "text-blue-600"
    },
    {
      title: "Conformité",
      value: "98%",
      description: "Score",
      icon: AlertTriangle,
      color: "text-purple-600"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestion du Blanchiment</h2>
          <p className="text-muted-foreground">
            Suivi des opérations de blanchiment et rapports de conformité
          </p>
        </div>
        <Button className="btn-glow">
          <Shuffle className="h-4 w-4 mr-2" />
          Nouvelle Opération
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

      {/* Operations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Opérations Récentes</CardTitle>
          <CardDescription>
            Historique des opérations de blanchiment avec suivi détaillé
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {operations.map((operation) => (
              <div key={operation.id} className="flex items-center justify-between p-4 border rounded-lg card-hover">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-medium">Opération #{operation.id}</h4>
                    <Badge className={getStatusColor(operation.statut)}>
                      {operation.statut}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Montant: {formatCurrency(operation.somme)} • 
                    Groupe: {operation.groupe} • 
                    Employé: {operation.employe}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Reçu: {new Date(operation.dateRecu).toLocaleDateString('fr-FR')} • 
                    Durée: {operation.duree} jours • 
                    Commission: {operation.percEntreprise}%
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    Détails
                  </Button>
                  <Button variant="outline" size="sm">
                    Modifier
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-800 flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Configuration du Blanchiment</span>
          </CardTitle>
          <CardDescription className="text-orange-700">
            Paramètres globaux et seuils de conformité
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2 text-orange-800">
                Seuil Maximum (€)
              </label>
              <input
                type="number"
                defaultValue="100000"
                className="w-full px-3 py-2 border border-orange-300 rounded-lg bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-orange-800">
                Commission Entreprise (%)
              </label>
              <input
                type="number"
                defaultValue="15"
                className="w-full px-3 py-2 border border-orange-300 rounded-lg bg-white"
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