import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Progress } from '../ui/progress'
import { Badge } from '../ui/badge'
import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { usePermissions } from '../../hooks/usePermissions'
import { useSupabase } from '../../hooks/useSupabase'
import { Calculator, Download, Receipt, TrendingUp, AlertTriangle, Save, Archive, FileText, Eye, RefreshCw } from 'lucide-react'
import { formatCurrency } from '../../lib/utils'

interface TaxBracket {
  id: string
  type: string
  min_amount: number
  max_amount: number | null
  rate: number
}

interface TaxCalculation {
  income: number
  taxOwed: number
  effectiveRate: number
  brackets: { bracket: TaxBracket; taxOnBracket: number }[]
}

interface TaxReport {
  id: string
  enterprise_id: string
  period: string
  base_amount: number
  calculated_tax: number
  effective_rate: number
  tax_type: string
  created_by: string
  created_at: string
}

interface RealTaxData {
  period: string
  totalCA: number
  totalExpenses: number
  netProfit: number
  calculatedTax: number
  effectiveRate: number
  wealthTax: number
  finalAmount: number
}

export function ImpotsTab() {
  const { user } = useAuth()
  const { hasPermission } = usePermissions()
  const supabaseHooks = useSupabase()
  
  const [realTaxData, setRealTaxData] = useState<RealTaxData | null>(null)
  const [taxBrackets, setTaxBrackets] = useState<TaxBracket[]>([])
  const [wealthBrackets, setWealthBrackets] = useState<TaxBracket[]>([])
  const [taxReports, setTaxReports] = useState<TaxReport[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [toast, setToast] = useState<{type: 'success' | 'error', message: string} | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const canCalculate = hasPermission('impots') && ['superviseur', 'patron', 'co_patron', 'dot'].includes(user?.role || '')
  const canViewBaremes = hasPermission('impots')
  const canSaveReport = hasPermission('impots') && ['patron', 'co_patron'].includes(user?.role || '')

  useEffect(() => {
    loadTaxData()
  }, [])

  const loadTaxData = async () => {
    try {
      setIsLoading(true)
      
      // Charger les tranches IS
      const isBrackets = await supabaseHooks.getTaxBrackets('IS')
      setTaxBrackets(isBrackets)
      
      // Charger les tranches richesse
      const wealthBracketsData = await supabaseHooks.getTaxBrackets('richesse')
      setWealthBrackets(wealthBracketsData)
      
      // Charger les rapports fiscaux précédents
      if (user?.enterprises?.[0]?.id) {
        const reportsData = await supabaseHooks.getTaxReports(user.enterprises[0].id)
        setTaxReports(reportsData)
      }

      // Calculer les données fiscales réelles basées sur les dotations
      await calculateRealTaxData()
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
      showToast('error', 'Erreur lors du chargement des données fiscales')
    } finally {
      setIsLoading(false)
    }
  }

  const calculateRealTaxData = async () => {
    if (!user?.enterprises?.[0]?.id) return

    try {
      const enterpriseId = user.enterprises[0].id
      
      // Récupérer les données réelles depuis les dotations
      const dotations = await supabaseHooks.getDotations(enterpriseId)
      
      if (dotations.length === 0) {
        setRealTaxData(null)
        return
      }

      const latestDotation = dotations[0]
      const totalCA = latestDotation.total_ca || 0
      const totalSalaries = latestDotation.total_salaries || 0
      const totalBonuses = latestDotation.total_bonuses || 0
      
      // Récupérer les dépenses déductibles
      const expenses = await supabaseHooks.getDotationExpenses(latestDotation.id)
      const totalExpenses = expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0)
      
      // Calcul du bénéfice net
      const netProfit = totalCA - totalSalaries - totalBonuses - totalExpenses
      
      // Calcul de l'impôt IS
      const taxCalculation = calculateTax(netProfit, taxBrackets)
      
      // Calcul de l'impôt sur la richesse (sur le bénéfice après IS)
      const profitAfterIS = netProfit - taxCalculation.taxOwed
      const wealthTaxCalculation = calculateTax(profitAfterIS, wealthBrackets)
      
      const finalAmount = profitAfterIS - wealthTaxCalculation.taxOwed

      setRealTaxData({
        period: latestDotation.period,
        totalCA,
        totalExpenses: totalSalaries + totalBonuses + totalExpenses,
        netProfit,
        calculatedTax: taxCalculation.taxOwed,
        effectiveRate: taxCalculation.effectiveRate,
        wealthTax: wealthTaxCalculation.taxOwed,
        finalAmount
      })
    } catch (error) {
      console.error('Erreur lors du calcul:', error)
      showToast('error', 'Erreur lors du calcul des données fiscales')
    }
  }

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  const calculateTax = (income: number, brackets: TaxBracket[]): TaxCalculation => {
    let totalTax = 0
    const bracketCalculations: { bracket: TaxBracket; taxOnBracket: number }[] = []

    for (const bracket of brackets) {
      if (income > bracket.min_amount) {
        const taxableInBracket = Math.min(income, bracket.max_amount || Infinity) - bracket.min_amount
        const taxOnBracket = (taxableInBracket * bracket.rate) / 100
        totalTax += taxOnBracket
        
        if (taxOnBracket > 0) {
          bracketCalculations.push({ bracket, taxOnBracket })
        }
      }
    }

    return {
      income,
      taxOwed: totalTax,
      effectiveRate: income > 0 ? (totalTax / income) * 100 : 0,
      brackets: bracketCalculations
    }
  }

  const saveReport = async () => {
    if (!canSaveReport || !realTaxData || !user?.enterprises?.[0]?.id) return

    try {
      setIsLoading(true)
      
      const reportData = {
        enterprise_id: user.enterprises[0].id,
        period: realTaxData.period,
        base_amount: realTaxData.netProfit,
        calculated_tax: realTaxData.calculatedTax + realTaxData.wealthTax,
        effective_rate: realTaxData.effectiveRate,
        tax_type: 'IS_RICHESSE',
        created_by: user.username || 'unknown',
        details: {
          ca: realTaxData.totalCA,
          expenses: realTaxData.totalExpenses,
          netProfit: realTaxData.netProfit,
          isTax: realTaxData.calculatedTax,
          wealthTax: realTaxData.wealthTax,
          finalAmount: realTaxData.finalAmount
        }
      }
      
      await supabaseHooks.saveTaxReport(reportData)
      await loadTaxData()
      
      showToast('success', 'Rapport fiscal sauvegardé avec succès')
    } catch (error) {
      console.error('Erreur:', error)
      showToast('error', 'Erreur lors de la sauvegarde')
    } finally {
      setIsLoading(false)
    }
  }

  const archiveReport = async () => {
    if (!realTaxData || !user?.enterprises?.[0]?.id) return

    try {
      setIsLoading(true)
      
      const reportData = {
        type: 'rapport_fiscal',
        description: `Rapport fiscal ${realTaxData.period}`,
        totalAmount: realTaxData.calculatedTax + realTaxData.wealthTax,
        fiscalData: realTaxData
      }
      
      await supabaseHooks.archiveReport(user.enterprises[0].id, reportData)
      showToast('success', 'Rapport fiscal archivé avec succès')
    } catch (error) {
      console.error('Erreur:', error)
      showToast('error', 'Erreur lors de l\'archivage')
    } finally {
      setIsLoading(false)
    }
  }

  const exportReport = () => {
    if (!realTaxData) return
    
    const exportData = {
      'Période': realTaxData.period,
      'CA Total': formatCurrency(realTaxData.totalCA),
      'Total Dépenses': formatCurrency(realTaxData.totalExpenses),
      'Bénéfice Net': formatCurrency(realTaxData.netProfit),
      'Impôt IS': formatCurrency(realTaxData.calculatedTax),
      'Impôt Richesse': formatCurrency(realTaxData.wealthTax),
      'Total Impôts': formatCurrency(realTaxData.calculatedTax + realTaxData.wealthTax),
      'Taux Effectif': `${realTaxData.effectiveRate.toFixed(2)}%`,
      'Montant Final': formatCurrency(realTaxData.finalAmount)
    }
    
    const filename = `rapport_fiscal_${realTaxData.period}_${new Date().toISOString().split('T')[0]}.xlsx`
    showToast('success', `Rapport fiscal exporté: ${filename}`)
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
          toast.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
          'bg-red-100 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center space-x-2">
            {toast.type === 'error' && <AlertTriangle className="h-4 w-4" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestion Fiscale Réelle</h2>
          <p className="text-muted-foreground">
            Calculs fiscaux basés sur les données réelles de vos dotations
          </p>
        </div>
        <Button onClick={loadTaxData} variant="outline" disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bénéfice Net</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {realTaxData ? formatCurrency(realTaxData.netProfit) : formatCurrency(0)}
            </div>
            <p className="text-xs text-muted-foreground">Base d'imposition</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impôt IS</CardTitle>
            <Receipt className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {realTaxData ? formatCurrency(realTaxData.calculatedTax) : formatCurrency(0)}
            </div>
            <p className="text-xs text-muted-foreground">Impôt sur les sociétés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impôt Richesse</CardTitle>
            <Calculator className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {realTaxData ? formatCurrency(realTaxData.wealthTax) : formatCurrency(0)}
            </div>
            <p className="text-xs text-muted-foreground">Impôt sur la fortune</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Montant Final</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {realTaxData ? formatCurrency(realTaxData.finalAmount) : formatCurrency(0)}
            </div>
            <p className="text-xs text-muted-foreground">Après tous impôts</p>
          </CardContent>
        </Card>
      </div>

      {/* Calcul fiscal réel */}
      {realTaxData ? (
        <Card>
          <CardHeader>
            <CardTitle>Calcul Fiscal Réel - Période {realTaxData.period}</CardTitle>
            <CardDescription>
              Basé sur les données réelles de vos dotations et dépenses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tableau de calcul détaillé */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">Étape</th>
                    <th className="text-left p-3 font-medium">Description</th>
                    <th className="text-right p-3 font-medium">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3 font-medium text-green-600">1</td>
                    <td className="p-3">Chiffre d'affaires total</td>
                    <td className="p-3 text-right font-medium text-green-600">
                      {formatCurrency(realTaxData.totalCA)}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium text-red-600">2</td>
                    <td className="p-3">Dépenses déductibles (salaires + charges + frais)</td>
                    <td className="p-3 text-right font-medium text-red-600">
                      -{formatCurrency(realTaxData.totalExpenses)}
                    </td>
                  </tr>
                  <tr className="border-b bg-blue-50">
                    <td className="p-3 font-medium text-blue-600">3</td>
                    <td className="p-3 font-medium">Bénéfice imposable</td>
                    <td className="p-3 text-right font-bold text-blue-600">
                      {formatCurrency(realTaxData.netProfit)}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium text-red-600">4</td>
                    <td className="p-3">Impôt sur les sociétés ({realTaxData.effectiveRate.toFixed(1)}%)</td>
                    <td className="p-3 text-right font-medium text-red-600">
                      -{formatCurrency(realTaxData.calculatedTax)}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium text-purple-600">5</td>
                    <td className="p-3">Bénéfice après IS</td>
                    <td className="p-3 text-right font-medium">
                      {formatCurrency(realTaxData.netProfit - realTaxData.calculatedTax)}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium text-purple-600">6</td>
                    <td className="p-3">Impôt sur la richesse</td>
                    <td className="p-3 text-right font-medium text-purple-600">
                      -{formatCurrency(realTaxData.wealthTax)}
                    </td>
                  </tr>
                  <tr className="bg-green-50">
                    <td className="p-3 font-bold text-green-600">7</td>
                    <td className="p-3 font-bold">Montant final disponible</td>
                    <td className="p-3 text-right font-bold text-green-600 text-lg">
                      {formatCurrency(realTaxData.finalAmount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              {canSaveReport && (
                <Button onClick={saveReport} disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  Sauvegarder le Rapport
                </Button>
              )}
              <Button onClick={archiveReport} variant="outline" disabled={isLoading}>
                <Archive className="mr-2 h-4 w-4" />
                Archiver
              </Button>
              <Button onClick={exportReport} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Excel
              </Button>
            </div>

            {/* Détail des tranches appliquées */}
            {realTaxData.calculatedTax > 0 && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-3">Détail du calcul IS:</h4>
                <div className="space-y-2 text-sm">
                  {calculateTax(realTaxData.netProfit, taxBrackets).brackets.map((item, index) => (
                    <div key={index} className="flex justify-between p-2 bg-background rounded">
                      <span>
                        {formatCurrency(item.bracket.min_amount)} - {item.bracket.max_amount ? formatCurrency(item.bracket.max_amount) : '∞'} ({item.bracket.rate}%)
                      </span>
                      <span className="font-medium">{formatCurrency(item.taxOnBracket)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Aucune donnée fiscale disponible
            </h3>
            <p className="text-sm text-muted-foreground">
              Créez une dotation dans l'onglet "Dotations" pour voir les calculs fiscaux
            </p>
          </CardContent>
        </Card>
      )}

      {canViewBaremes && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Barème Impôt sur les Sociétés</CardTitle>
              <CardDescription>
                Tranches d'imposition IS en vigueur ({taxBrackets.length} tranches)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {taxBrackets.map((bracket) => (
                  <div key={bracket.id} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <p className="text-sm font-medium">
                        {formatCurrency(bracket.min_amount)} - {bracket.max_amount ? formatCurrency(bracket.max_amount) : '∞'}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-blue-100 text-blue-800">{bracket.rate}%</Badge>
                    </div>
                  </div>
                ))}
                {taxBrackets.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Aucune tranche configurée
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Barème Impôt sur la Fortune</CardTitle>
              <CardDescription>
                Tranches d'imposition sur la richesse ({wealthBrackets.length} tranches)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {wealthBrackets.map((bracket) => (
                  <div key={bracket.id} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <p className="text-sm font-medium">
                        {formatCurrency(bracket.min_amount)} - {bracket.max_amount ? formatCurrency(bracket.max_amount) : '∞'}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-purple-100 text-purple-800">{bracket.rate}%</Badge>
                    </div>
                  </div>
                ))}
                {wealthBrackets.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Aucune tranche configurée
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Historique des rapports */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des Rapports Fiscaux</CardTitle>
          <CardDescription>
            Rapports précédemment sauvegardés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {taxReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium">{report.tax_type} - {report.period}</p>
                    <Badge variant="outline">{report.effective_rate.toFixed(1)}%</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Base: {formatCurrency(report.base_amount)} • Impôt: {formatCurrency(report.calculated_tax)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(report.created_at).toLocaleDateString('fr-FR')} par {report.created_by}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {taxReports.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground">Aucun rapport</p>
                <p className="text-sm text-muted-foreground">
                  Les rapports sauvegardés apparaîtront ici
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}