import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Users, Calculator, FileText, TrendingUp, Clock, DollarSign } from 'lucide-react'

export function SalairesTab() {
  const [selectedMonth, setSelectedMonth] = useState('2024-01')
  
  const [salaryData] = useState([
    {
      id: '1',
      employeeName: 'Jean Dupont',
      grade: 'Directeur',
      baseSalary: 3500,
      caBonus: 850,
      qualificationBonus: 200,
      hoursWorked: 160,
      overtime: 8,
      grossSalary: 4550,
      netSalary: 3458,
      socialCharges: 1092
    },
    {
      id: '2',
      employeeName: 'Marie Martin',
      grade: 'Manager',
      baseSalary: 2800,
      caBonus: 420,
      qualificationBonus: 150,
      hoursWorked: 152,
      overtime: 0,
      grossSalary: 3370,
      netSalary: 2561,
      socialCharges: 809
    },
    {
      id: '3',
      employeeName: 'Pierre Durand',
      grade: 'Employé',
      baseSalary: 2200,
      caBonus: 275,
      qualificationBonus: 0,
      hoursWorked: 160,
      overtime: 12,
      grossSalary: 2475,
      netSalary: 1881,
      socialCharges: 594
    }
  ])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const totalGrossSalary = salaryData.reduce((sum, emp) => sum + emp.grossSalary, 0)
  const totalNetSalary = salaryData.reduce((sum, emp) => sum + emp.netSalary, 0)
  const totalSocialCharges = salaryData.reduce((sum, emp) => sum + emp.socialCharges, 0)
  const totalHours = salaryData.reduce((sum, emp) => sum + emp.hoursWorked + emp.overtime, 0)

  const stats = [
    {
      title: "Masse Salariale Brute",
      value: formatCurrency(totalGrossSalary),
      description: "Total brut",
      icon: DollarSign,
      color: "text-blue-600"
    },
    {
      title: "Masse Salariale Nette",
      value: formatCurrency(totalNetSalary),
      description: "Total net",
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      title: "Charges Sociales",
      value: formatCurrency(totalSocialCharges),
      description: "Total charges",
      icon: Calculator,
      color: "text-red-600"
    },
    {
      title: "Heures Travaillées",
      value: totalHours.toString(),
      description: "Total heures",
      icon: Clock,
      color: "text-purple-600"
    }
  ]

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'Directeur': return 'bg-purple-100 text-purple-800'
      case 'Manager': return 'bg-blue-100 text-blue-800'
      case 'Employé': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Calcul de Salaires</h2>
          <p className="text-muted-foreground">
            Gestion complète des salaires avec calculs automatiques
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-input rounded-lg bg-background"
          >
            <option value="2024-01">Janvier 2024</option>
            <option value="2023-12">Décembre 2023</option>
            <option value="2023-11">Novembre 2023</option>
          </select>
          <Button className="btn-glow">
            <Calculator className="h-4 w-4 mr-2" />
            Calculer Salaires
          </Button>
        </div>
      </div>

      {/* Salary Stats */}
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

      {/* Salary Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>Calculateur de Salaire</span>
          </CardTitle>
          <CardDescription>
            Calcul automatique basé sur les paramètres configurés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                CA Réalisé (€)
              </label>
              <input
                type="number"
                placeholder="5000"
                className="w-full px-3 py-2 border border-input rounded-lg bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Grade
              </label>
              <select className="w-full px-3 py-2 border border-input rounded-lg bg-background">
                <option value="directeur">Directeur</option>
                <option value="manager">Manager</option>
                <option value="employe">Employé</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Heures Travaillées
              </label>
              <input
                type="number"
                placeholder="160"
                className="w-full px-3 py-2 border border-input rounded-lg bg-background"
              />
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                Calculer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Salaries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Salaires des Employés - {selectedMonth}</span>
          </CardTitle>
          <CardDescription>
            Détail des calculs de salaire par employé
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {salaryData.map((employee) => (
              <div key={employee.id} className="p-4 border rounded-lg card-hover">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-medium text-lg">{employee.employeeName}</h4>
                    <Badge className={getGradeColor(employee.grade)}>
                      {employee.grade}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(employee.netSalary)}
                    </div>
                    <div className="text-sm text-muted-foreground">Salaire net</div>
                  </div>
                </div>
                
                <div className="grid gap-4 md:grid-cols-4 text-sm">
                  <div>
                    <div className="font-medium text-muted-foreground">Salaire de base</div>
                    <div className="font-semibold">{formatCurrency(employee.baseSalary)}</div>
                  </div>
                  <div>
                    <div className="font-medium text-muted-foreground">Prime CA</div>
                    <div className="font-semibold text-blue-600">{formatCurrency(employee.caBonus)}</div>
                  </div>
                  <div>
                    <div className="font-medium text-muted-foreground">Prime qualification</div>
                    <div className="font-semibold text-purple-600">{formatCurrency(employee.qualificationBonus)}</div>
                  </div>
                  <div>
                    <div className="font-medium text-muted-foreground">Charges sociales</div>
                    <div className="font-semibold text-red-600">{formatCurrency(employee.socialCharges)}</div>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t flex justify-between items-center text-sm">
                  <div>
                    <span className="text-muted-foreground">Heures: </span>
                    <span className="font-medium">{employee.hoursWorked}h normales</span>
                    {employee.overtime > 0 && (
                      <span className="text-orange-600 ml-2">+ {employee.overtime}h sup.</span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-1" />
                      Bulletin
                    </Button>
                    <Button variant="outline" size="sm">
                      Modifier
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-blue-200 bg-blue-50 card-hover">
          <CardHeader>
            <CardTitle className="text-blue-800">Export Bulletins</CardTitle>
            <CardDescription className="text-blue-700">
              Générer tous les bulletins de paie
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <FileText className="h-4 w-4 mr-2" />
              Générer PDF
            </Button>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50 card-hover">
          <CardHeader>
            <CardTitle className="text-green-800">Déclarations</CardTitle>
            <CardDescription className="text-green-700">
              Préparer les déclarations sociales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Préparer URSSAF
            </Button>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50 card-hover">
          <CardHeader>
            <CardTitle className="text-purple-800">Historique</CardTitle>
            <CardDescription className="text-purple-700">
              Consulter l'historique des paies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Voir Historique
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}