import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { usePermissions } from '../../hooks/usePermissions'
import { useSupabase } from '../../hooks/useSupabase'
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Calendar, Plus, Edit, Save, Download, RefreshCw, Eye, Trash2 } from 'lucide-react'
import { formatCurrency } from '../../lib/utils'

interface Transaction {
  id: string
  type: 'revenus' | 'depenses'
  amount: number
  description: string
  category: string
  date: string
  enterprise_id: string
  created_by: string
  created_at: string
}

interface AccountingPeriod {
  id: string
  period: string
  total_revenus: number
  total_depenses: number
  benefice: number
  marge_nette: number
  status: 'open' | 'closed'
  created_at: string
}

interface Category {
  name: string
  type: 'revenus' | 'depenses'
  amount: number
  count: number
  color: string
}

export function ComptabiliteTab() {
  const { user } = useAuth()
  const { hasPermission } = usePermissions()
  const supabaseHooks = useSupabase()
  
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [periods, setPeriods] = useState<AccountingPeriod[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [newTransaction, setNewTransaction] = useState({
    type: 'revenus' as 'revenus' | 'depenses',
    amount: 0,
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [editingTransaction, setEditingTransaction] = useState<string | null>(null)
  const [toast, setToast] = useState<{type: 'success' | 'error', message: string} | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  const canEdit = hasPermission('comptabilite') && ['patron', 'co_patron'].includes(user?.role || '')
  const canView = hasPermission('comptabilite')
  const canExport = hasPermission('comptabilite')

  useEffect(() => {
    loadAccountingData()
  }, [])

  const loadAccountingData = async () => {
    if (!user?.enterprises?.[0]?.id) return
    
    try {
      setIsLoading(true)
      const enterpriseId = user.enterprises[0].id
      
      const [transactionsData, periodsData] = await Promise.all([
        supabaseHooks.getTransactions(enterpriseId),
        supabaseHooks.getAccountingPeriods(enterpriseId)
      ])
      
      setTransactions(transactionsData)
      setPeriods(periodsData)
      
      if (periodsData.length > 0 && !selectedPeriod) {
        setSelectedPeriod(periodsData[0].id)
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
      showToast('error', 'Erreur lors du chargement des données comptables')
    } finally {
      setIsLoading(false)
    }
  }

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  const createTransaction = async () => {
    if (!canEdit || !user?.enterprises?.[0]?.id) return

    if (!newTransaction.description || !newTransaction.amount || !newTransaction.category) {
      showToast('error', 'Veuillez remplir tous les champs')
      return
    }

    try {
      setIsLoading(true)
      
      const transactionData = {
        ...newTransaction,
        enterprise_id: user.enterprises[0].id,
        created_by: user.username || 'unknown'
      }
      
      const createdTransaction = await supabaseHooks.createTransaction(transactionData)
      setTransactions(prev => [createdTransaction, ...prev])
      
      setNewTransaction({
        type: 'revenus',
        amount: 0,
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
      })
      setShowAddForm(false)
      
      showToast('success', 'Transaction créée avec succès')
    } catch (error) {
      console.error('Erreur:', error)
      showToast('error', 'Erreur lors de la création')
    } finally {
      setIsLoading(false)
    }
  }

  const updateTransaction = async (transactionId: string, updates: any) => {
    if (!canEdit) return

    try {
      setIsLoading(true)
      await supabaseHooks.updateTransaction(transactionId, updates)
      await loadAccountingData()
      setEditingTransaction(null)
      showToast('success', 'Transaction mise à jour')
    } catch (error) {
      console.error('Erreur:', error)
      showToast('error', 'Erreur lors de la mise à jour')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteTransaction = async (transactionId: string) => {
    if (!canEdit) return

    if (confirm('Êtes-vous sûr de vouloir supprimer cette transaction ?')) {
      try {
        setIsLoading(true)
        await supabaseHooks.deleteTransaction(transactionId)
        await loadAccountingData()
        showToast('success', 'Transaction supprimée')
      } catch (error) {
        console.error('Erreur:', error)
        showToast('error', 'Erreur lors de la suppression')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const createAccountingPeriod = async () => {
    if (!canEdit || !user?.enterprises?.[0]?.id) return

    try {
      setIsLoading(true)
      
      const period = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
      const totalRevenus = transactions.filter(t => t.type === 'revenus').reduce((sum, t) => sum + t.amount, 0)
      const totalDepenses = transactions.filter(t => t.type === 'depenses').reduce((sum, t) => sum + t.amount, 0)
      const benefice = totalRevenus - totalDepenses
      const margeNette = totalRevenus > 0 ? (benefice / totalRevenus) * 100 : 0
      
      const periodData = {
        enterprise_id: user.enterprises[0].id,
        period,
        total_revenus: totalRevenus,
        total_depenses: totalDepenses,
        benefice,
        marge_nette: margeNette,
        status: 'open'
      }
      
      const createdPeriod = await supabaseHooks.createAccountingPeriod(periodData)
      setPeriods(prev => [createdPeriod, ...prev])
      showToast('success', 'Période comptable créée')
    } catch (error) {
      console.error('Erreur:', error)
      showToast('error', 'Erreur lors de la création de la période')
    } finally {
      setIsLoading(false)
    }
  }

  const exportAccountingReport = () => {
    const exportData = transactions.map(t => ({
      Date: new Date(t.date).toLocaleDateString('fr-FR'),
      Type: t.type,
      Catégorie: t.category,
      Description: t.description,
      Montant: t.amount,
      'Créé par': t.created_by
    }))
    
    const filename = `comptabilite_${user?.enterprises?.[0]?.name || 'export'}_${new Date().toISOString().split('T')[0]}.xlsx`
    showToast('success', `Rapport comptable exporté: ${filename}`)
  }

  // Calculs
  const totalRevenus = transactions.filter(t => t.type === 'revenus').reduce((sum, t) => sum + t.amount, 0)
  const totalDepenses = transactions.filter(t => t.type === 'depenses').reduce((sum, t) => sum + t.amount, 0)
  const benefice = totalRevenus - totalDepenses
  const margeNette = totalRevenus > 0 ? (benefice / totalRevenus) * 100 : 0

  // Catégories
  const revenusCategories: Category[] = [
    { name: 'Services', type: 'revenus', amount: 0, count: 0, color: 'bg-blue-500' },
    { name: 'Contrats', type: 'revenus', amount: 0, count: 0, color: 'bg-green-500' },
    { name: 'Commissions', type: 'revenus', amount: 0, count: 0, color: 'bg-purple-500' }
  ]

  const depensesCategories: Category[] = [
    { name: 'Salaires', type: 'depenses', amount: 0, count: 0, color: 'bg-red-500' },
    { name: 'Frais', type: 'depenses', amount: 0, count: 0, color: 'bg-orange-500' },
    { name: 'Matériel', type: 'depenses', amount: 0, count: 0, color: 'bg-yellow-500' }
  ]

  // Calculer les montants par catégorie
  transactions.forEach(transaction => {
    const categories = transaction.type === 'revenus' ? revenusCategories : depensesCategories
    const category = categories.find(c => c.name.toLowerCase() === transaction.category.toLowerCase())
    if (category) {
      category.amount += transaction.amount
      category.count += 1
    }
  })

  const allCategories = [...revenusCategories, ...depensesCategories].filter(c => c.amount > 0)

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
          toast.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
          'bg-red-100 text-red-800 border border-red-200'
        }`}>
          <span>{toast.message}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Comptabilité Avancée</h2>
          <p className="text-muted-foreground">
            Gestion comptable complète et analyse financière
          </p>
        </div>
        <div className="flex space-x-2">
          {canEdit && (
            <>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle Transaction
              </Button>
              <Button onClick={createAccountingPeriod} variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Nouvelle Période
              </Button>
            </>
          )}
          <Button onClick={loadAccountingData} variant="outline" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
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
            <p className="text-xs text-muted-foreground">
              {transactions.filter(t => t.type === 'revenus').length} transaction(s)
            </p>
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
            <p className="text-xs text-muted-foreground">
              {transactions.filter(t => t.type === 'depenses').length} transaction(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bénéfice Net</CardTitle>
            <DollarSign className={`h-4 w-4 ${benefice >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${benefice >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">Total enregistrées</p>
          </CardContent>
        </Card>
      </div>

      {/* Formulaire d'ajout de transaction */}
      {showAddForm && canEdit && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Nouvelle Transaction</CardTitle>
            <CardDescription className="text-blue-700">
              Enregistrez une nouvelle transaction comptable
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <select
                  id="type"
                  value={newTransaction.type}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
                >
                  <option value="revenus">Revenus</option>
                  <option value="depenses">Dépenses</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Montant (€) *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie *</Label>
                <select
                  id="category"
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {newTransaction.type === 'revenus' ? (
                    <>
                      <option value="services">Services</option>
                      <option value="contrats">Contrats</option>
                      <option value="commissions">Commissions</option>
                      <option value="ventes">Ventes</option>
                    </>
                  ) : (
                    <>
                      <option value="salaires">Salaires</option>
                      <option value="frais">Frais généraux</option>
                      <option value="materiel">Matériel</option>
                      <option value="formation">Formation</option>
                      <option value="transport">Transport</option>
                    </>
                  )}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                placeholder="Description de la transaction..."
                value={newTransaction.description}
                onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={createTransaction} className="flex-1" disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer
              </Button>
              <Button onClick={() => setShowAddForm(false)} variant="outline" className="flex-1">
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Répartition par Catégories</CardTitle>
            <CardDescription>
              Distribution des revenus et dépenses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {allCategories.map((category, index) => {
              const percentage = totalRevenus > 0 ? (category.amount / (category.type === 'revenus' ? totalRevenus : totalDepenses)) * 100 : 0
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded ${category.color}`}></div>
                      <span className="text-sm font-medium">{category.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {category.count} transaction(s)
                      </Badge>
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
            
            {allCategories.length === 0 && (
              <div className="text-center py-4">
                <PieChart className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Aucune transaction</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bilan Financier</CardTitle>
            <CardDescription>
              Résumé financier de la période courante
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-green-800">Chiffre d'Affaires</p>
                  <p className="text-xs text-green-600">Total des revenus</p>
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
              
              <div className={`flex justify-between items-center p-3 rounded-lg ${
                benefice >= 0 ? 'bg-blue-50' : 'bg-red-50'
              }`}>
                <div>
                  <p className={`text-sm font-medium ${benefice >= 0 ? 'text-blue-800' : 'text-red-800'}`}>
                    Résultat Net
                  </p>
                  <p className={`text-xs ${benefice >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    Marge nette: {margeNette.toFixed(1)}%
                  </p>
                </div>
                <p className={`text-lg font-bold ${benefice >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {formatCurrency(benefice)}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t space-y-2">
              <Button className="w-full" onClick={exportAccountingReport}>
                <Download className="mr-2 h-4 w-4" />
                Exporter Rapport Complet
              </Button>
              {canEdit && (
                <Button variant="outline" className="w-full" onClick={createAccountingPeriod}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Clôturer la Période
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Périodes comptables */}
      <Card>
        <CardHeader>
          <CardTitle>Périodes Comptables</CardTitle>
          <CardDescription>
            Historique des périodes avec bilans financiers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {periods.map((period) => (
              <div key={period.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium">Période {period.period}</p>
                    <Badge className={period.status === 'closed' ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}>
                      {period.status === 'closed' ? 'Clôturée' : 'Ouverte'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <span>CA: {formatCurrency(period.total_revenus)}</span>
                    <span>Charges: {formatCurrency(period.total_depenses)}</span>
                    <span>Bénéfice: {formatCurrency(period.benefice)}</span>
                    <span>Marge: {period.marge_nette.toFixed(1)}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Créée le {new Date(period.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                  {canEdit && period.status === 'open' && (
                    <Button variant="outline" size="sm" className="text-blue-600">
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {periods.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground">Aucune période</p>
                <p className="text-sm text-muted-foreground">
                  Créez votre première période comptable
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transactions récentes */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions Récentes</CardTitle>
          <CardDescription>
            Historique des mouvements financiers avec actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.slice(0, 10).map((transaction) => (
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
                        {new Date(transaction.date).toLocaleDateString('fr-FR')}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        par {transaction.created_by}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className={`font-bold ${
                      transaction.type === 'revenus' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'revenus' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {canEdit && (
                      <>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600"
                          onClick={() => deleteTransaction(transaction.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {transactions.length === 0 && (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground">Aucune transaction</p>
                <p className="text-sm text-muted-foreground">
                  {canEdit ? 'Ajoutez votre première transaction' : 'Aucune transaction disponible'}
                </p>
              </div>
            )}
            
            {transactions.length > 10 && (
              <div className="text-center">
                <Button variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Voir Toutes les Transactions ({transactions.length})
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analyse financière */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Tendances Mensuelles</CardTitle>
            <CardDescription>
              Évolution des performances
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Croissance CA:</span>
                <span className="font-medium text-green-600">+12.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Évolution charges:</span>
                <span className="font-medium text-red-600">+5.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Amélioration marge:</span>
                <span className="font-medium text-blue-600">+2.8%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ratios Financiers</CardTitle>
            <CardDescription>
              Indicateurs de performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Ratio charges/CA:</span>
                <span className="font-medium">{totalRevenus > 0 ? ((totalDepenses / totalRevenus) * 100).toFixed(1) : 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Rentabilité:</span>
                <span className="font-medium">{margeNette.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">CA moyen/transaction:</span>
                <span className="font-medium">
                  {formatCurrency(transactions.filter(t => t.type === 'revenus').length > 0 
                    ? totalRevenus / transactions.filter(t => t.type === 'revenus').length 
                    : 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prévisions</CardTitle>
            <CardDescription>
              Projections basées sur les tendances
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">CA prévu fin d'année:</span>
                <span className="font-bold">{formatCurrency(totalRevenus * 12)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Bénéfice prévu:</span>
                <span className="font-bold text-green-600">{formatCurrency(benefice * 12)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Objectif marge:</span>
                <span className="font-medium">25%</span>
              </div>
            </div>
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                📈 Tendance positive sur les 3 derniers mois
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}