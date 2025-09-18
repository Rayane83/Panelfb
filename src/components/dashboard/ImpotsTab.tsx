import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Progress } from '../ui/progress'
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { usePermissions } from '../../hooks/usePermissions'
import { Calculator, Download, Receipt, TrendingUp, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '../../lib/utils'

interface TaxBracket {
  min: number
  max: number | null
  rate: number
}

interface WealthBracket {
  min: number
  max: number | null
  rate: number
}

interface TaxCalculation {
  income: number
  taxOwed: number
  effectiveRate: number
  brackets: { bracket: TaxBracket; taxOnBracket: number }[]
}

interface SimulationParams {
  base: number
  periode: string
  bareme: 'IS' | 'richesse'
}

export function ImpotsTab() {
  const { user } = useAuth()
  const { hasPermission } = usePermissions()
  const [simulation, setSimulation] = useState<SimulationParams>({
    base: 0,
    periode: 'mensuel',
    bareme: 'IS'
  })
  const [calculation, setCalculation] = useState<TaxCalculation | null>(null)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [toast, setToast] = useState<{type: 'success' | 'error', message: string} | null>(null)
  
  const canSimulate = hasPermission('impots') && ['staff', 'patron', 'co_patron', 'dot'].includes(user?.role || '')
  const canViewBaremes = hasPermission('impots')

  // Tranches IS (Impôt sur les Sociétés)
  const taxBrackets: TaxBracket[] = [
    { min: 0, max: 42500, rate: 15 },
    { min: 42500, max: 250000, rate: 25 },
    { min: 250000, max: null, rate: 31 }
  ]

  // Tranches Impôt sur la Fortune/Richesse
  const wealthBrackets: WealthBracket[] = [
    { min: 0, max: 800000, rate: 0 },
    { min: 800000, max: 1300000, rate: 0.5 },
    { min: 1300000, max: 2570000, rate: 0.7 },
    { min: 2570000, max: 5000000, rate: 1.0 },
    { min: 5000000, max: 10000000, rate: 1.25 },
    { min: 10000000, max: null, rate: 1.5 }
  ]

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
      if (income > bracket.min) {
        const taxableInBracket = Math.min(income, bracket.max || Infinity) - bracket.min
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

  const handleSimulation = () => {
    if (!canSimulate) return

    const newErrors: {[key: string]: string} = {}
    
    // Validation avec Constraint Validation API
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

  const handleInputChange = (field: keyof SimulationParams, value: any) => {
    setSimulation(prev => ({ ...prev, [field]: value }))
    
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const mockTaxReports = [
    { period: '2024-Q1', income: 45000, tax: 8750, status: 'Payé' },
    { period: '2024-Q2', income: 52000, tax: 11200, status: 'En attente' },
    { period: '2024-Q3', income: 48000, tax: 9600, status: 'Brouillon' }
  ]

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
          Consultation des barèmes et simulation d'impôts
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
            <CardTitle className="text-sm font-medium">Économies</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(2450)}
            </div>
            <p className="text-xs text-muted-foreground">Optimisation fiscale</p>
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
                  aria-describedby={errors.base ? 'base-error' : undefined}
                  required
                />
                {errors.base && (
                  <p id="base-error" className="text-sm text-red-600" role="alert">
                    {errors.base}
                  </p>
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
                  aria-describedby={errors.periode ? 'periode-error' : undefined}
                  required
                >
                  <option value="mensuel">Mensuel</option>
                  <option value="trimestriel">Trimestriel</option>
                  <option value="annuel">Annuel</option>
                </select>
                {errors.periode && (
                  <p id="periode-error" className="text-sm text-red-600" role="alert">
                    {errors.periode}
                  </p>
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
            
            <Button onClick={handleSimulation} className="w-full">
              <Calculator className="mr-2 h-4 w-4" />
              Calculer la Simulation
            </Button>

            {calculation && (
              <div className="space-y-4 p-4 bg-muted rounded-lg">
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
                <Progress value={calculation.effectiveRate} className="mt-2" />
                <p className="text-xs text-muted-foreground text-center">
                  Taux effectif: {calculation.effectiveRate.toFixed(2)}%
                </p>
                
                {calculation.brackets.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Détail par tranche:</h4>
                    <div className="space-y-1 text-sm">
                      {calculation.brackets.map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span>
                            {formatCurrency(item.bracket.min)} - {item.bracket.max ? formatCurrency(item.bracket.max) : '∞'} ({item.bracket.rate}%)
                          </span>
                          <span>{formatCurrency(item.taxOnBracket)}</span>
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
                Tranches d'imposition IS en vigueur
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {taxBrackets.map((bracket, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <p className="text-sm font-medium">
                        {formatCurrency(bracket.min)} - {bracket.max ? formatCurrency(bracket.max) : '∞'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{bracket.rate}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Barème Impôt sur la Fortune</CardTitle>
              <CardDescription>
                Tranches d'imposition sur la richesse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {wealthBrackets.map((bracket, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <p className="text-sm font-medium">
                        {formatCurrency(bracket.min)} - {bracket.max ? formatCurrency(bracket.max) : '∞'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{bracket.rate}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Déclarations Fiscales</CardTitle>
          <CardDescription>
            Historique et gestion de vos déclarations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTaxReports.map((report, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{report.period}</p>
                  <p className="text-sm text-muted-foreground">
                    Base: {formatCurrency(report.income)}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-bold">{formatCurrency(report.tax)}</p>
                  <p className="text-xs text-muted-foreground">{report.status}</p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-1 h-3 w-3" />
                  PDF
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}