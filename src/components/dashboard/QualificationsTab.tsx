import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Award, Plus, Users, TrendingUp, Star, BookOpen } from 'lucide-react'

export function QualificationsTab() {
  const [qualifications] = useState([
    {
      id: '1',
      name: 'Certification Sécurité',
      description: 'Formation aux normes de sécurité en entreprise',
      category: 'Sécurité',
      salaryImpact: 150,
      validityMonths: 24,
      required: true
    },
    {
      id: '2',
      name: 'Management d\'Équipe',
      description: 'Compétences en gestion et leadership',
      category: 'Management',
      salaryImpact: 300,
      validityMonths: 36,
      required: false
    },
    {
      id: '3',
      name: 'Comptabilité Avancée',
      description: 'Maîtrise des outils comptables et fiscaux',
      category: 'Finance',
      salaryImpact: 200,
      validityMonths: 12,
      required: false
    }
  ])

  const [employeeQualifications] = useState([
    {
      employeeId: '1',
      employeeName: 'Jean Dupont',
      grade: 'Directeur',
      qualifications: [
        { qualificationId: '1', obtainedDate: '2023-06-15', expiryDate: '2025-06-15', status: 'Valide' },
        { qualificationId: '2', obtainedDate: '2023-03-20', expiryDate: '2026-03-20', status: 'Valide' }
      ],
      totalSalaryBonus: 450
    },
    {
      employeeId: '2',
      employeeName: 'Marie Martin',
      grade: 'Manager',
      qualifications: [
        { qualificationId: '1', obtainedDate: '2023-08-10', expiryDate: '2025-08-10', status: 'Valide' },
        { qualificationId: '3', obtainedDate: '2023-12-01', expiryDate: '2024-12-01', status: 'Expire bientôt' }
      ],
      totalSalaryBonus: 350
    },
    {
      employeeId: '3',
      employeeName: 'Pierre Durand',
      grade: 'Employé',
      qualifications: [
        { qualificationId: '1', obtainedDate: '2023-09-15', expiryDate: '2025-09-15', status: 'Valide' }
      ],
      totalSalaryBonus: 150
    }
  ])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const getQualificationName = (qualificationId: string) => {
    return qualifications.find(q => q.id === qualificationId)?.name || 'Qualification inconnue'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Valide': return 'bg-green-100 text-green-800'
      case 'Expire bientôt': return 'bg-yellow-100 text-yellow-800'
      case 'Expiré': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Sécurité': return 'bg-red-100 text-red-800'
      case 'Management': return 'bg-blue-100 text-blue-800'
      case 'Finance': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const totalQualifications = qualifications.length
  const totalEmployeesWithQualifications = employeeQualifications.length
  const totalSalaryImpact = employeeQualifications.reduce((sum, emp) => sum + emp.totalSalaryBonus, 0)
  const expiringQualifications = employeeQualifications.reduce((count, emp) => 
    count + emp.qualifications.filter(q => q.status === 'Expire bientôt').length, 0
  )

  const stats = [
    {
      title: "Qualifications Disponibles",
      value: totalQualifications.toString(),
      description: "Types de certifications",
      icon: Award,
      color: "text-blue-600"
    },
    {
      title: "Employés Qualifiés",
      value: totalEmployeesWithQualifications.toString(),
      description: "Avec certifications",
      icon: Users,
      color: "text-green-600"
    },
    {
      title: "Impact Salarial",
      value: formatCurrency(totalSalaryImpact),
      description: "Primes totales",
      icon: TrendingUp,
      color: "text-purple-600"
    },
    {
      title: "Expirations Proches",
      value: expiringQualifications.toString(),
      description: "À renouveler",
      icon: Star,
      color: "text-orange-600"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestion des Qualifications</h2>
          <p className="text-muted-foreground">
            Attribution et suivi des qualifications avec impact salarial
          </p>
        </div>
        <Button className="btn-glow">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Qualification
        </Button>
      </div>

      {/* Stats */}
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

      {/* Available Qualifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Qualifications Disponibles</span>
          </CardTitle>
          <CardDescription>
            Catalogue des certifications et leur impact salarial
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {qualifications.map((qualification) => (
              <div key={qualification.id} className="flex items-center justify-between p-4 border rounded-lg card-hover">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-medium">{qualification.name}</h4>
                    <Badge className={getCategoryColor(qualification.category)}>
                      {qualification.category}
                    </Badge>
                    {qualification.required && (
                      <Badge variant="outline" className="border-red-500 text-red-700">
                        Obligatoire
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {qualification.description}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Impact salarial: {formatCurrency(qualification.salaryImpact)}/mois • 
                    Validité: {qualification.validityMonths} mois
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    Modifier
                  </Button>
                  <Button variant="outline" size="sm">
                    Attribuer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Employee Qualifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Qualifications des Employés</span>
          </CardTitle>
          <CardDescription>
            Suivi des certifications par employé
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {employeeQualifications.map((employee) => (
              <div key={employee.employeeId} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-medium text-lg">{employee.employeeName}</h4>
                    <Badge variant="outline">{employee.grade}</Badge>
                    <Badge className="bg-green-100 text-green-800">
                      Prime: {formatCurrency(employee.totalSalaryBonus)}/mois
                    </Badge>
                  </div>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter Qualification
                  </Button>
                </div>
                
                <div className="grid gap-3 md:grid-cols-2">
                  {employee.qualifications.map((qual, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">
                          {getQualificationName(qual.qualificationId)}
                        </span>
                        <Badge className={getStatusColor(qual.status)} size="sm">
                          {qual.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Obtenue: {new Date(qual.obtainedDate).toLocaleDateString('fr-FR')} • 
                        Expire: {new Date(qual.expiryDate).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  ))}
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
            <CardTitle className="text-blue-800">Rapport Qualifications</CardTitle>
            <CardDescription className="text-blue-700">
              Générer un rapport complet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Générer Rapport
            </Button>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50 card-hover">
          <CardHeader>
            <CardTitle className="text-orange-800">Alertes Expiration</CardTitle>
            <CardDescription className="text-orange-700">
              Gérer les renouvellements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Voir Alertes
            </Button>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50 card-hover">
          <CardHeader>
            <CardTitle className="text-green-800">Formation</CardTitle>
            <CardDescription className="text-green-700">
              Planifier des formations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Planifier
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}