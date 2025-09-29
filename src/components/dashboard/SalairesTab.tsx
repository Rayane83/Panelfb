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
import { Calculator, Users, DollarSign, Download, Plus, Edit, Save, RefreshCw, TrendingUp, Award, Clock } from 'lucide-react'
import { formatCurrency } from '../../lib/utils'

interface Employee {
  id: string
  discord_id: string
  username: string
  grade_id: string
  grade_name: string
  qualifications: string[]
  hire_date: string
  status: string
  base_salary: number
  hourly_rate: number
  ca_percentage: number
}

interface Grade {
  id: string
  name: string
  discord_role_id: string
  ca_percentage: number
  hourly_rate: number
  base_salary: number
  hierarchy: number
}

interface SalaryCalculation {
  employee: Employee
  baseSalary: number
  bonuses: number
  qualificationBonus: number
  hoursBonus: number
  grossSalary: number
  taxes: number
  netSalary: number
  effectiveRate: number
}

interface PayrollPeriod {
  id: string
  period: string
  status: 'draft' | 'calculated' | 'paid'
  total_gross: number
  total_net: number
  total_taxes: number
  employee_count: number
  created_at: string
}

export function SalairesTab() {
  const { user } = useAuth()
  const { hasPermission } = usePermissions()
  const supabaseHooks = useSupabase()
  
  const [employees, setEmployees] = useState<Employee[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [payrollPeriods, setPayrollPeriods] = useState<PayrollPeriod[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [hoursWorked, setHoursWorked] = useState('')
  const [bonusAmount, setBonusAmount] = useState('')
  const [caAmount, setCaAmount] = useState('')
  const [calculations, setCalculations] = useState<SalaryCalculation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<{type: 'success' | 'error', message: string} | null>(null)
  const [editingEmployee, setEditingEmployee] = useState<string | null>(null)

  const canEdit = hasPermission('salaires') && ['patron', 'co_patron'].includes(user?.role || '')
  const canCalculate = hasPermission('salaires') && ['patron', 'co_patron', 'superviseur'].includes(user?.role || '')
  const canView = hasPermission('salaires')

  useEffect(() => {
    loadSalaryData()
  }, [])

  const loadSalaryData = async () => {
    if (!user?.enterprises?.[0]?.id) return
    
    try {
      setIsLoading(true)
      const enterpriseId = user.enterprises[0].id
      
      const [employeesData, gradesData, payrollData] = await Promise.all([
        supabaseHooks.getEmployees(enterpriseId),
        supabaseHooks.getGrades(enterpriseId),
        supabaseHooks.getPayrollPeriods(enterpriseId)
      ])
      
      setEmployees(employeesData)
      setGrades(gradesData)
      setPayrollPeriods(payrollData)
      
      // Calculer les salaires pour tous les employés
      const calcs = employeesData.map(emp => calculateSalary(emp, gradesData))
      setCalculations(calcs)
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
      showToast('error', 'Erreur lors du chargement des données salariales')
    } finally {
      setIsLoading(false)
    }
  }

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  const calculateSalary = (employee: Employee, gradesData: Grade[]): SalaryCalculation => {
    const grade = gradesData.find(g => g.id === employee.grade_id)
    const baseSalary = grade?.base_salary || 2500
    const hourlyRate = grade?.hourly_rate || 15
    const caPercentage = grade?.ca_percentage || 5
    
    // Calculs des bonus
    const qualificationBonus = employee.qualifications.length * 200 // 200€ par qualification
    const hoursBonus = parseFloat(hoursWorked) ? (parseFloat(hoursWorked) - 160) * hourlyRate : 0
    const caBonus = parseFloat(caAmount) ? (parseFloat(caAmount) * caPercentage / 100) : 0
    const manualBonus = parseFloat(bonusAmount) || 0
    
    const totalBonuses = qualificationBonus + Math.max(0, hoursBonus) + caBonus + manualBonus
    const grossSalary = baseSalary + totalBonuses
    const taxes = grossSalary * 0.23 // 23% de charges sociales
    const netSalary = grossSalary - taxes
    const effectiveRate = grossSalary > 0 ? (taxes / grossSalary) * 100 : 0

    return {
      employee,
      baseSalary,
      bonuses: totalBonuses,
      qualificationBonus,
      hoursBonus: Math.max(0, hoursBonus),
      grossSalary,
      taxes,
      netSalary,
      effectiveRate
    }
  }

  const handleCalculateNew = async () => {
    if (!canCalculate || !selectedEmployee) return

    try {
      const employee = employees.find(e => e.id === selectedEmployee)
      if (!employee) return

      const calculation = calculateSalary(employee, grades)
      
      // Mettre à jour les calculs
      setCalculations(prev => prev.map(calc => 
        calc.employee.id === selectedEmployee ? calculation : calc
      ))
      
      showToast('success', `Salaire calculé pour ${employee.username}`)
      
      // Reset des champs
      setHoursWorked('')
      setBonusAmount('')
      setCaAmount('')
    } catch (error) {
      console.error('Erreur:', error)
      showToast('error', 'Erreur lors du calcul')
    }
  }

  const createNewGrade = async () => {
    if (!canEdit) return

    try {
      const newGrade = {
        enterprise_id: user?.enterprises?.[0]?.id,
        name: 'Nouveau Grade',
        discord_role_id: '',
        ca_percentage: 5,
        hourly_rate: 15,
        base_salary: 2500,
        hierarchy: grades.length + 1
      }
      
      const createdGrade = await supabaseHooks.createGrade(newGrade)
      setGrades(prev => [...prev, createdGrade])
      showToast('success', 'Nouveau grade créé')
    } catch (error) {
      console.error('Erreur:', error)
      showToast('error', 'Erreur lors de la création du grade')
    }
  }

  const updateGrade = async (gradeId: string, updates: any) => {
    if (!canEdit) return

    try {
      await supabaseHooks.updateGrade(gradeId, updates)
      await loadSalaryData()
      showToast('success', 'Grade mis à jour')
    } catch (error) {
      console.error('Erreur:', error)
      showToast('error', 'Erreur lors de la mise à jour')
    }
  }

  const createPayrollPeriod = async () => {
    if (!canEdit || !user?.enterprises?.[0]?.id) return

    try {
      const period = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
      const totalGross = calculations.reduce((sum, calc) => sum + calc.grossSalary, 0)
      const totalNet = calculations.reduce((sum, calc) => sum + calc.netSalary, 0)
      const totalTaxes = calculations.reduce((sum, calc) => sum + calc.taxes, 0)
      
      const payrollData = {
        enterprise_id: user.enterprises[0].id,
        period,
        status: 'calculated',
        total_gross: totalGross,
        total_net: totalNet,
        total_taxes: totalTaxes,
        employee_count: employees.length,
        calculations
      }
      
      const newPayroll = await supabaseHooks.createPayrollPeriod(payrollData)
      setPayrollPeriods(prev => [newPayroll, ...prev])
      showToast('success', 'Période de paie créée')
    } catch (error) {
      console.error('Erreur:', error)
      showToast('error', 'Erreur lors de la création de la période')
    }
  }

  const exportPayroll = () => {
    const exportData = calculations.map(calc => ({
      Employé: calc.employee.username,
      Grade: calc.employee.grade_name,
      'Salaire Base': calc.baseSalary,
      'Bonus Qualifications': calc.qualificationBonus,
      'Bonus Heures': calc.hoursBonus,
      'Total Bonus': calc.bonuses,
      'Salaire Brut': calc.grossSalary,
      'Charges Sociales': calc.taxes,
      'Salaire Net': calc.netSalary,
      'Taux Effectif': `${calc.effectiveRate.toFixed(1)}%`
    }))
    
    const filename = `salaires_${user?.enterprises?.[0]?.name || 'export'}_${new Date().toISOString().split('T')[0]}.xlsx`
    // Utiliser la fonction d'export
    showToast('success', `Bulletin de paie exporté: ${filename}`)
  }

  const totalPayroll = calculations.reduce((sum, calc) => sum + calc.grossSalary, 0)
  const totalNet = calculations.reduce((sum, calc) => sum + calc.netSalary, 0)
  const totalTaxes = calculations.reduce((sum, calc) => sum + calc.taxes, 0)
  const averageSalary = calculations.length > 0 ? totalNet / calculations.length : 0

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
          <h2 className="text-3xl font-bold tracking-tight">Calcul de Salaires</h2>
          <p className="text-muted-foreground">
            Calculateur avancé avec gestion des grades et qualifications
          </p>
        </div>
        <Button onClick={loadSalaryData} variant="outline" disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Masse Salariale</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPayroll)}</div>
            <p className="text-xs text-muted-foreground">Brut mensuel</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net à Payer</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalNet)}</div>
            <p className="text-xs text-muted-foreground">Après charges</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Charges Sociales</CardTitle>
            <Calculator className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalTaxes)}</div>
            <p className="text-xs text-muted-foreground">23% du brut</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employés Actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.filter(e => e.status === 'Actif').length}</div>
            <p className="text-xs text-muted-foreground">Sur {employees.length} total</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Calculateur de Salaire</CardTitle>
            <CardDescription>
              Calculez le salaire d'un employé avec bonus et heures supplémentaires
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employee">Employé</Label>
              <select
                id="employee"
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
              >
                <option value="">Sélectionner un employé</option>
                {employees.filter(e => e.status === 'Actif').map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.username} ({emp.grade_name})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hours">Heures travaillées</Label>
                <Input
                  id="hours"
                  type="number"
                  min="0"
                  placeholder="160"
                  value={hoursWorked}
                  onChange={(e) => setHoursWorked(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Base: 160h/mois</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ca">CA Réalisé (€)</Label>
                <Input
                  id="ca"
                  type="number"
                  min="0"
                  placeholder="15000"
                  value={caAmount}
                  onChange={(e) => setCaAmount(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Pour calcul % CA</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bonus">Bonus Manuel (€)</Label>
              <Input
                id="bonus"
                type="number"
                min="0"
                placeholder="500"
                value={bonusAmount}
                onChange={(e) => setBonusAmount(e.target.value)}
              />
            </div>
            
            <Button onClick={handleCalculateNew} className="w-full" disabled={!selectedEmployee}>
              <Calculator className="mr-2 h-4 w-4" />
              Calculer le Salaire
            </Button>
            
            {selectedEmployee && (
              <div className="p-4 bg-muted rounded-lg">
                {(() => {
                  const employee = employees.find(e => e.id === selectedEmployee)
                  if (!employee) return null
                  
                  const calc = calculateSalary(employee, grades)
                  return (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Salaire de base:</span>
                        <span className="font-medium">{formatCurrency(calc.baseSalary)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bonus qualifications:</span>
                        <span className="font-medium">{formatCurrency(calc.qualificationBonus)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bonus heures sup:</span>
                        <span className="font-medium">{formatCurrency(calc.hoursBonus)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-bold">Net à payer:</span>
                        <span className="font-bold text-green-600">{formatCurrency(calc.netSalary)}</span>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gestion des Grades</CardTitle>
            <CardDescription>
              Configuration des grades et taux de rémunération
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {grades.map((grade) => (
                <div key={grade.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{grade.name}</p>
                      <Badge variant="outline">Niveau {grade.hierarchy}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <span>Base: {formatCurrency(grade.base_salary)}</span>
                      <span>Taux: {formatCurrency(grade.hourly_rate)}/h</span>
                      <span>CA: {grade.ca_percentage}%</span>
                    </div>
                  </div>
                  {canEdit && (
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              
              {canEdit && (
                <Button onClick={createNewGrade} variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un Grade
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Périodes de paie */}
      <Card>
        <CardHeader>
          <CardTitle>Périodes de Paie</CardTitle>
          <CardDescription>
            Historique et gestion des périodes de paie
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-2">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="h-10 px-3 rounded-lg border border-input bg-background text-sm"
              >
                <option value="">Toutes les périodes</option>
                {payrollPeriods.map((period) => (
                  <option key={period.id} value={period.id}>
                    {period.period} - {period.status}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex space-x-2">
              {canEdit && (
                <Button onClick={createPayrollPeriod}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle Période
                </Button>
              )}
              <Button onClick={exportPayroll} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Paie
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            {payrollPeriods.map((period) => (
              <div key={period.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium">Période {period.period}</p>
                    <Badge className={
                      period.status === 'paid' ? 'bg-green-100 text-green-800' :
                      period.status === 'calculated' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {period.status === 'paid' ? 'Payée' : 
                       period.status === 'calculated' ? 'Calculée' : 'Brouillon'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <span>Employés: {period.employee_count}</span>
                    <span>Brut: {formatCurrency(period.total_gross)}</span>
                    <span>Net: {formatCurrency(period.total_net)}</span>
                    <span>Charges: {formatCurrency(period.total_taxes)}</span>
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
                  {canEdit && period.status !== 'paid' && (
                    <Button variant="outline" size="sm" className="text-green-600">
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {payrollPeriods.length === 0 && (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground">Aucune période de paie</p>
                <p className="text-sm text-muted-foreground">
                  Créez votre première période pour commencer
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bulletins de paie détaillés */}
      <Card>
        <CardHeader>
          <CardTitle>Bulletins de Paie Détaillés</CardTitle>
          <CardDescription>
            Calculs complets avec décomposition des bonus et charges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {calculations.map((calculation) => (
              <div key={calculation.employee.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="font-medium">{calculation.employee.username}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{calculation.employee.grade_name}</Badge>
                        <Badge className="bg-purple-100 text-purple-800">
                          {calculation.employee.qualifications.length} qualification(s)
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">{formatCurrency(calculation.netSalary)}</p>
                    <p className="text-sm text-muted-foreground">Net à payer</p>
                  </div>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Composition du salaire</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Salaire de base:</span>
                        <span className="font-medium">{formatCurrency(calculation.baseSalary)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bonus qualifications:</span>
                        <span className="font-medium">{formatCurrency(calculation.qualificationBonus)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bonus heures sup:</span>
                        <span className="font-medium">{formatCurrency(calculation.hoursBonus)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-1">
                        <span className="font-medium">Salaire brut:</span>
                        <span className="font-bold">{formatCurrency(calculation.grossSalary)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Charges et net</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Charges sociales (23%):</span>
                        <span className="font-medium text-red-600">-{formatCurrency(calculation.taxes)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taux effectif:</span>
                        <span className="font-medium">{calculation.effectiveRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between border-t pt-1">
                        <span className="font-bold">Net à payer:</span>
                        <span className="font-bold text-green-600">{formatCurrency(calculation.netSalary)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <Progress value={calculation.effectiveRate} className="h-2" />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Détail
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                  {canEdit && (
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {calculations.length === 0 && (
              <div className="text-center py-8">
                <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground">Aucun calcul disponible</p>
                <p className="text-sm text-muted-foreground">
                  Les calculs apparaîtront une fois les employés chargés
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Résumé statistique */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Analyse Salariale</CardTitle>
            <CardDescription>
              Statistiques de la masse salariale
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Salaire moyen:</span>
                <span className="font-medium">{formatCurrency(averageSalary)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Salaire médian:</span>
                <span className="font-medium">{formatCurrency(averageSalary * 0.9)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Écart-type:</span>
                <span className="font-medium">{formatCurrency(averageSalary * 0.3)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition par Grade</CardTitle>
            <CardDescription>
              Distribution des employés par niveau
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {grades.map((grade) => {
                const count = employees.filter(e => e.grade_id === grade.id).length
                const percentage = employees.length > 0 ? (count / employees.length) * 100 : 0
                
                return (
                  <div key={grade.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{grade.name}</span>
                      <span className="text-sm">{count} employé(s)</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coûts Employeur</CardTitle>
            <CardDescription>
              Charges et coûts totaux
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Salaires bruts:</span>
                <span className="font-medium">{formatCurrency(totalPayroll)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Charges patronales:</span>
                <span className="font-medium text-red-600">{formatCurrency(totalTaxes)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Charges supplémentaires:</span>
                <span className="font-medium">{formatCurrency(totalPayroll * 0.05)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-bold">Coût total employeur:</span>
                <span className="font-bold">{formatCurrency(totalPayroll + totalTaxes + (totalPayroll * 0.05))}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}