import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Calendar } from 'lucide-react'
import { formatCurrency } from '../../lib/utils'

interface Transaction {
  id: string
  type: 'revenus' | 'depenses'
  amount: number
  description: string
  category: string
  date: Date
}

export function ComptabiliteTab() {
  const mockTransactions: Transaction[] = [
    { id: '1', type: 'revenus', amount: 25000, description: 'Vente de services', category: 'services', date: new Date() },
    { id: '2', type: 'depenses', amount: 3500, description: 'Salaires employés', category: 'salaires', date: new Date() },
    { id: '3', type: 'revenus', amount: 15000, description: 'Contrat client A', category: 'contrats', date: new Date(Date.now() - 86400000) },
    { id: '4', type: 'depenses', amount: 1200, description: 'Frais de bureau', category: 'frais', date: new Date(Date.now() - 86400000) },
    { id: '5', type: 'revenus', amount: 8000, description: 'Commission', category: 'commissions', date: new Date(Date.now() - 172800000) }
  ]

  const totalRevenus = mockTransactions
    .filter(t => t.type === 'revenus')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const totalDepenses = mockTransactions
    .filter(t => t.type === 'depenses')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const benefice = totalRevenus - totalDepenses
  const margeNette = (benefice / totalRevenus) * 100

  const categories = [
    { name: 'Services', amount: 25000, color: 'bg-blue-500' },
    { name: 'Contrats', amount: 15000, color: 'bg-green-500' },
    { name: 'Commissions', amount: 8000, color: 'bg-purple-500' },
    { name: 'Salaires', amount: 3500, color: 'bg-red-500' },
    { name: 'Frais', amount: 1200, color: 'bg-orange-500' }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Comptabilité Avancée</h2>
        <p className="text-muted-foreground">
          Gestion comptable complète et analyse financière
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalRevenus)}
            </div>
            <p className="text-xs text-muted-foreground">+12% ce mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dépenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalDepenses)}
            </div>
            <p className="text-xs text-muted-foreground">-5% ce mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bénéfice Net</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(benefice)}
            </div>
            <p className="text-xs text-muted-foreground">Marge: {margeNette.toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockTransactions.length}</div>
            <p className="text-xs text-muted-foreground">Ce mois</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Répartition par Catégories</CardTitle>
            <CardDescription>
              Distribution des revenus et dépenses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categories.map((category, index) => {
              const percentage = (category.amount / totalRevenus) * 100
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded ${category.color}`}></div>
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatCurrency(category.amount)}</p>
                      <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bilan Mensuel</CardTitle>
            <CardDescription>
              Résumé financier du mois en cours
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-green-800">Chiffre d'Affaires</p>
                  <p className="text-xs text-green-600">Total des ventes</p>
                </div>
                <p className="text-lg font-bold text-green-600">{formatCurrency(totalRevenus)}</p>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-red-800">Charges</p>
                  <p className="text-xs text-red-600">Total des dépenses</p>
                </div>
                <p className="text-lg font-bold text-red-600">{formatCurrency(totalDepenses)}</p>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-blue-800">Résultat Net</p>
                  <p className="text-xs text-blue-600">Bénéfice après charges</p>
                </div>
                <p className="text-lg font-bold text-blue-600">{formatCurrency(benefice)}</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button className="w-full">
                <PieChart className="mr-2 h-4 w-4" />
                Générer Rapport Complet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions Récentes</CardTitle>
          <CardDescription>
            Historique des mouvements financiers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${
                    transaction.type === 'revenus' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {transaction.type === 'revenus' ? 
                      <TrendingUp className="h-4 w-4 text-green-600" /> : 
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    }
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">{transaction.description}</p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {transaction.category}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {transaction.date.toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${
                    transaction.type === 'revenus' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'revenus' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Voir Plus de Transactions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}