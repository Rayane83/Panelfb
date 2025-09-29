import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { useState } from 'react'
import { Calculator, Users, DollarSign, Download, Plus } from 'lucide-react'
import { formatCurrency } from '../../lib/utils'

interface Employee {
  id: string
  name: string
  grade: string
  baseSalary: number
  bonus: number
  hoursWorked: number
  totalSalary: number
}

interface SalaryCalculation {
  employee: Employee
  baseSalary: number
  bonuses: number
  deductions: number
  netSalary: number
  taxes: number
}

export function SalairesTab() {
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [hoursWorked, setHoursWorked] = useState('')
  const [bonusAmount, setBonusAmount] = useState('')

  const mockEmployees: Employee[] = [
    { id: '1', name: 'Jean Dupont', grade: 'Senior', baseSalary: 3500, bonus: 500, hoursWorked: 160, totalSalary: 4000 },
    { id: '2', name: 'Marie Martin', grade: 'Manager', baseSalary: 4500, bonus: 750, hoursWorked: 165, totalSalary: 5250 },
    { id: '3', name: 'Pierre Durand', grade: 'Junior', baseSalary: 2500, bonus: 200, hoursWorked: 155, totalSalary: 2700 }
  ]

  const grades = [
    { name: 'Junior', baseSalary: 2500, hourlyRate: 15 },
    { name: 'Senior', baseSalary: 3500, hourlyRate: 22 },
    { name: 'Manager', baseSalary: 4500, hourlyRate: 28 },
    { name: 'Director', baseSalary: 6000, hourlyRate: 38 }
  ]

  const calculateSalary = (employee: Employee): SalaryCalculation => {
    const baseSalary = employee.baseSalary
    const bonuses = employee.bonus
    const grossSalary = baseSalary + bonuses
    const taxes = grossSalary * 0.23 // 23% de charges
    const deductions = taxes
    const netSalary = grossSalary - deductions

    return {
      employee,
      baseSalary,
      bonuses,
      deductions,
      netSalary,
      taxes
    }
  }

  const totalPayroll = mockEmployees.reduce((sum, emp) => sum + emp.totalSalary, 0)
  const averageSalary = totalPayroll / mockEmployees.length

  const handleCalculateNew = () => {
    if (selectedEmployee && hoursWorked) {
      console.log('Calculating salary for:', { selectedEmployee, hoursWorked, bonusAmount })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Calcul de Salaires</h2>
        <p className="text-muted-foreground">
          Calculateur avancé avec gestion des grades et qualifications
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Masse Salariale</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPayroll)}</div>
            <p className="text-xs text-muted-foreground">Total mensuel</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employés</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockEmployees.length}</div>
            <p className="text-xs text-muted-foreground">Actifs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salaire Moyen</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageSalary)}</div>
            <p className="text-xs text-muted-foreground">Par employé</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Charges Sociales</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPayroll * 0.23)}</div>
            <p className="text-xs text-muted-foreground">23% du total</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Nouveau Calcul de Salaire</CardTitle>
            <CardDescription>
              Calculez le salaire d'un employé avec bonus et heures
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
                {mockEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.grade})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours">Heures travaillées</Label>
              <Input
                id="hours"
                type="number"
                placeholder="160"
                value={hoursWorked}
                onChange={(e) => setHoursWorked(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bonus">Bonus (€)</Label>
              <Input
                id="bonus"
                type="number"
                placeholder="500"
                value={bonusAmount}
                onChange={(e) => setBonusAmount(e.target.value)}
              />
            </div>
            <Button onClick={handleCalculateNew} className="w-full">
              <Calculator className="mr-2 h-4 w-4" />
              Calculer le Salaire
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Grilles de Salaires</CardTitle>
            <CardDescription>
              Configuration des grades et taux horaires
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {grades.map((grade, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{grade.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Taux: {formatCurrency(grade.hourlyRate)}/h
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(grade.baseSalary)}</p>
                    <p className="text-xs text-muted-foreground">Base mensuelle</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un Grade
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bulletins de Paie</CardTitle>
          <CardDescription>
            Détail des calculs de salaires des employés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockEmployees.map((employee) => {
              const calculation = calculateSalary(employee)
              return (
                <div key={employee.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <Badge variant="outline">{employee.grade}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{formatCurrency(calculation.netSalary)}</p>
                      <p className="text-sm text-muted-foreground">Net à payer</p>
                    </div>
                  </div>
                  
                  <div className="grid gap-2 md:grid-cols-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Salaire de base</p>
                      <p className="font-medium">{formatCurrency(calculation.baseSalary)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Bonus</p>
                      <p className="font-medium">{formatCurrency(calculation.bonuses)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Charges</p>
                      <p className="font-medium text-red-600">-{formatCurrency(calculation.taxes)}</p>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}