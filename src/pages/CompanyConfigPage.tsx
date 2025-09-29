import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { useState } from 'react'
import { Building, Users, DollarSign, Award, Download, Upload, Save } from 'lucide-react'

export function CompanyConfigPage() {
  const [companyName, setCompanyName] = useState('Mon Entreprise Discord')
  const [companyType, setCompanyType] = useState('SARL')
  
  const grades = [
    { id: '1', name: 'Stagiaire', discordRoleId: '123', caPercentage: 5, hourlyRate: 12 },
    { id: '2', name: 'Junior', discordRoleId: '124', caPercentage: 8, hourlyRate: 18 },
    { id: '3', name: 'Senior', discordRoleId: '125', caPercentage: 12, hourlyRate: 25 },
    { id: '4', name: 'Manager', discordRoleId: '126', caPercentage: 18, hourlyRate: 35 }
  ]

  const employees = [
    { id: '1', discordId: '12345', username: 'JeanDupont#1234', gradeId: '2', status: 'Actif' },
    { id: '2', discordId: '12346', username: 'MartinLucas#5678', gradeId: '3', status: 'Actif' },
    { id: '3', discordId: '12347', username: 'SophieMartin#9012', gradeId: '4', status: 'Actif' }
  ]

  const salaryParameters = [
    { name: 'RUN', active: true, cumulative: false, tiers: 3 },
    { name: 'FACTURE', active: true, cumulative: true, tiers: 5 },
    { name: 'VENTE', active: false, cumulative: false, tiers: 2 },
    { name: 'CA_TOTAL', active: true, cumulative: true, tiers: 4 }
  ]

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Configuration Entreprise</h1>
        <p className="text-muted-foreground">
          Configuration complète de votre entreprise Discord (Accès Patron)
        </p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="company">Entreprise</TabsTrigger>
          <TabsTrigger value="salary">Salaires</TabsTrigger>
          <TabsTrigger value="grades">Grades</TabsTrigger>
          <TabsTrigger value="employees">Employés</TabsTrigger>
          <TabsTrigger value="export">Export/Import</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <span>Identification</span>
                </CardTitle>
                <CardDescription>
                  Informations de base de votre entreprise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nom de l'entreprise</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyType">Type d'entreprise</Label>
                  <select 
                    id="companyType"
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
                    value={companyType}
                    onChange={(e) => setCompanyType(e.target.value)}
                  >
                    <option value="SARL">SARL</option>
                    <option value="SAS">SAS</option>
                    <option value="SA">SA</option>
                    <option value="EURL">EURL</option>
                    <option value="Auto-entrepreneur">Auto-entrepreneur</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Description de l'activité..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guildId">Guild ID Discord</Label>
                  <Input
                    id="guildId"
                    placeholder="123456789012345678"
                    disabled
                    value="123456789"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informations Système</CardTitle>
                <CardDescription>
                  État et statistiques de votre configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-green-800">Employés</p>
                      <p className="text-sm text-green-600">Total actifs</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {employees.filter(e => e.status === 'Actif').length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-blue-800">Grades</p>
                      <p className="text-sm text-blue-600">Configurés</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      {grades.length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <div>
                      <p className="font-medium text-purple-800">Paramètres Salaire</p>
                      <p className="text-sm text-purple-600">Actifs</p>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800">
                      {salaryParameters.filter(p => p.active).length}
                    </Badge>
                  </div>
                </div>
                <Button className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Sauvegarder la Configuration
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="salary" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Configuration Salaires Avancée</span>
              </CardTitle>
              <CardDescription>
                Paramétrage des modes de calcul et des paliers salariaux
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-medium">Paramètres Globaux</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label>Pourcentage CA de base</Label>
                      <Input type="number" className="w-24" placeholder="10" />
                    </div>
                    <div className="flex justify-between items-center">
                      <Label>Bonus de base (€)</Label>
                      <Input type="number" className="w-24" placeholder="200" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Mode de Calcul</h4>
                  <select className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm">
                    <option value="RUN">RUN (Revenus d'Unité Nette)</option>
                    <option value="FACTURE">FACTURE (Facturation)</option>
                    <option value="VENTE">VENTE (Ventes)</option>
                    <option value="CA_TOTAL">CA_TOTAL (Chiffre d'Affaires Total)</option>
                  </select>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-4">Paramètres de Calcul</h4>
                <div className="space-y-3">
                  {salaryParameters.map((param, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <input type="checkbox" checked={param.active} className="rounded" />
                        <div>
                          <p className="font-medium">{param.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {param.cumulative ? 'Mode cumulatif' : 'Mode simple'} • {param.tiers} paliers
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Configurer
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grades" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Gestion des Grades</span>
              </CardTitle>
              <CardDescription>
                Configuration des grades et association avec les rôles Discord
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {grades.map((grade) => (
                  <div key={grade.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{grade.name}</p>
                        <Badge variant="outline">ID: {grade.discordRoleId}</Badge>
                      </div>
                      <div className="flex space-x-4 text-sm text-muted-foreground">
                        <span>CA: {grade.caPercentage}%</span>
                        <span>Taux: €{grade.hourlyRate}/h</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Modifier
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600">
                        Supprimer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full">
                <Award className="mr-2 h-4 w-4" />
                Ajouter un Grade
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Gestion des Employés</span>
              </CardTitle>
              <CardDescription>
                Ajout, modification et gestion des employés
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {employees.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{employee.username}</p>
                      <div className="flex space-x-2">
                        <Badge variant="outline">
                          {grades.find(g => g.id === employee.gradeId)?.name || 'Grade inconnu'}
                        </Badge>
                        <Badge className={employee.status === 'Actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {employee.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Modifier
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600">
                        Désactiver
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex space-x-2">
                <Button className="flex-1">
                  <Users className="mr-2 h-4 w-4" />
                  Ajouter un Employé
                </Button>
                <Button variant="outline" className="flex-1">
                  <Upload className="mr-2 h-4 w-4" />
                  Import CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Export des Données</CardTitle>
                <CardDescription>
                  Sauvegardez votre configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Export JSON Complet
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV Employés
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV Grades
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Import des Données</CardTitle>
                <CardDescription>
                  Importez une configuration existante
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Import JSON
                </Button>
                <Button variant="outline" className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Import CSV Employés
                </Button>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ L'import remplacera la configuration existante
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}