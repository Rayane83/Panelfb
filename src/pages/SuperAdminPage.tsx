import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { 
  Settings, 
  Server, 
  Building2, 
  DollarSign, 
  Shield, 
  Trash2,
  Plus,
  Save,
  TestTube,
  RotateCcw,
  Upload,
  Download,
  Calculator,
  Users,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useSupabase } from '../hooks/useSupabase';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency } from '../lib/utils';

interface Enterprise {
  id: string;
  name: string;
  guild_id: string;
  type: string;
  description?: string;
  owner_discord_id: string;
  settings: any;
  created_at: string;
  updated_at: string;
}

interface TaxBracket {
  id: string;
  type: string;
  min_amount: number;
  max_amount: number | null;
  rate: number;
  created_at: string;
}

interface TaxGrid {
  min_profit: number;
  max_profit: number | null;
  tax_rate: number;
  max_employee_salary: number;
  max_boss_salary: number;
  max_employee_bonus: number;
  max_boss_bonus: number;
}

const SuperAdminPage: React.FC = () => {
  const { user } = useAuth();
  const supabaseHooks = useSupabase();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  // États pour les différentes sections
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [taxBrackets, setTaxBrackets] = useState<TaxBracket[]>([]);
  const [taxGrids, setTaxGrids] = useState<TaxGrid[]>([]);
  
  // États pour les formulaires
  const [newEnterprise, setNewEnterprise] = useState({
    name: '',
    guild_id: '',
    type: 'SARL',
    description: '',
    owner_discord_id: ''
  });

  const [taxGridData, setTaxGridData] = useState('');
  const [wealthGridData, setWealthGridData] = useState('');

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger les entreprises
      const enterprisesData = await supabaseHooks.getAllEnterprises();
      setEnterprises(enterprisesData);

      // Charger les tranches fiscales
      const taxBracketsData = await supabaseHooks.getTaxBrackets('IS');
      setTaxBrackets(taxBracketsData);

      // Simuler les grilles fiscales complètes
      const mockTaxGrids = [
        { min_profit: 100, max_profit: 9999, tax_rate: 7, max_employee_salary: 5000, max_boss_salary: 8000, max_employee_bonus: 2500, max_boss_bonus: 4000 },
        { min_profit: 10000, max_profit: 29999, tax_rate: 9, max_employee_salary: 10000, max_boss_salary: 15000, max_employee_bonus: 5000, max_boss_bonus: 7500 },
        { min_profit: 30000, max_profit: 49999, tax_rate: 16, max_employee_salary: 20000, max_boss_salary: 25000, max_employee_bonus: 10000, max_boss_bonus: 12500 }
      ];
      setTaxGrids(mockTaxGrids);

    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      showToast('error', 'Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const createEnterprise = async () => {
    try {
      if (!newEnterprise.name || !newEnterprise.guild_id || !newEnterprise.owner_discord_id) {
        showToast('error', 'Veuillez remplir tous les champs obligatoires');
        return;
      }

      const enterpriseData = await supabaseHooks.createEnterprise(newEnterprise);
      
      setEnterprises(prev => [enterpriseData, ...prev]);
      showToast('success', 'Entreprise créée avec succès');
      
      setNewEnterprise({
        name: '',
        guild_id: '',
        type: 'SARL',
        description: '',
        owner_discord_id: ''
      });
    } catch (error) {
      console.error('Erreur:', error);
      showToast('error', 'Erreur lors de la création de l\'entreprise');
    }
  };

  const parseTaxGrid = (data: string) => {
    const lines = data.trim().split('\n');
    const grids: TaxGrid[] = [];
    
    for (const line of lines) {
      const parts = line.split('\t').map(p => p.trim().replace(/\$|%|,/g, ''));
      if (parts.length >= 6) {
        const minProfit = parseFloat(parts[0].replace(/\s/g, '')) || 0;
        const maxProfit = parseFloat(parts[1].replace(/\s/g, '')) || null;
        const taxRate = parseFloat(parts[2]) || 0;
        const maxEmployeeSalary = parseFloat(parts[3].replace(/\s/g, '')) || 0;
        const maxBossSalary = parseFloat(parts[4].replace(/\s/g, '')) || 0;
        const maxEmployeeBonus = parseFloat(parts[5].replace(/\s/g, '')) || 0;
        const maxBossBonus = parseFloat(parts[6]?.replace(/\s/g, '')) || 0;
        
        grids.push({
          min_profit: minProfit,
          max_profit: maxProfit === 99000000 ? null : maxProfit,
          tax_rate: taxRate,
          max_employee_salary: maxEmployeeSalary,
          max_boss_salary: maxBossSalary,
          max_employee_bonus: maxEmployeeBonus,
          max_boss_bonus: maxBossBonus
        });
      }
    }
    
    return grids;
  };

  const importTaxGrid = async () => {
    try {
      const grids = parseTaxGrid(taxGridData);
      
      if (grids.length === 0) {
        showToast('error', 'Aucune donnée valide trouvée');
        return;
      }

      setTaxGrids(grids);
      showToast('success', `${grids.length} tranches fiscales importées`);
      setTaxGridData('');
    } catch (error) {
      console.error('Erreur:', error);
      showToast('error', 'Erreur lors de l\'import de la grille fiscale');
    }
  };

  const deleteEnterprise = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette entreprise ?')) return;
    
    try {
      await supabaseHooks.deleteEnterprise(id);
      setEnterprises(prev => prev.filter(e => e.id !== id));
      showToast('success', 'Entreprise supprimée');
    } catch (error) {
      console.error('Erreur:', error);
      showToast('error', 'Erreur lors de la suppression');
    }
  };

  // Vérifier les permissions
  if (!user || (user.role !== 'superadmin' && user.role !== 'superviseur')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Accès Refusé</h2>
          <p className="text-muted-foreground">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Rôle requis: SuperAdmin ou Superviseur
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement de l'administration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {toast && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
          toast.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
          'bg-red-100 text-red-800 border border-red-200'
        }`}>
          <span>{toast.message}</span>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administration SuperAdmin</h1>
          <p className="text-muted-foreground">
            Panel de contrôle complet - Gestion des entreprises et grilles fiscales
          </p>
        </div>
        <Button onClick={loadData} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      <Tabs defaultValue="enterprises" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="enterprises">Gestion Entreprises</TabsTrigger>
          <TabsTrigger value="tax-grids">Grilles Fiscales</TabsTrigger>
          <TabsTrigger value="system">Système</TabsTrigger>
        </TabsList>

        {/* Gestion des entreprises */}
        <TabsContent value="enterprises">
          <div className="space-y-6">
            {/* Statistiques */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Entreprises</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{enterprises.length}</div>
                  <p className="text-xs text-muted-foreground">Total créées</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Blanchiment Actif</CardTitle>
                  <Shield className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {enterprises.filter(e => e.settings?.blanchiment_enabled).length}
                  </div>
                  <p className="text-xs text-muted-foreground">Entreprises autorisées</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tranches Fiscales</CardTitle>
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{taxBrackets.length}</div>
                  <p className="text-xs text-muted-foreground">Configurées</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Grilles Complètes</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{taxGrids.length}</div>
                  <p className="text-xs text-muted-foreground">Paliers configurés</p>
                </CardContent>
              </Card>
            </div>

            {/* Création d'entreprise */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Créer une nouvelle entreprise
                </CardTitle>
                <CardDescription>
                  Tous les champs marqués d'un * sont obligatoires
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nom de l'entreprise *</Label>
                    <Input
                      placeholder="Mon Entreprise"
                      value={newEnterprise.name}
                      onChange={(e) => setNewEnterprise(prev => ({
                        ...prev,
                        name: e.target.value
                      }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Guild ID Discord *</Label>
                    <Input
                      placeholder="123456789012345678"
                      value={newEnterprise.guild_id}
                      onChange={(e) => setNewEnterprise(prev => ({
                        ...prev,
                        guild_id: e.target.value
                      }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type d'entreprise</Label>
                    <select
                      value={newEnterprise.type}
                      onChange={(e) => setNewEnterprise(prev => ({
                        ...prev,
                        type: e.target.value
                      }))}
                      className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
                    >
                      <option value="SARL">SARL</option>
                      <option value="SAS">SAS</option>
                      <option value="SA">SA</option>
                      <option value="EURL">EURL</option>
                      <option value="Auto-entrepreneur">Auto-entrepreneur</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Owner Discord ID *</Label>
                    <Input
                      placeholder="123456789012345678"
                      value={newEnterprise.owner_discord_id}
                      onChange={(e) => setNewEnterprise(prev => ({
                        ...prev,
                        owner_discord_id: e.target.value
                      }))}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Description de l'entreprise..."
                    value={newEnterprise.description}
                    onChange={(e) => setNewEnterprise(prev => ({
                      ...prev,
                      description: e.target.value
                    }))}
                  />
                </div>
                <Button 
                  onClick={createEnterprise} 
                  className="w-full"
                  disabled={!newEnterprise.name || !newEnterprise.guild_id || !newEnterprise.owner_discord_id}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Créer l'entreprise
                </Button>
              </CardContent>
            </Card>

            {/* Liste des entreprises */}
            <Card>
              <CardHeader>
                <CardTitle>Entreprises existantes ({enterprises.length})</CardTitle>
                <CardDescription>
                  Gestion et suppression des entreprises
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {enterprises.map((enterprise) => (
                    <div key={enterprise.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{enterprise.name}</p>
                          {enterprise.settings?.blanchiment_enabled && (
                            <Badge className="bg-green-100 text-green-800">Blanchiment OK</Badge>
                          )}
                          <Badge variant="outline">{enterprise.type}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Guild: {enterprise.guild_id}</p>
                          <p>Owner: {enterprise.owner_discord_id}</p>
                          {enterprise.description && <p>Description: {enterprise.description}</p>}
                          <p>Créée le: {new Date(enterprise.created_at).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => deleteEnterprise(enterprise.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                {enterprises.length === 0 && (
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">Aucune entreprise</p>
                    <p className="text-sm text-muted-foreground">
                      Créez votre première entreprise ci-dessus
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Grilles fiscales */}
        <TabsContent value="tax-grids">
          <div className="space-y-6">
            {/* Import grille d'imposition */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Configurer la grille d'imposition
                </CardTitle>
                <CardDescription>
                  Format Excel/CSV: Bénéfice min | Bénéfice max | Taux | Salaire max employé | Salaire max patron | Prime max employé | Prime max patron
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="100	9999	7	5000	8000	2500	4000
10000	29999	9	10000	15000	5000	7500
30000	49999	16	20000	25000	10000	12500"
                  value={taxGridData}
                  onChange={(e) => setTaxGridData(e.target.value)}
                  className="min-h-32 font-mono text-sm"
                />
                <Button onClick={importTaxGrid} disabled={!taxGridData.trim()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Importer la grille d'imposition
                </Button>
              </CardContent>
            </Card>

            {/* Aperçu grille d'imposition */}
            {taxGrids.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Grille d'imposition actuelle</CardTitle>
                  <CardDescription>
                    {taxGrids.length} tranches configurées
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Bénéfice Min</th>
                          <th className="text-left p-2">Bénéfice Max</th>
                          <th className="text-left p-2">Taux</th>
                          <th className="text-left p-2">Sal. Max Emp.</th>
                          <th className="text-left p-2">Sal. Max Pat.</th>
                          <th className="text-left p-2">Prime Max Emp.</th>
                          <th className="text-left p-2">Prime Max Pat.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {taxGrids.map((grid, index) => (
                          <tr key={index} className="border-b hover:bg-muted/50">
                            <td className="p-2">{formatCurrency(grid.min_profit)}</td>
                            <td className="p-2">
                              {grid.max_profit ? formatCurrency(grid.max_profit) : '∞'}
                            </td>
                            <td className="p-2">
                              <Badge>{grid.tax_rate}%</Badge>
                            </td>
                            <td className="p-2">{formatCurrency(grid.max_employee_salary)}</td>
                            <td className="p-2">{formatCurrency(grid.max_boss_salary)}</td>
                            <td className="p-2">{formatCurrency(grid.max_employee_bonus)}</td>
                            <td className="p-2">{formatCurrency(grid.max_boss_bonus)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Système */}
        <TabsContent value="system">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Informations Système
                </CardTitle>
                <CardDescription>
                  État du système et configuration Discord
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Guilde Principale</Label>
                    <Input
                      value={import.meta.env.VITE_MAIN_GUILD_ID || 'Non configuré'}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Guilde DOT</Label>
                    <Input
                      value={import.meta.env.VITE_DOT_GUILD_ID || 'Non configuré'}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Configuration des rôles Discord</h4>
                  <div className="grid gap-2 text-sm">
                    <p>Staff: {import.meta.env.VITE_MAIN_GUILD_STAFF_ROLE_ID || 'Non configuré'}</p>
                    <p>Patron: {import.meta.env.VITE_MAIN_GUILD_PATRON_ROLE_ID || 'Non configuré'}</p>
                    <p>Co-Patron: {import.meta.env.VITE_MAIN_GUILD_COPATRON_ROLE_ID || 'Non configuré'}</p>
                    <p>DOT: {import.meta.env.VITE_DOT_GUILD_DOT_ROLE_ID || 'Non configuré'}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" asChild>
                    <a 
                      href="https://supabase.com/dashboard" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Server className="mr-2 h-4 w-4" />
                      Dashboard Supabase
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a 
                      href="https://discord.com/developers/applications" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Discord Developer Portal
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SuperAdminPage;