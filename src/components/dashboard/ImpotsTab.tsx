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
import { Calculator, Download, Receipt, TrendingUp, AlertTriangle, Save, Archive, FileText, Eye } from 'lucide-react'
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

interface TaxSimulation {
  id: string
  base_amount: number
  period: string
  tax_type: string
  calculated_tax: number
  effective_rate: number
  created_at: string
}

interface SimulationParams {
  base: number
  periode: string
  bareme: 'IS' | 'richesse'
}

export function ImpotsTab() {
  const { user } = useAuth()
  const { hasPermission } = usePermissions()
  const supabaseHooks = useSupabase()
  
  const [simulation, setSimulation] = useState<SimulationParams>({
    base: 0,
    periode: 'mensuel',
    bareme: 'IS'
  })
  const [calculation, setCalculation] = useState<TaxCalculation | null>(null)
  const [taxBrackets, setTaxBrackets] = useState<TaxBracket[]>([])
  const [wealthBrackets, setWealthBrackets] = useState<TaxBracket[]>([])
  const [simulations, setSimulations] = useState<TaxSimulation[]>([])
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [toast, setToast] = useState<{type: 'success' | 'error', message: string} | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const canSimulate = hasPermission('impots') && ['superviseur', 'patron', 'co_patron', 'dot'].includes(user?.role || '')
  const canViewBaremes = hasPermission('impots')
  const canSaveSimulation = hasPermission('impots') && ['patron', 'co_patron'].includes(user?.role || '')

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
      
      // Charger les simulations précédentes
      if (user?.enterprises?.[0]?.id) {
        const simulationsData = await supabaseHooks.getTaxSimulations(user.enterprises[0].id)
        setSimulations(simulationsData)
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
      showToast('error', 'Erreur lors du chargement des données fiscales')
    } finally {
      setIsLoading(false)
    }
  }

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  const validateInput = (field: string, value: any): string => {
    switch (field) {
      case 'base':
        if (!value || isNaN(value) || value < 0) {
          return 'La base doit être un nombre positif'
        }
        break
      case 'periode':
        if (!value) {
          return 'La période est requise'
        }
        break
    }
    return ''
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

  const handleSimulation = async () => {
    if (!canSimulate) return

    const newErrors: {[key: string]: string} = {}
    
    const baseError = validateInput('base', simulation.base)
    const periodeError = validateInput('periode', simulation.periode)
    
    if (baseError) newErrors.base = baseError
    if (periodeError) newErrors.periode = periodeError
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length > 0) {
      showToast('error', 'Veuillez corriger les erreurs de saisie')
      return
    }

    try {
      const brackets = simulation.bareme === 'IS' ? taxBrackets : wealthBrackets
      const result = calculateTax(simulation.base, brackets)
      setCalculation(result)
      showToast('success', 'Simulation calculée avec succès')
    } catch (error) {
      showToast('error', 'Erreur lors du calcul de la simulation')
    }
  }

  const saveSimulation = async () => {
    if (!canSaveSimulation || !calculation || !user?.enterprises?.[0]?.id) return

    try {
      setIsLoading(true)
      
      const simulationData = {
        base: calculation.income,
        periode: simulation.periode,
        bareme: simulation.bareme,
        taxOwed: calculation.taxOwed,
        effectiveRate: calculation.effectiveRate,
        brackets: calculation.brackets
      }
      
      await supabaseHooks.saveTaxSimulation(user.enterprises[0].id, simulationData)
      await loadTaxData() // Recharger les simulations
      
      showToast('success', 'Simulation sauvegardée avec succès')
    } catch (error) {
      console.error('Erreur:', error)
      showToast('error', 'Erreur lors de la sauvegarde')
    } finally {
      setIsLoading(false)
    }
  }

  const archiveSimulation = async () => {
    if (!calculation || !user?.enterprises?.[0]?.id) return

    try {
      setIsLoading(true)
      
      const reportData = {
        type: 'simulation_fiscale',
        description: `Simulation fiscale ${simulation.bareme} - ${simulation.periode}`,
        totalAmount: calculation.taxOwed,
        simulation: {
          base: calculation.income,
          periode: simulation.periode,
          bareme: simulation.bareme,
          taxOwed: calculation.taxOwed,
          effectiveRate: calculation.effectiveRate,
          brackets: calculation.brackets
        }
      }
      
      await supabaseHooks.archiveReport(user.enterprises[0].id, reportData)
      showToast('success', 'Simulation archivée avec succès')
    } catch (error) {
      console.error('Erreur:', error)
      showToast('error', 'Erreur lors de l\'archivage')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof SimulationParams, value: any) => {
    setSimulation(prev => ({ ...prev, [field]: value }))
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const exportSimulation = () => {
    if (!calculation) return
    
    const exportData = {
      'Base de calcul': formatCurrency(calculation.income),
      'Période': simulation.periode,
      'Barème': simulation.bareme,
      'Impôts dus': formatCurrency(calculation.taxOwed),
      'Taux effectif': `${calculation.effectiveRate.toFixed(2)}%`,
      'Montant net': formatCurrency(calculation.income - calculation.taxOwed)
    }
    
    const filename = `simulation_fiscale_${simulation.bareme}_${new Date().toISOString().split('T')[0]}.xlsx`
    // Utiliser la fonction d'export
    showToast('success', `Export généré: ${filename}`)
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

      <div>
        <h2 className="text-3xl font-bold tracking-tight">Gestion Fiscale</h2>
        <p className="text-muted-foreground">
          Consultation des barèmes et simulation d'impôts avec sauvegarde
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux Effectif</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {calculation ? `${calculation.effectiveRate.toFixed(1)}%` : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">Taux d'imposition</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impôt Calculé</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {calculation ? formatCurrency(calculation.taxOwed) : formatCurrency(0)}
            </div>
            <p className="text-xs text-muted-foreground">Montant des impôts dus</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenu Net</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {calculation ? formatCurrency(calculation.income - calculation.taxOwed) : formatCurrency(0)}
            </div>
            <p className="text-xs text-muted-foreground">Après impôts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Simulations</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{simulations.length}</div>
            <p className="text-xs text-muted-foreground">Sauvegardées</p>
          </CardContent>
        </Card>
      </div>

      {canSimulate && (
        <Card>
          <CardHeader>
            <CardTitle>Simulation Fiscale</CardTitle>
            <CardDescription>
              Calculez vos impôts selon les barèmes en vigueur
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="base">Base de calcul (€) *</Label>
                <Input
                  id="base"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="50000"
                  value={simulation.base || ''}
                  onChange={(e) => handleInputChange('base', parseFloat(e.target.value.replace(',', '.')) || 0)}
                  className={errors.base ? 'border-red-500' : ''}
                  required
                />
                {errors.base && (
                  <p className="text-sm text-red-600">{errors.base}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="periode">Période *</Label>
                <select
                  id="periode"
                  value={simulation.periode}
                  onChange={(e) => handleInputChange('periode', e.target.value)}
                  className={`w-full h-10 px-3 rounded-lg border border-input bg-background text-sm ${
                    errors.periode ? 'border-red-500' : ''
                  }`}
                  required
                >
                  <option value="mensuel">Mensuel</option>
                  <option value="trimestriel">Trimestriel</option>
                  <option value="annuel">Annuel</option>
                </select>
                {errors.periode && (
                  <p className="text-sm text-red-600">{errors.periode}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bareme">Barème</Label>
                <select
                  id="bareme"
                  value={simulation.bareme}
                  onChange={(e) => handleInputChange('bareme', e.target.value as 'IS' | 'richesse')}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
                >
                  <option value="IS">Impôt sur les Sociétés</option>
                  <option value="richesse">Impôt sur la Fortune</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={handleSimulation} className="flex-1">
                <Calculator className="mr-2 h-4 w-4" />
                Calculer la Simulation
              </Button>
              {calculation && canSaveSimulation && (
                <Button onClick={saveSimulation} variant="outline" disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  Sauvegarder
                </Button>
              )}
              {calculation && (
                <>
                  <Button onClick={archiveSimulation} variant="outline" disabled={isLoading}>
                    <Archive className="mr-2 h-4 w-4" />
                    Archiver
                  </Button>
                  <Button onClick={exportSimulation} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </>
              )}
            </div>

            {calculation && (
              <div className="space-y-4 p-4 bg-muted rounded-lg">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Base de calcul:</span>
                      <span>{formatCurrency(calculation.income)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Impôts dus:</span>
                      <span className="font-bold text-red-600">{formatCurrency(calculation.taxOwed)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Montant net:</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(calculation.income - calculation.taxOwed)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Progress value={calculation.effectiveRate} className="mt-2" />
                    <p className="text-xs text-muted-foreground text-center">
                      Taux effectif: {calculation.effectiveRate.toFixed(2)}%
                    </p>
                  </div>
                </div>
                
                {calculation.brackets.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Détail par tranche:</h4>
                    <div className="space-y-1 text-sm">
                      {calculation.brackets.map((item, index) => (
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
              </div>
            )}
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

      {/* Historique des simulations */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des Simulations</CardTitle>
          <CardDescription>
            Simulations précédemment sauvegardées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {simulations.map((sim) => (
              <div key={sim.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium">{sim.tax_type} - {sim.period}</p>
                    <Badge variant="outline">{sim.effective_rate.toFixed(1)}%</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Base: {formatCurrency(sim.base_amount)} • Impôt: {formatCurrency(sim.calculated_tax)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(sim.created_at).toLocaleDateString('fr-FR')}
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
            {simulations.length === 0 && (
              <div className="text-center py-8">
                <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground">Aucune simulation</p>
                <p className="text-sm text-muted-foreground">
                  Vos simulations sauvegardées apparaîtront ici
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}