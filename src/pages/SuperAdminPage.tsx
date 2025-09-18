import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useSupabase } from '../hooks/useSupabase'
import { 
  Shield, 
  Building, 
  Receipt, 
  Shuffle, 
  Users, 
  Settings, 
  AlertTriangle,
  Server,
  Database,
  Plus,
  Trash2,
  Edit,
  Save,
  Download,
  Upload
} from 'lucide-react'
import { formatCurrency } from '../lib/utils'

interface Enterprise {
  id: string
  name: string
  owner_discord_id: string
  guild_id: string
  type: string
  description: string
  status: 'Active' | 'Suspended'
  employees: number
  created_at: string
}

interface TaxBracket {
  id: string
  type: string
  min_amount: number
  max_amount: number | null
  rate: number
}

interface SystemUser {
  id: string
  discord_id: string
  username: string
  role: string
  role_level: number
  last_login: string
  active: boolean
}

export function SuperAdminPage() {
  const { user } = useAuth()
  const supabaseHooks = useSupabase()
  const [enterprises, setEnterprises] = useState<Enterprise[]>([])
  const [taxBrackets, setTaxBrackets] = useState<TaxBracket[]>([])
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('enterprises')
  
  // États pour les formulaires
  const [newEnterprise, setNewEnterprise] = useState({
    name: '',
    type: 'SARL',
    description: '',
    guild_id: '',
    owner_discord_id: ''
  })
  
  const [newTaxBracket, setNewTaxBracket] = useState({
    type: 'IS',
    min_amount: 0,
    max_amount: null as number | null,
    rate: 0
  })
  
  const [toast, setToast] = useState<{type: 'success' | 'error', message: string} | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  const loadData = async () => {
    try {
      setIsLoading(true)
      
      // Charger les entreprises
      const enterprisesData = await supabaseHooks.getAllEnterprises()
      const enterprisesWithStats = await Promise.all(
        enterprisesData.map(async (enterprise: any) => {
          const employees = await supabaseHooks.getEmployees(enterprise.id)
          return {
            ...enterprise,
            employees: employees.length,
            status: 'Active' as const
          }
        })
      )
      setEnterprises(enterprisesWithStats)
      
      // Charger les tranches fiscales
      const taxData = await supabaseHooks.getTaxBrackets('IS')
      setTaxBrackets(taxData)
      
      // Simuler les utilisateurs système (à remplacer par une vraie requête)
      setSystemUsers([
        {
          id: '1',
          discord_id: '462716512252329996',
          username: 'Fondateur',
          role: 'superadmin',
          role_level: 7,
          last_login: new Date().toISOString(),
          active: true
        }
      ])
      
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
      showToast('error', 'Erreur lors du chargement des données')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateEnterprise = async () => {
    if (!newEnterprise.name || !newEnterprise.guild_id || !newEnterprise.owner_discord_id) {
      showToast('error', 'Veuillez remplir tous les champs obligatoires')
      return
    }

    try {
      await supabaseHooks.createEnterprise(newEnterprise)
      showToast('success', 'Entreprise créée avec succès')
      setNewEnterprise({
        name: '',
        type: 'SARL',
        description: '',
        guild_id: '',
        owner_discord_id: ''
      })
      loadData()
    } catch (error) {
      console.error('Erreur création entreprise:', error)
      showToast('error', 'Erreur lors de la création de l\'entreprise')
    }
  }

  const handleSuspendEnterprise = async (enterpriseId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir suspendre cette entreprise ?')) return
    
    try {
      // Logique de suspension (à implémenter dans useSupabase)
      showToast('success', 'Entreprise suspendue')
      loadData()
    } catch (error) {
      showToast('error', 'Erreur lors de la suspension')
    }
  }

  const handleCreateTaxBracket = async () => {
    if (newTaxBracket.min_amount < 0 || newTaxBracket.rate < 0 || newTaxBracket.rate > 100) {
      showToast('error', 'Valeurs invalides pour la tranche fiscale')
      return
    }

    try {
      // Logique de création de tranche fiscale (à implémenter dans useSupabase)
      showToast('success', 'Tranche fiscale créée')
      setNewTaxBracket({
        type: 'IS',
        min_amount: 0,
        max_amount: null,
        rate: 0
      })
      loadData()
    } catch (error) {
      showToast('error', 'Erreur lors de la création de la tranche fiscale')
    }
  }

  const handleExportData = (type: string) => {
    try {
      let data: any[] = []
      let filename = ''
      
      switch (type) {
        case 'enterprises':
          data = enterprises
          filename = 'enterprises_export.json'
          break
        case 'users':
          data = systemUsers
          filename = 'users_export.json'
          break
        case 'taxes':
          data = taxBrackets
          filename = 'tax_brackets_export.json'
          break
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
      
      showToast('success', `Export ${type} généré avec succès`)
    } catch (error) {
      showToast('error', 'Erreur lors de l\'export')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Chargement des données système...</p>
        </div>
      </div>
    )
  }
  
  const systemStats = [
    { label: 'Entreprises Actives', value: enterprises.filter(e => e.status === 'Active').length, color: 'text-green-600' },
    { label: 'Utilisateurs Total', value: enterprises.reduce((sum, e) => sum + e.employees, 0), color: 'text-blue-600' },
    { label: 'Taux Fiscal Moyen', value: '28.5%', color: 'text-purple-600' },
    { label: 'Uptime Système', value: '99.8%', color: 'text-green-600' }
  ]

  return (
    <div className="container mx-auto px-4 py-6">
      {toast && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
          toast.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
          'bg-red-100 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

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

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
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
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Créer une Entreprise</span>
                </CardTitle>
                <CardDescription>
                  Ajouter une nouvelle entreprise au système
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom de l'entreprise *</label>
                  <Input
                    value={newEnterprise.name}
                    onChange={(e) => setNewEnterprise(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Mon Entreprise"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <select
                    value={newEnterprise.type}
                    onChange={(e) => setNewEnterprise(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
                  >
                    <option value="SARL">SARL</option>
                    <option value="SAS">SAS</option>
                    <option value="SA">SA</option>
                    <option value="EURL">EURL</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Guild ID Discord *</label>
                  <Input
                    value={newEnterprise.guild_id}
                    onChange={(e) => setNewEnterprise(prev => ({ ...prev, guild_id: e.target.value }))}
                    placeholder="123456789012345678"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Discord ID Propriétaire *</label>
                  <Input
                    value={newEnterprise.owner_discord_id}
                    onChange={(e) => setNewEnterprise(prev => ({ ...prev, owner_discord_id: e.target.value }))}
                    placeholder="987654321098765432"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    value={newEnterprise.description}
                    onChange={(e) => setNewEnterprise(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description de l'entreprise"
                  />
                </div>
                <Button onClick={handleCreateEnterprise} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Créer l'Entreprise
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions Rapides</CardTitle>
                <CardDescription>
                  Outils d'administration système
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={() => handleExportData('enterprises')} variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Exporter Toutes les Entreprises
                </Button>
                <Button onClick={() => handleExportData('users')} variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Exporter Utilisateurs Système
                </Button>
                <Button onClick={loadData} variant="outline" className="w-full">
                  <Database className="mr-2 h-4 w-4" />
                  Actualiser les Données
                </Button>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">Statistiques Système</p>
                  <p className="text-xs text-blue-600 mt-1">
                    {enterprises.length} entreprises • {systemUsers.length} utilisateurs privilégiés
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

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
                        <Badge variant="outline">{enterprise.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Guild: {enterprise.guild_id} • {enterprise.employees} employés
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Créée le: {new Date(enterprise.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="mr-1 h-3 w-3" />
                        Gérer
                      </Button>
                      <Button variant="outline" size="sm">
                        <Database className="mr-1 h-3 w-3" />
                        Auditer
                      </Button>
                      {enterprise.status === 'Active' ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600"
                          onClick={() => handleSuspendEnterprise(enterprise.id)}
                        >
                          <AlertTriangle className="mr-1 h-3 w-3" />
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
              {enterprises.length === 0 && (
                <div className="text-center py-8">
                  <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">Aucune entreprise</p>
                  <p className="text-sm text-muted-foreground">Créez votre première entreprise</p>
                </div>
              )}
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
                  <Plus className="h-5 w-5" />
                  <span>Nouvelle Tranche Fiscale</span>
                </CardTitle>
                <CardDescription>
                  Ajouter une tranche d'imposition
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type d'impôt</label>
                  <select
                    value={newTaxBracket.type}
                    onChange={(e) => setNewTaxBracket(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
                  >
                    <option value="IS">Impôt sur les Sociétés</option>
                    <option value="richesse">Impôt sur la Fortune</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Montant minimum (€)</label>
                  <Input
                    type="number"
                    min="0"
                    value={newTaxBracket.min_amount}
                    onChange={(e) => setNewTaxBracket(prev => ({ ...prev, min_amount: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Montant maximum (€) - Laisser vide pour illimité</label>
                  <Input
                    type="number"
                    min="0"
                    value={newTaxBracket.max_amount || ''}
                    onChange={(e) => setNewTaxBracket(prev => ({ ...prev, max_amount: e.target.value ? parseFloat(e.target.value) : null }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Taux (%)</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={newTaxBracket.rate}
                    onChange={(e) => setNewTaxBracket(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <Button onClick={handleCreateTaxBracket} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Créer la Tranche
                </Button>
              </CardContent>
            </Card>

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
                          {formatCurrency(bracket.min_amount)} - {bracket.max_amount ? formatCurrency(bracket.max_amount) : '∞'}
                        </p>
                        <p className="text-xs text-muted-foreground">{bracket.type}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{bracket.rate}%</Badge>
                        <Button variant="outline" size="sm">
                          <Edit className="mr-1 h-3 w-3" />
                          Modifier
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600">
                          <Trash2 className="mr-1 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button onClick={() => handleExportData('taxes')} variant="outline" className="w-full mt-4">
                  <Download className="mr-2 h-4 w-4" />
                  Exporter Tranches Fiscales
                </Button>
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
                    <div className="text-2xl font-bold text-green-600">{systemUsers.filter(u => u.active).length}</div>
                    <p className="text-sm text-muted-foreground">Utilisateurs Actifs</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{systemUsers.filter(u => u.role_level >= 6).length}</div>
                    <p className="text-sm text-muted-foreground">Administrateurs</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600">{systemUsers.filter(u => !u.active).length}</div>
                    <p className="text-sm text-muted-foreground">Comptes Suspendus</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {systemUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{user.username}</p>
                          <Badge className={user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {user.active ? 'Actif' : 'Inactif'}
                          </Badge>
                          <Badge variant="outline">Niveau {user.role_level}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Discord ID: {user.discord_id} • Rôle: {user.role}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Dernière connexion: {new Date(user.last_login).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="mr-1 h-3 w-3" />
                          Modifier
                        </Button>
                        {user.role !== 'superadmin' && (
                          <Button variant="outline" size="sm" className="text-red-600">
                            <Trash2 className="mr-1 h-3 w-3" />
                            Suspendre
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
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
                    { name: 'Supabase Storage', status: 'Opérationnel', color: 'text-green-600' }
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
                      <span>Entreprises Actives</span>
                      <span>{enterprises.filter(e => e.status === 'Active').length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Utilisateurs Système</span>
                      <span>{systemUsers.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tranches Fiscales</span>
                      <span>{taxBrackets.length}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2 mt-6">
                <Button onClick={() => handleExportData('enterprises')} variant="outline" className="flex-1">
                  <Database className="mr-2 h-4 w-4" />
                  Export Système
                </Button>
                <Button onClick={loadData} variant="outline" className="flex-1">
                  <Settings className="mr-2 h-4 w-4" />
                  Actualiser
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}