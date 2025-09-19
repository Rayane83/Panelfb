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
  Upload,
  Download,
  Calculator,
  Users,
  AlertTriangle,
  RefreshCw,
  Edit,
  Eye
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
  id?: string;
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
  const [wealthBrackets, setWealthBrackets] = useState<TaxBracket[]>([]);
  const [taxGrids, setTaxGrids] = useState<TaxGrid[]>([]);
  
  // États pour les formulaires
  const [newEnterprise, setNewEnterprise] = useState({
    name: '',
    guild_id: '',
    type: 'SARL',
    description: '',
    owner_discord_id: ''
  });

  const [newTaxBracket, setNewTaxBracket] = useState({
    type: 'IS',
    min_amount: 0,
    max_amount: null as number | null,
    rate: 0
  });

  const [newWealthBracket, setNewWealthBracket] = useState({
    type: 'richesse',
    min_amount: 0,
    max_amount: null as number | null,
    rate: 0
  });

  const [taxGridData, setTaxGridData] = useState('');
  const [editingGrid, setEditingGrid] = useState<TaxGrid | null>(null);

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

      // Charger les tranches fiscales IS
      const taxBracketsData = await supabaseHooks.getTaxBrackets('IS');
      setTaxBrackets(taxBracketsData);

      // Charger les tranches fiscales richesse
      const wealthBracketsData = await supabaseHooks.getTaxBrackets('richesse');
      setWealthBrackets(wealthBracketsData);

      // Charger les grilles fiscales complètes
      const taxGridsData = await supabaseHooks.getTaxGrids();
      setTaxGrids(taxGridsData);

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

  const createTaxBracket = async () => {
    try {
      if (!newTaxBracket.min_amount || !newTaxBracket.rate) {
        showToast('error', 'Veuillez remplir tous les champs obligatoires');
        return;
      }

      const bracketData = await supabaseHooks.createTaxBracket(newTaxBracket);
      setTaxBrackets(prev => [...prev, bracketData]);
      
      setNewTaxBracket({
        type: 'IS',
        min_amount: 0,
        max_amount: null,
        rate: 0
      });
      
      showToast('success', 'Tranche fiscale IS créée');
    } catch (error) {
      console.error('Erreur:', error);
      showToast('error', 'Erreur lors de la création');
    }
  };

  const createWealthBracket = async () => {
    try {
      if (!newWealthBracket.min_amount || !newWealthBracket.rate) {
        showToast('error', 'Veuillez remplir tous les champs obligatoires');
        return;
      }

      const bracketData = await supabaseHooks.createTaxBracket(newWealthBracket);
      setWealthBrackets(prev => [...prev, bracketData]);
      
      setNewWealthBracket({
        type: 'richesse',
        min_amount: 0,
        max_amount: null,
        rate: 0
      });
      
      showToast('success', 'Tranche fiscale richesse créée');
    } catch (error) {
      console.error('Erreur:', error);
      showToast('error', 'Erreur lors de la création');
    }
  };

  const parseTaxGrid = (data: string): TaxGrid[] => {
    const lines = data.trim().split('\n');
    const grids: TaxGrid[] = [];
    
    for (const line of lines) {
      const parts = line.split('\t').map(p => p.trim().replace(/\$|%|,/g, ''));
      if (parts.length >= 7) {
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

      // Sauvegarder les grilles en base
      await supabaseHooks.saveTaxGrids(grids);
      await loadData();
      
      showToast('success', `${grids.length} tranches fiscales importées et sauvegardées`);
      setTaxGridData('');
    } catch (error) {
      console.error('Erreur:', error);
      showToast('error', 'Erreur lors de l\'import de la grille fiscale');
    }
  };

  const updateTaxGrid = async (grid: TaxGrid) => {
    try {
      await supabaseHooks.updateTaxGrid(grid);
      await loadData();
      setEditingGrid(null);
      showToast('success', 'Grille fiscale mise à jour');
    } catch (error) {
      console.error('Erreur:', error);
      showToast('error', 'Erreur lors de la mise à jour');
    }
  };

  const deleteTaxGrid = async (gridId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tranche ?')) return;
    
    try {
      await supabaseHooks.deleteTaxGrid(gridId);
      await loadData();
      showToast('success', 'Tranche supprimée');
    } catch (error) {
      console.error('Erreur:', error);
      showToast('error', 'Erreur lors de la suppression');
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

  const deleteTaxBracket = async (id: string, type: 'IS' | 'richesse') => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tranche ?')) return;
    
    try {
      await supabaseHooks.deleteTaxBracket(id);
      
      if (type === 'IS') {
        setTaxBrackets(prev => prev.filter(b => b.id !== id));
      } else {
        setWealthBrackets(prev => prev.filter(b => b.id !== id));
      }
      
      showToast('success', 'Tranche fiscale supprimée');
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="enterprises">Entreprises</TabsTrigger>
          <TabsTrigger value="tax-brackets">Tranches Fiscales</TabsTrigger>
          <TabsTrigger value="tax-grids">Grilles Complètes</TabsTrigger>
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
                  <CardTitle className="text-sm font-medium">Tranches IS</CardTitle>
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

        {/* Tranches fiscales */}
        <TabsContent value="tax-brackets">
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Tranches IS */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Tranches Impôt sur les Sociétés
                  </CardTitle>
                  <CardDescription>
                    Configuration des tranches IS ({taxBrackets.length} tranches)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Formulaire création IS */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                    <h4 className="font-medium text-blue-800">Nouvelle tranche IS</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="Montant min"
                        value={newTaxBracket.min_amount}
                        onChange={(e) => setNewTaxBracket(prev => ({ ...prev, min_amount: parseFloat(e.target.value) || 0 }))}
                      />
                      <Input
                        type="number"
                        placeholder="Montant max (optionnel)"
                        value={newTaxBracket.max_amount || ''}
                        onChange={(e) => setNewTaxBracket(prev => ({ ...prev, max_amount: e.target.value ? parseFloat(e.target.value) : null }))}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="Taux (%)"
                        value={newTaxBracket.rate}
                        onChange={(e) => setNewTaxBracket(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
                      />
                      <Button onClick={createTaxBracket} size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter
                      </Button>
                    </div>
                  </div>

                  {/* Liste des tranches IS */}
                  <div className="space-y-3">
                    {taxBrackets.map((bracket) => (
                      <div key={bracket.id} className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <p className="text-sm font-medium">
                            {formatCurrency(bracket.min_amount)} - {bracket.max_amount ? formatCurrency(bracket.max_amount) : '∞'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Créée le {new Date(bracket.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-blue-100 text-blue-800">{bracket.rate}%</Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600"
                            onClick={() => deleteTaxBracket(bracket.id, 'IS')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {taxBrackets.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">
                        Aucune tranche IS configurée
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Tranches richesse */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Tranches Impôt sur la Richesse
                  </CardTitle>
                  <CardDescription>
                    Configuration des tranches richesse ({wealthBrackets.length} tranches)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Formulaire création richesse */}
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg space-y-3">
                    <h4 className="font-medium text-purple-800">Nouvelle tranche richesse</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="Montant min"
                        value={newWealthBracket.min_amount}
                        onChange={(e) => setNewWealthBracket(prev => ({ ...prev, min_amount: parseFloat(e.target.value) || 0 }))}
                      />
                      <Input
                        type="number"
                        placeholder="Montant max (optionnel)"
                        value={newWealthBracket.max_amount || ''}
                        onChange={(e) => setNewWealthBracket(prev => ({ ...prev, max_amount: e.target.value ? parseFloat(e.target.value) : null }))}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="Taux (%)"
                        value={newWealthBracket.rate}
                        onChange={(e) => setNewWealthBracket(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
                      />
                      <Button onClick={createWealthBracket} size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter
                      </Button>
                    </div>
                  </div>

                  {/* Liste des tranches richesse */}
                  <div className="space-y-3">
                    {wealthBrackets.map((bracket) => (
                      <div key={bracket.id} className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <p className="text-sm font-medium">
                            {formatCurrency(bracket.min_amount)} - {bracket.max_amount ? formatCurrency(bracket.max_amount) : '∞'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Créée le {new Date(bracket.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-purple-100 text-purple-800">{bracket.rate}%</Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600"
                            onClick={() => deleteTaxBracket(bracket.id, 'richesse')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {wealthBrackets.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">
                        Aucune tranche richesse configurée
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Grilles fiscales complètes */}
        <TabsContent value="tax-grids">
          <div className="space-y-6">
            {/* Import grille complète */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Configurer la grille fiscale complète
                </CardTitle>
                <CardDescription>
                  Format Excel/CSV: Bénéfice min | Bénéfice max | Taux | Salaire max employé | Salaire max patron | Prime max employé | Prime max patron
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="100	9999	7	5000	8000	2500	4000
10000	29999	9	10000	15000	5000	7500
30000	49999	16	20000	25000	10000	12500
50000	99999	25	30000	40000	15000	20000
100000		33	50000	75000	25000	37500"
                  value={taxGridData}
                  onChange={(e) => setTaxGridData(e.target.value)}
                  className="min-h-32 font-mono text-sm"
                />
                <div className="flex space-x-2">
                  <Button onClick={importTaxGrid} disabled={!taxGridData.trim()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Importer la grille complète
                  </Button>
                  <Button variant="outline" onClick={() => setTaxGridData('')}>
                    Effacer
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Grille fiscale actuelle */}
            <Card>
              <CardHeader>
                <CardTitle>Grille fiscale complète actuelle</CardTitle>
                <CardDescription>
                  {taxGrids.length} tranches configurées avec limites salariales
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
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {taxGrids.map((grid, index) => (
                        <tr key={grid.id || index} className="border-b hover:bg-muted/50">
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
                          <td className="p-2">
                            <div className="flex space-x-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingGrid(grid)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {grid.id && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600"
                                  onClick={() => deleteTaxGrid(grid.id!)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {taxGrids.length === 0 && (
                  <div className="text-center py-8">
                    <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">Aucune grille configurée</p>
                    <p className="text-sm text-muted-foreground">
                      Importez votre première grille fiscale ci-dessus
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
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

      {/* Modal d'édition de grille */}
      {editingGrid && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Modifier la tranche fiscale</h3>
                <Button variant="ghost" size="sm" onClick={() => setEditingGrid(null)}>
                  ×
                </Button>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Bénéfice minimum (€)</Label>
                  <Input
                    type="number"
                    value={editingGrid.min_profit}
                    onChange={(e) => setEditingGrid(prev => prev ? { ...prev, min_profit: parseFloat(e.target.value) || 0 } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bénéfice maximum (€)</Label>
                  <Input
                    type="number"
                    value={editingGrid.max_profit || ''}
                    onChange={(e) => setEditingGrid(prev => prev ? { ...prev, max_profit: e.target.value ? parseFloat(e.target.value) : null } : null)}
                    placeholder="Laissez vide pour ∞"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Taux d'imposition (%)</Label>
                  <Input
                    type="number"
                    value={editingGrid.tax_rate}
                    onChange={(e) => setEditingGrid(prev => prev ? { ...prev, tax_rate: parseFloat(e.target.value) || 0 } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Salaire max employé (€)</Label>
                  <Input
                    type="number"
                    value={editingGrid.max_employee_salary}
                    onChange={(e) => setEditingGrid(prev => prev ? { ...prev, max_employee_salary: parseFloat(e.target.value) || 0 } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Salaire max patron (€)</Label>
                  <Input
                    type="number"
                    value={editingGrid.max_boss_salary}
                    onChange={(e) => setEditingGrid(prev => prev ? { ...prev, max_boss_salary: parseFloat(e.target.value) || 0 } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Prime max employé (€)</Label>
                  <Input
                    type="number"
                    value={editingGrid.max_employee_bonus}
                    onChange={(e) => setEditingGrid(prev => prev ? { ...prev, max_employee_bonus: parseFloat(e.target.value) || 0 } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Prime max patron (€)</Label>
                  <Input
                    type="number"
                    value={editingGrid.max_boss_bonus}
                    onChange={(e) => setEditingGrid(prev => prev ? { ...prev, max_boss_bonus: parseFloat(e.target.value) || 0 } : null)}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setEditingGrid(null)}>
                  Annuler
                </Button>
                <Button onClick={() => updateTaxGrid(editingGrid)}>
                  <Save className="mr-2 h-4 w-4" />
                  Sauvegarder
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminPage;