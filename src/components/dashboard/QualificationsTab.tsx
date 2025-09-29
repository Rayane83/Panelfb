import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { useState } from 'react'
import { Award, User, Plus, Star, Calendar, TrendingUp } from 'lucide-react'

interface Qualification {
  id: string
  name: string
  level: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
  salaryBonus: number
  description: string
  requirements: string[]
}

interface EmployeeQualification {
  employeeId: string
  employeeName: string
  qualifications: (Qualification & { dateObtained: Date })[]
  totalBonus: number
}

export function QualificationsTab() {
  const [newQualName, setNewQualName] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState('')

  const mockQualifications: Qualification[] = [
    {
      id: '1',
      name: 'Expert Comptabilité',
      level: 'Gold',
      salaryBonus: 500,
      description: 'Maîtrise avancée des systèmes comptables',
      requirements: ['5 ans d\'expérience', 'Certification CPA']
    },
    {
      id: '2',
      name: 'Gestion d\'Équipe',
      level: 'Silver',
      salaryBonus: 300,
      description: 'Compétences en management et leadership',
      requirements: ['Formation management', '3 ans d\'expérience']
    },
    {
      id: '3',
      name: 'Analyse Fiscale',
      level: 'Platinum',
      salaryBonus: 750,
      description: 'Spécialiste en optimisation fiscale',
      requirements: ['Master Fiscalité', 'Certification expert-comptable']
    },
    {
      id: '4',
      name: 'Communication Client',
      level: 'Bronze',
      salaryBonus: 150,
      description: 'Excellence en relation client',
      requirements: ['Formation communication', '1 an d\'expérience']
    }
  ]

  const mockEmployeeQualifications: EmployeeQualification[] = [
    {
      employeeId: '1',
      employeeName: 'Jean Dupont',
      qualifications: [
        { ...mockQualifications[0], dateObtained: new Date(2023, 5, 15) },
        { ...mockQualifications[1], dateObtained: new Date(2023, 8, 20) }
      ],
      totalBonus: 800
    },
    {
      employeeId: '2',
      employeeName: 'Marie Martin',
      qualifications: [
        { ...mockQualifications[2], dateObtained: new Date(2023, 3, 10) },
        { ...mockQualifications[3], dateObtained: new Date(2023, 7, 5) }
      ],
      totalBonus: 900
    }
  ]

  const levelColors = {
    'Bronze': 'bg-amber-100 text-amber-800',
    'Silver': 'bg-gray-100 text-gray-800',
    'Gold': 'bg-yellow-100 text-yellow-800',
    'Platinum': 'bg-purple-100 text-purple-800'
  }

  const levelIcons = {
    'Bronze': '🥉',
    'Silver': '🥈',
    'Gold': '🥇',
    'Platinum': '💎'
  }

  const totalQualifications = mockQualifications.length
  const averageBonus = mockQualifications.reduce((sum, q) => sum + q.salaryBonus, 0) / totalQualifications
  const totalEmployeesWithQual = mockEmployeeQualifications.length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Gestion des Qualifications</h2>
        <p className="text-muted-foreground">
          Attribuez et gérez les qualifications des employés avec impact salarial
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Qualifications</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQualifications}</div>
            <p className="text-xs text-muted-foreground">Disponibles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bonus Moyen</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{Math.round(averageBonus)}</div>
            <p className="text-xs text-muted-foreground">Par qualification</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employés Qualifiés</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployeesWithQual}</div>
            <p className="text-xs text-muted-foreground">Avec qualifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impact Total</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{mockEmployeeQualifications.reduce((sum, eq) => sum + eq.totalBonus, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Bonus mensuels</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Nouvelle Qualification</CardTitle>
            <CardDescription>
              Créez une nouvelle qualification avec bonus salarial
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qualName">Nom de la qualification</Label>
              <Input
                id="qualName"
                placeholder="Expert en..."
                value={newQualName}
                onChange={(e) => setNewQualName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">Niveau</Label>
              <select className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm">
                <option value="bronze">Bronze (+€150)</option>
                <option value="silver">Silver (+€300)</option>
                <option value="gold">Gold (+€500)</option>
                <option value="platinum">Platinum (+€750)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Description de la qualification..."
              />
            </div>
            <Button className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Créer la Qualification
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attribution Rapide</CardTitle>
            <CardDescription>
              Attribuez une qualification à un employé
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
                <option value="1">Jean Dupont</option>
                <option value="2">Marie Martin</option>
                <option value="3">Pierre Durand</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="qualification">Qualification</Label>
              <select className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm">
                <option value="">Sélectionner une qualification</option>
                {mockQualifications.map((qual) => (
                  <option key={qual.id} value={qual.id}>
                    {qual.name} ({qual.level}) - +€{qual.salaryBonus}
                  </option>
                ))}
              </select>
            </div>
            <Button variant="outline" className="w-full">
              <Award className="mr-2 h-4 w-4" />
              Attribuer la Qualification
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Catalogue des Qualifications</CardTitle>
          <CardDescription>
            Toutes les qualifications disponibles avec leurs avantages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {mockQualifications.map((qualification) => (
              <div key={qualification.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{levelIcons[qualification.level]}</span>
                    <h4 className="font-medium">{qualification.name}</h4>
                  </div>
                  <Badge className={levelColors[qualification.level]}>
                    {qualification.level}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {qualification.description}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Bonus salarial:</span>
                    <span className="font-bold text-green-600">+€{qualification.salaryBonus}</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Prérequis:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {qualification.requirements.map((req, index) => (
                        <li key={index} className="flex items-center space-x-1">
                          <span>•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Employés et leurs Qualifications</CardTitle>
          <CardDescription>
            Vue d'ensemble des qualifications par employé
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {mockEmployeeQualifications.map((employeeQual) => (
              <div key={employeeQual.employeeId} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <h4 className="font-medium">{employeeQual.employeeName}</h4>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">+€{employeeQual.totalBonus}/mois</p>
                    <p className="text-xs text-muted-foreground">Bonus total</p>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {employeeQual.qualifications.map((qual, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex items-center space-x-2">
                        <span>{levelIcons[qual.level]}</span>
                        <div>
                          <p className="text-sm font-medium">{qual.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Obtenue le {qual.dateObtained.toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <Badge className={levelColors[qual.level]} variant="outline">
                        +€{qual.salaryBonus}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}