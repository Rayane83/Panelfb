import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { 
  Building, 
  Users, 
  Settings, 
  Save, 
  Upload, 
  Download,
  Plus,
  Trash2,
  Edit
} from 'lucide-react'

export function CompanyConfigPage() {
  const [companyInfo, setCompanyInfo] = useState({
    name: 'FlashbackFA Enterprise',
    type: 'SARL',
    description: 'Entreprise de services numériques',
    contact: 'contact@flashbackfa.fr'
  })

  const [grades, setGrades] = useState([
    {
      id: '1',
      name: 'Directeur',
      discordRoleId: '123456789',
      caPercentage: 25,
      hourlyRate: 50,
      hierarchy: 5
    },
    {
      id: '2',
      name: 'Manager',
      discordRoleId: '987654321',
      caPercentage: 15,
      hourlyRate: 35,
      hierarchy: 4
    },
    {
      id: '3',
      name: 'Employé',
      discordRoleId: '456789123',
      caPercentage: 10,
      hourlyRate: 25,
      hierarchy: 3
    }
  ])

  const [employees, setEmployees] = useState([
    {
      id: '1',
      discordId: '111111111',
      username: 'Jean Dupont',
      gradeId: '1',
      qualifications: ['Management', 'Vente'],
      hireDate: '2023-01-15',
      status: 'Actif'
    },
    {
      id: '2',
      discordId: '222222222',
      username: 'Marie Martin',
      gradeId: '2',
      qualifications: ['Comptabilité'],
      hireDate: '2023-03-20',
      status: 'Actif'
    }
  ])

  const handleSaveCompany = () => {
    console.log('Sauvegarde entreprise:', companyInfo)
    alert('Configuration entreprise sauvegardée !')
  }

  const handleExportData = () => {
    const data = {
      company: companyInfo,
      grades,
      employees
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'company-config.json'
    a.click()
  }

  const getGradeName = (gradeId: string) => {
    return grades.find(g => g.id === gradeId)?.name || 'Inconnu'
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuration Entreprise</h1>
          <p className="text-muted-foreground">
            Gestion complète de votre entreprise et de vos employés
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button onClick={handleSaveCompany} className="btn-glow">
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder
          </Button>
        </div>
      </div>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>Informations Entreprise</span>
          </CardTitle>
          <CardDescription>
            Configuration de base de votre entreprise
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">
                Nom de l'entreprise
              </label>
              <input
                type="text"
                value={companyInfo.name}
                onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Type d'entreprise
              </label>
              <select
                value={companyInfo.type}
                onChange={(e) => setCompanyInfo({...companyInfo, type: e.target.value})}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background"
              >
                <option value="SARL">SARL</option>
                <option value="SAS">SAS</option>
                <option value="EURL">EURL</option>
                <option value="SA">SA</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              value={companyInfo.description}
              onChange={(e) => setCompanyInfo({...companyInfo, description: e.target.value})}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Contact
            </label>
            <input
              type="email"
              value={companyInfo.contact}
              onChange={(e) => setCompanyInfo({...companyInfo, contact: e.target.value})}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background"
            />
          </div>
        </CardContent>
      </Card>

      {/* Grades Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Gestion des Grades</span>
            </div>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter Grade
            </Button>
          </CardTitle>
          <CardDescription>
            Configuration des grades avec mapping Discord
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {grades.map((grade) => (
              <div key={grade.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-medium">{grade.name}</h4>
                    <Badge>Niveau {grade.hierarchy}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    CA: {grade.caPercentage}% • 
                    Taux horaire: {grade.hourlyRate}€ • 
                    Discord: {grade.discordRoleId}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Employee Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Gestion des Employés</span>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import CSV
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter Employé
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Gestion de vos employés avec liaison Discord
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employees.map((employee) => (
              <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-medium">{employee.username}</h4>
                    <Badge className="bg-green-100 text-green-800">{employee.status}</Badge>
                    <Badge variant="outline">{getGradeName(employee.gradeId)}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Discord: {employee.discordId} • 
                    Embauché: {new Date(employee.hireDate).toLocaleDateString('fr-FR')} • 
                    Qualifications: {employee.qualifications.join(', ')}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
            <CardTitle className="text-blue-800">Sauvegarde Locale</CardTitle>
            <CardDescription className="text-blue-700">
              Exporter la configuration complète
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" />
              Télécharger JSON
            </Button>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50 card-hover">
          <CardHeader>
            <CardTitle className="text-green-800">Import CSV</CardTitle>
            <CardDescription className="text-green-700">
              Importer des employés en masse
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Choisir Fichier
            </Button>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50 card-hover">
          <CardHeader>
            <CardTitle className="text-purple-800">Synchronisation</CardTitle>
            <CardDescription className="text-purple-700">
              Synchroniser avec Discord
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Synchroniser
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}