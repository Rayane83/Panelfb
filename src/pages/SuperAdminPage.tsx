import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { useState } from 'react'
import { 
  Shield, 
  Building, 
  Receipt, 
  Shuffle, 
  Users, 
  Settings, 
  AlertTriangle,
  Server,
  Database
} from 'lucide-react'

export function SuperAdminPage() {
  const [newTaxRate, setNewTaxRate] = useState('')
  
  const enterprises = [
    { id: '1', name: 'Tech Corp', owner: 'Jean Dupont', status: 'Active', employees: 15 },
    { id: '2', name: 'Service Plus', owner: 'Marie Martin', status: 'Active', employees: 8 },
    { id: '3', name: 'Digital Agency', owner: 'Pierre Durant', status: 'Suspended', employees: 22 }
  ]

  const taxBrackets = [
    { min: 0, max: 10000, rate: 0 },
    { min: 10000, max: 25000, rate: 11 },
    { min: 25000, max: 50000, rate: 30 },
    { min: 50000, max: 100000, rate: 41 },
    { min: 100000, max: Infinity, rate: 45 }
  ]

  const systemStats = [
    { label: 'Entreprises Actives', value: enterprises.filter(e => e.status === 'Active').length, color: 'text-green-600' },
    { label: 'Utilisateurs Total', value: enterprises.reduce((sum, e) => sum + e.employees, 0), color: 'text-blue-600' },
    { label: 'Taux Fiscal Moyen', value: '28.5%', color: 'text-purple-600' },
    { label: 'Uptime Système', value: '99.8%', color: 'text-green-600' }
  ]

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex items-center space-x-3">
        <div className="p-2 bg-red-100 rounded-lg">
          <Shield className="h-6 w-6 text-red-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-red-600">Administration Système</h1>
          <p className="text-muted-foreground">
            Panel de contrôle complet - Accès Fondateur et Superviseurs
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        {systemStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold mb-2 text-center">{stat.value}</div>
              <p className="text-sm text-muted-foreground text-center">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="enterprises" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="enterprises">Entreprises</TabsTrigger>
          <TabsTrigger value="discord">Discord</TabsTrigger>
          <TabsTrigger value="taxes">Impôts</TabsTrigger>
          <TabsTrigger value="laundering">Blanchiment</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="system">Système</TabsTrigger>
        </TabsList>

        <TabsContent value="enterprises" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Gestion des Entreprises</span>
              </CardTitle>
              <CardDescription>
                Vue d'ensemble et gestion de toutes les entreprises du système
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {enterprises.map((enterprise) => (
                  <div key={enterprise.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{enterprise.name}</p>
                        <Badge className={enterprise.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {enterprise.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Propriétaire: {enterprise.owner} • {enterprise.employees} employés
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Gérer
                      </Button>
                      <Button variant="outline" size="sm">
                        Auditer
                      </Button>
                      {enterprise.status === 'Active' ? (
                        <Button variant="outline" size="sm" className="text-red-600">
                          Suspendre
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="text-green-600">
                          Activer
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4">
                <Building className="mr-2 h-4 w-4" />
                Créer Nouvelle Entreprise
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discord" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Server className="h-5 w-5" />
                  <span>Configuration Discord</span>
                </CardTitle>
                <CardDescription>
                  Paramètres globaux d'intégration Discord
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Client ID Discord</label>
                  <Input placeholder="123456789012345678" disabled value="••••••••••••5678" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Client Secret</label>
                  <Input type="password" placeholder="Secret Key" disabled value="••••••••••••••••" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Redirect URI</label>
                  <Input value="https://app.discord-enterprise.com/auth/callback" disabled />
                </div>
                <Button variant="outline" className="w-full">
                  Tester la Connexion
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rôles et Permissions</CardTitle>
                <CardDescription>
                  Mapping des rôles Discord vers les permissions système
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { role: 'Fondateur', permission: 'Accès total + promotion Superviseurs', color: 'bg-red-100 text-red-800' },
                    { role: 'Superviseur', permission: 'Administration (nommé par Fondateur)', color: 'bg-purple-100 text-purple-800' },
                    { role: 'DOT', permission: 'Fiscalité inter-entreprises', color: 'bg-blue-100 text-blue-800' },
                    { role: 'Patron', permission: 'Gestion entreprise', color: 'bg-orange-100 text-orange-800' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <Badge className={item.color}>{item.role}</Badge>
                      <span className="text-sm text-muted-foreground">{item.permission}</span>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  <Settings className="mr-2 h-4 w-4" />
                  Configurer les Rôles
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="taxes" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Receipt className="h-5 w-5" />
                  <span>Tranches Fiscales Globales</span>
                </CardTitle>
                <CardDescription>
                  Configuration des taux d'imposition pour tout le système
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {taxBrackets.map((bracket, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="text-sm font-medium">
                          €{bracket.min.toLocaleString()} - {bracket.max === Infinity ? '∞' : `€${bracket.max.toLocaleString()}`}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{bracket.rate}%</Badge>
                        <Button variant="outline" size="sm">
                          Modifier
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2 mt-4">
                  <Input 
                    placeholder="Nouveau taux (%)"
                    value={newTaxRate}
                    onChange={(e) => setNewTaxRate(e.target.value)}
                    className="flex-1"
                  />
                  <Button>
                    Ajouter
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Paramètres Fiscaux Avancés</CardTitle>
                <CardDescription>
                  Configuration des règles fiscales spéciales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Taux de TVA par défaut</span>
                    <Input className="w-20" value="20%" disabled />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Seuil micro-entreprise</span>
                    <Input className="w-32" value="€176,200" disabled />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Cotisations sociales</span>
                    <Input className="w-20" value="23%" disabled />
                  </div>
                </div>
                <Button className="w-full">
                  <Receipt className="mr-2 h-4 w-4" />
                  Sauvegarder les Paramètres
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="laundering" className="space-y-6">
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-yellow-800">
                <Shuffle className="h-5 w-5" />
                <span>Blanchiment d'Argent Global</span>
              </CardTitle>
              <CardDescription className="text-yellow-700">
                Configuration des paramètres de blanchiment au niveau système
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Seuil minimum global</span>
                    <Input className="w-32" value="€5,000" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Limite quotidienne max</span>
                    <Input className="w-32" value="€500,000" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Taux de commission</span>
                    <Input className="w-20" value="2.5%" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-800 font-medium">Opérations Suspectes</p>
                    <p className="text-xs text-red-600">Surveillance automatique active</p>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-800 font-medium">Conformité</p>
                    <p className="text-xs text-blue-600">Rapports générés automatiquement</p>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2 mt-4">
                <Button variant="outline" className="flex-1">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Rapports Surveillance
                </Button>
                <Button variant="outline" className="flex-1">
                  <Database className="mr-2 h-4 w-4" />
                  Export Conformité
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Gestion Globale des Utilisateurs</span>
              </CardTitle>
              <CardDescription>
                Administration des comptes utilisateurs à travers tout le système
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">142</div>
                    <p className="text-sm text-muted-foreground">Utilisateurs Actifs</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">8</div>
                    <p className="text-sm text-muted-foreground">Administrateurs</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600">3</div>
                    <p className="text-sm text-muted-foreground">Comptes Suspendus</p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button className="flex-1">
                    <Users className="mr-2 h-4 w-4" />
                    Voir Tous les Utilisateurs
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Shield className="mr-2 h-4 w-4" />
                    Audit des Permissions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Sécurité du Système</span>
                </CardTitle>
                <CardDescription>
                  Monitoring de sécurité et contrôles d'accès
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                    <span className="text-sm font-medium text-green-800">Système sécurisé</span>
                    <Badge className="bg-green-100 text-green-800">OK</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <span className="text-sm font-medium text-yellow-800">Tentatives de connexion échouées</span>
                    <Badge className="bg-yellow-100 text-yellow-800">7</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded">
                    <span className="text-sm font-medium text-red-800">Alertes de sécurité</span>
                    <Badge className="bg-red-100 text-red-800">2</Badge>
                  </div>
                </div>
                <Button className="w-full">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Voir Logs de Sécurité
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>HWIP Administration</CardTitle>
                <CardDescription>
                  Contrôle d'accès basé sur le matériel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Dispositifs autorisés: 24</p>
                  <p className="text-sm font-medium">Dispositifs bloqués: 3</p>
                  <p className="text-sm font-medium">Nouveaux dispositifs: 1</p>
                </div>
                <Button className="w-full" variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Gérer HWIP
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Server className="h-5 w-5" />
                <span>État du Système</span>
              </CardTitle>
              <CardDescription>
                Monitoring et maintenance du système
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-medium">Services</h4>
                  {[
                    { name: 'API Principal', status: 'Opérationnel', color: 'text-green-600' },
                    { name: 'Base de Données', status: 'Opérationnel', color: 'text-green-600' },
                    { name: 'Discord OAuth', status: 'Opérationnel', color: 'text-green-600' },
                    { name: 'Système de Fichiers', status: 'Maintenance', color: 'text-yellow-600' }
                  ].map((service, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{service.name}</span>
                      <span className={`text-sm font-medium ${service.color}`}>{service.status}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Ressources</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>CPU Usage</span>
                      <span>23%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>RAM Usage</span>
                      <span>67%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Storage</span>
                      <span>45%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2 mt-6">
                <Button variant="outline" className="flex-1">
                  <Database className="mr-2 h-4 w-4" />
                  Backup Manuel
                </Button>
                <Button variant="outline" className="flex-1">
                  <Settings className="mr-2 h-4 w-4" />
                  Maintenance
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}