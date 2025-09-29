import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Calculator, TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3 } from 'lucide-react'

export function ComptabiliteTab() {
  const [selectedPeriod, setSelectedPeriod] = useState('2024-01')
  
  const [accountingData] = useState({
    revenues: 125000,
    expenses: 85000,
    netProfit: 40000,
    cashFlow: 35000,
    accounts: [
      { code: '701', name: 'Ventes de marchandises', balance: 85000, type: 'revenue' },
      { code: '706', name: 'Prestations de services', balance: 40000, type: 'revenue' },
      { code: '601', name: 'Achats de matières premières', balance: -25000, type: 'expense' },
      { code: '641', name: 'Rémunérations du personnel', balance: -35000, type: 'expense' },
      { code: '661', name: 'Charges d\'intérêts', balance: -5000, type: 'expense' }
    ]
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const stats = [
    {
      title: "Chiffre d'Affaires",
      value: formatCurrency(accountingData.revenues),
      description: "Total des revenus",
      icon: TrendingUp,
      color: "text-green-600",
      trend: "+12.5%"
    },
    {
      title: "Charges",
      value: formatCurrency(accountingData.expenses),
      description: "Total des dépenses",
      icon: TrendingDown,
      color: "text-red-600",
      trend: "+8.2%"
    },
    {
      title: "Résultat Net",
      value: formatCurrency(accountingData.netProfit),
      description: "Bénéfice/Perte",
      icon: DollarSign,
      color: "text-blue-600",
      trend: "+18.7%"
    },
    {
      title: "Trésorerie",
      value: formatCurrency(accountingData.cashFlow),
      description: "Flux de trésorerie",
      icon: PieChart,
      color: "text-purple-600",
      trend: "+5.3%"
    }
  ]

  const revenueAccounts = accountingData.accounts.filter(acc => acc.type === 'revenue')
  const expenseAccounts = accountingData.accounts.filter(acc => acc.type === 'expense')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Comptabilité Avancée</h2>
          <p className="text-muted-foreground">
            Suivi comptable complet avec bilan et compte de résultat
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-input rounded-lg bg-background"
          >
            <option value="2024-01">Janvier 2024</option>
            <option value="2023-12">Décembre 2023</option>
            <option value="2023-11">Novembre 2023</option>
          </select>
          <Button className="btn-glow">
            <BarChart3 className="h-4 w-4 mr-2" />
            Générer Bilan
          </Button>
        </div>
      </div>

      {/* Financial Stats */}
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
                <div className="flex items-center space-x-2">
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                  <span className={`text-xs font-medium ${
                    stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.trend}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Account Details */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Accounts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-700">
              <TrendingUp className="h-5 w-5" />
              <span>Comptes de Produits</span>
            </CardTitle>
            <CardDescription>
              Détail des revenus par compte comptable
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueAccounts.map((account) => (
                <div key={account.code} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{account.code} - {account.name}</div>
                    <div className="text-sm text-muted-foreground">Compte de produit</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      {formatCurrency(account.balance)}
                    </div>
                  </div>
                </div>
              ))}
              <div className="border-t pt-3">
                <div className="flex items-center justify-between font-bold">
                  <span>Total Produits</span>
                  <span className="text-green-600">
                    {formatCurrency(revenueAccounts.reduce((sum, acc) => sum + acc.balance, 0))}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expense Accounts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-700">
              <TrendingDown className="h-5 w-5" />
              <span>Comptes de Charges</span>
            </CardTitle>
            <CardDescription>
              Détail des dépenses par compte comptable
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expenseAccounts.map((account) => (
                <div key={account.code} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{account.code} - {account.name}</div>
                    <div className="text-sm text-muted-foreground">Compte de charge</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-600">
                      {formatCurrency(Math.abs(account.balance))}
                    </div>
                  </div>
                </div>
              ))}
              <div className="border-t pt-3">
                <div className="flex items-center justify-between font-bold">
                  <span>Total Charges</span>
                  <span className="text-red-600">
                    {formatCurrency(Math.abs(expenseAccounts.reduce((sum, acc) => sum + acc.balance, 0)))}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profit & Loss Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>Compte de Résultat Simplifié</span>
          </CardTitle>
          <CardDescription>
            Résumé des performances financières pour {selectedPeriod}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-sm font-medium text-green-800 mb-1">Produits</div>
                <div className="text-2xl font-bold text-green-700">
                  {formatCurrency(accountingData.revenues)}
                </div>
              </div>
              
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-sm font-medium text-red-800 mb-1">Charges</div>
                <div className="text-2xl font-bold text-red-700">
                  {formatCurrency(accountingData.expenses)}
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm font-medium text-blue-800 mb-1">Résultat Net</div>
                <div className="text-2xl font-bold text-blue-700">
                  {formatCurrency(accountingData.netProfit)}
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">Marge Bénéficiaire</span>
                <span className="text-lg font-bold text-blue-600">
                  {((accountingData.netProfit / accountingData.revenues) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-blue-200 bg-blue-50 card-hover">
          <CardHeader>
            <CardTitle className="text-blue-800">Export Comptable</CardTitle>
            <CardDescription className="text-blue-700">
              Exporter les données comptables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Télécharger Excel
            </Button>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50 card-hover">
          <CardHeader>
            <CardTitle className="text-green-800">Rapports</CardTitle>
            <CardDescription className="text-green-700">
              Générer des rapports financiers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Créer Rapport
            </Button>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50 card-hover">
          <CardHeader>
            <CardTitle className="text-purple-800">Analyse</CardTitle>
            <CardDescription className="text-purple-700">
              Outils d'analyse financière
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Analyser Tendances
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}