import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Calculator, TrendingUp, FileText, Receipt } from 'lucide-react'

export function ImpotsTab() {
  const [taxBase, setTaxBase] = useState('')
  const [taxPeriod, setTaxPeriod] = useState('mensuel')
  const [taxType, setTaxType] = useState('IS')
  const [result, setResult] = useState<{
    tax: number
    rate: number
    net: number
  } | null>(null)

  const calculateTax = () => {
    const base = parseFloat(taxBase) || 0
    
    if (base <= 0) {
      alert('Veuillez saisir un montant valide')
      return
    }
    
    let tax = 0
    
    if (taxType === 'IS') {
      // Barème IS
      if (base <= 42500) {
        tax = base * 0.15
      } else if (base <= 250000) {
        tax = 42500 * 0.15 + (base - 42500) * 0.25
      } else {
        tax = 42500 * 0.15 + (250000 - 42500) * 0.25 + (base - 250000) * 0.31
      }
    } else {
      // Barème richesse
      if (base <= 800000) {
        tax = 0
      } else if (base <= 1300000) {
        tax = (base - 800000) * 0.005
      } else {
        tax = 500000 * 0.005 + (base - 1300000) * 0.007
      }
    }
    
    const effectiveRate = (tax / base) * 100
    const netAmount = base - tax
    
    setResult({
      tax,
      rate: effectiveRate,
      net: netAmount
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const taxBrackets = [
    { min: 0, max: 42500, rate: 15, type: 'IS' },
    { min: 42500, max: 250000, rate: 25, type: 'IS' },
    { min: 250000, max: null, rate: 31, type: 'IS' },
    { min: 0, max: 800000, rate: 0, type: 'richesse' },
    { min: 800000, max: 1300000, rate: 0.5, type: 'richesse' },
    { min: 1300000, max: null, rate: 0.7, type: 'richesse' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Gestion Fiscale</h2>
        <p className="text-muted-foreground">
          Consultation des barèmes et simulation d'impôts
        </p>
      </div>

      {/* Tax Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>Calculateur Fiscal</span>
          </CardTitle>
          <CardDescription>
            Simulez vos impôts selon les barèmes en vigueur
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium mb-2">
                Base de calcul (€)
              </label>
              <input
                type="number"
                value={taxBase}
                onChange={(e) => setTaxBase(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                placeholder="50000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Période
              </label>
              <select
                value={taxPeriod}
                onChange={(e) => setTaxPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background"
              >
                <option value="mensuel">Mensuel</option>
                <option value="trimestriel">Trimestriel</option>
                <option value="annuel">Annuel</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Type d'impôt
              </label>
              <select
                value={taxType}
                onChange={(e) => setTaxType(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background"
              >
                <option value="IS">Impôt sur les Sociétés</option>
                <option value="richesse">Impôt sur la Fortune</option>
              </select>
            </div>
          </div>
          
          <Button onClick={calculateTax} className="w-full btn-glow">
            <Calculator className="h-4 w-4 mr-2" />
            Calculer la Simulation
          </Button>
          
          {result && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(result.tax)}
                  </div>
                  <p className="text-sm text-muted-foreground">Impôt calculé</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {result.rate.toFixed(2)}%
                  </div>
                  <p className="text-sm text-muted-foreground">Taux effectif</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(result.net)}
                  </div>
                  <p className="text-sm text-muted-foreground">Montant net</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tax Brackets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Barèmes Fiscaux</span>
          </CardTitle>
          <CardDescription>
            Tranches d'imposition configurées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-3">Impôt sur les Sociétés (IS)</h4>
              <div className="space-y-2">
                {taxBrackets.filter(b => b.type === 'IS').map((bracket, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-medium">
                        {formatCurrency(bracket.min)} - {bracket.max ? formatCurrency(bracket.max) : 'et plus'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-blue-600">{bracket.rate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Impôt sur la Fortune</h4>
              <div className="space-y-2">
                {taxBrackets.filter(b => b.type === 'richesse').map((bracket, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-medium">
                        {formatCurrency(bracket.min)} - {bracket.max ? formatCurrency(bracket.max) : 'et plus'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-purple-600">{bracket.rate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-blue-200 bg-blue-50 card-hover">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Générer Déclaration</span>
            </CardTitle>
            <CardDescription className="text-blue-700">
              Créer une déclaration fiscale PDF
            </CardDescription>
          </CardHeader>
          <CardContent>
          <CardContent>
            <Button className="w-full">Générer PDF</Button>
          </CardContent>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50 card-hover">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center space-x-2">
              <Receipt className="h-4 w-4" />
              <span>Historique</span>
            </CardTitle>
            <CardDescription className="text-green-700">
              Consulter les simulations précédentes
            </CardDescription>
          </CardHeader>
          <CardContent>
          <CardContent>
            <Button variant="outline" className="w-full">Voir l'historique</Button>
          </CardContent>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}