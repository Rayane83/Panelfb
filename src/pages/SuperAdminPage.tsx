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
  AlertTriangle
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
  sector_id?: string;
  blanchiment_enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface Sector {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

interface TaxBracket {
  id: string;
  type: string;
  min_amount: number;
  max_amount: number | null;
  rate: number;
  created_at: string;
}

interface WealthBracket {
  id: string;
  min_amount: number;
  max_amount: number | null;
  wealth_rate: number;
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
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [taxBrackets, setTaxBrackets] = useState<TaxBracket[]>([]);
  const [wealthBrackets, setWealthBrackets] = useState<WealthBracket[]>([]);
  const [taxGrids, setTaxGrids] = useState<TaxGrid[]>([]);
  
  // États pour les formulaires
  const [newEnterprise, setNewEnterprise] = useState({
    name: '',
    guild_id: '',
    type: 'SARL',
    description: '',
    owner_discord_id: '',
    sector_id: ''
  });

  const [newSector, setNewSector] = useState({
    name: '',
    description: ''
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

      // Charger les secteurs (simulé pour l'instant)
      setSectors([
        { id: '1', name: 'Garage', description: 'Réparation automobile', created_at: new Date().toISOString() },
        { id: '2', name: 'Restaurant', description: 'Restauration', created_at: new Date().toISOString() }
      ]);

      // Charger les tranches fiscales
      const mockTaxBrackets = [
        { id: '1', type: 'IS', min_amount: 100, max_amount: 9999, rate: 7, created_at: new Date().toISOString() },
        { id: '2', type: 'IS', min_amount: 10000, max_amount: 29999, rate: 9, created_at: new Date().toISOString() },
        { id: '3', type: 'IS', min_amount: 30000, max_amount: 49999, rate: 16, created_at: new Date().toISOString() }
      ];
      setTaxBrackets(mockTaxBrackets);

      // Charger les grilles fiscales complètes
      const mockTaxGrids = [
        { min_profit: 100, max_profit: 9999, tax_rate: 7, max_employee_salary: 5000, max_boss_salary: 8000, max_employee_bonus: 2500, max_boss_bonus: 4000 },
        { min_profit: 10000, max_profit: 29999, tax_rate: 9, max_employee_salary: 10000, max_boss_salary: 15000, max_employee_bonus: 5000, max_boss_bonus: 7500 }
      ];
      setTaxGrids(mockTaxGrids);

      // Charger les tranches de richesse
      const mockWealthBrackets = [
        { id: '1', min_amount: 1500000, max_amount: 2500000, wealth_rate: 2, created_at: new Date().toISOString() },
        { id: '2', min_amount: 2500000, max_amount: 3500000, wealth_rate: 3, created_at: new Date().toISOString() }
      ];
      setWealthBrackets(mockWealthBrackets);

    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      showToast('error', 'Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const createEnterprise = async () => {
    try {
      const newEnterpriseData = {
        id: Date.now().toString(),
        name: newEnterprise.name,
        guild_id: newEnterprise.guild_id,
        type: newEnterprise.type,
        description: newEnterprise.description,
        owner_discord_id: newEnterprise.owner_discord_id,
        sector_id: newEnterprise.sector_id,
        blanchiment_enabled: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setEnterprises(prev => [...prev, newEnterpriseData]);

      showToast('success', 'Entreprise créée avec succès');
      
      setNewEnterprise({
        name: '',
        guild_id: '',
        type: 'SARL',
        description: '',
        owner_discord_id: '',
        sector_id: ''
      });
    } catch (error) {
      console.error('Erreur:', error);
      showToast('error', 'Erreur lors de la création de l\'entreprise');
    }
  };

  const createSector = async () => {
    try {
      // Simulation de création de secteur
      const newSectorData = {
        id: Date.now().toString(),
        name: newSector.name,
        description: newSector.description,
        created_at: new Date().toISOString()
      };
      
      setSectors(prev => [...prev, newSectorData]);

      showToast('success', 'Secteur créé avec succès');
      
      setNewSector({
        name: '',
        description: ''
      });
    } catch (error) {
      console.error('Erreur:', error);
      showToast('error', 'Erreur lors de la création du secteur');
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
        const maxBossBonus = parseFloat(parts[6].replace(/\s/g, '')) || 0;
        
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

  const parseWealthGrid = (data: string) => {
    const lines = data.trim().split('\n');
    const brackets: WealthBracket[] = [];
    
    for (const line of lines) {
      const parts = line.split('\t').map(p => p.trim().replace(/\$|%|,/g, ''));
      if (parts.length >= 3) {
        const minAmount = parseFloat(parts[0].replace(/\s/g, '')) || 0;
        const maxAmount = parseFloat(parts[1].replace(/\s/g, '')) || null;
        const wealthRate = parseFloat(parts[2]) || 0;
        
        brackets.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          min_amount: minAmount,
          max_amount: maxAmount === 99000000 ? null : maxAmount,
          wealth_rate: wealthRate,
          created_at: new Date().toISOString()
        });
      }
    }
    
    return brackets;
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

  const importWealthGrid = async () => {
    try {
      const brackets = parseWealthGrid(wealthGridData);
      
      if (brackets.length === 0) {
        showToast('error', 'Aucune donnée valide trouvée');
        return;
      }

      setWealthBrackets(brackets);

      showToast('success', `${brackets.length} tranches de richesse importées`);
      setWealthGridData('');
    } catch (error) {
      console.error('Erreur:', error);
      showToast('error', 'Erreur lors de l\'import de la grille de richesse');
    }
  };

  const deleteEnterprise = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette entreprise ?')) return;
    
    try {
      // Simulation de suppression
      setEnterprises(prev => prev.filter(e => e.id !== id));

      showToast('success', 'Entreprise supprimée');
    } catch (error) {
      console.error('Erreur:', error);
      showToast('error', 'Erreur lors de la suppression');
    }
  };

  const deleteSector = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce secteur ?')) return;
    
    try {
      setSectors(prev => prev.filter(s => s.id !== id));

      showToast('success', 'Secteur supprimé');
      loadData();
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

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Administration SuperAdmin</h1>
        <p className="text-muted-foreground">
          Panel de contrôle complet - Gestion des entreprises et grilles fiscales
        </p>
      </div>

      <Tabs defaultValue="enterprises" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="enterprises">Gestion Entreprises</TabsTrigger>
          <TabsTrigger value="tax-grids">Grilles Fiscales</TabsTrigger>
          <TabsTrigger value="discord">Configuration Discord</TabsTrigger>
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
                  <CardTitle className="text-sm font-medium">Secteurs</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sectors.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Blanchiment Actif</CardTitle>
                  <Shield className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {enterprises.filter(e => e.blanchiment_enabled).length}
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
            </div>

            {/* Création d'entreprise */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Créer une nouvelle entreprise
                </CardTitle>
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role ID Entreprise *</Label>
                    <Input
                      placeholder="123456789012345678"
                      value={newEnterprise.role_id_entreprise}
                      onChange={(e) => setNewEnterprise(prev => ({
                        ...prev,
                        role_id_entreprise: e.target.value
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role ID Employé *</Label>
                    <Input
                      placeholder="123456789012345678"
                      value={newEnterprise.role_id_employe}
                      onChange={(e) => setNewEnterprise(prev => ({
                        ...prev,
                        role_id_employe: e.target.value
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Secteur (optionnel)</Label>
                    <select
                      value={newEnterprise.sector_id || ''}
                      onChange={(e) => setNewEnterprise(prev => ({
                        ...prev,
                        sector_id: e.target.value
                      }))}
                      className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
                    >
                      <option value="">Aucun secteur</option>
                      {sectors.map((sector) => (
                        <option key={sector.id} value={sector.id}>
                          {sector.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <Button onClick={createEnterprise} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Créer l'entreprise
                </Button>
              </CardContent>
            </Card>

            {/* Création de secteur */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Créer un secteur d'entreprise
                </CardTitle>
                <CardDescription>
                  Groupement d'entreprises du même type (ex: Garage, Restaurant, etc.)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nom du secteur *</Label>
                    <Input
                      placeholder="Garage"
                      value={newSector.name}
                      onChange={(e) => setNewSector(prev => ({
                        ...prev,
                        name: e.target.value
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      placeholder="Entreprises de réparation automobile"
                      value={newSector.description}
                      onChange={(e) => setNewSector(prev => ({
                        ...prev,
                        description: e.target.value
                      }))}
                    />
                  </div>
                </div>
                <Button onClick={createSector} className="w-full" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Créer le secteur
                </Button>
              </CardContent>
            </Card>

            {/* Liste des secteurs */}
            {sectors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Secteurs d'entreprise</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {sectors.map((sector) => (
                      <div key={sector.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{sector.name}</p>
                          <p className="text-sm text-muted-foreground">{sector.description}</p>
                          <Badge variant="outline" className="mt-1">
                            {enterprises.filter(e => e.sector_id === sector.id).length} entreprises
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                          onClick={() => deleteSector(sector.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Liste des entreprises */}
            <Card>
              <CardHeader>
                <CardTitle>Entreprises existantes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {enterprises.map((enterprise) => {
                    const sector = sectors.find(s => s.id === enterprise.sector_id);
                    return (
                      <div key={enterprise.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">{enterprise.name}</p>
                            {enterprise.blanchiment_enabled && (
                              <Badge className="bg-green-100 text-green-800">Blanchiment OK</Badge>
                            )}
                            {sector && (
                              <Badge variant="outline">{sector.name}</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Guild: {enterprise.guild_id}</p>
                            <p>Rôle Entreprise: {enterprise.role_id_entreprise}</p>
                            <p>Rôle Employé: {enterprise.role_id_employe}</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                          onClick={() => deleteEnterprise(enterprise.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
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
                  Collez directement les données depuis Excel (format: Bénéfice min | Bénéfice max | Taux | Salaire max employé | Salaire max patron | Prime max employé | Prime max patron)
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

            {/* Import grille richesse */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Configurer l'impôt sur la richesse
                </CardTitle>
                <CardDescription>
                  Collez les données de l'impôt sur la richesse (format: Montant min | Montant max | Taux richesse)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="1500000	2500000	2
2500000	3500000	3
3500000	5000000	4
5000000	99000000	5"
                  value={wealthGridData}
                  onChange={(e) => setWealthGridData(e.target.value)}
                  className="min-h-24 font-mono text-sm"
                />
                <Button onClick={importWealthGrid} disabled={!wealthGridData.trim()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Importer la grille de richesse
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
                          <tr key={index} className="border-b">
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

            {/* Aperçu grille richesse */}
            {wealthBrackets.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Impôt sur la richesse actuel</CardTitle>
                  <CardDescription>
                    {wealthBrackets.length} tranches configurées
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Montant Min</th>
                          <th className="text-left p-2">Montant Max</th>
                          <th className="text-left p-2">Taux Richesse</th>
                        </tr>
                      </thead>
                      <tbody>
                        {wealthBrackets.map((bracket) => (
                          <tr key={bracket.id} className="border-b">
                            <td className="p-2">{formatCurrency(bracket.min_amount)}</td>
                            <td className="p-2">
                              {bracket.max_amount ? formatCurrency(bracket.max_amount) : '∞'}
                            </td>
                            <td className="p-2">
                              <Badge>{bracket.wealth_rate}%</Badge>
                            </td>
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

        {/* Configuration Discord */}
        <TabsContent value="discord">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Configuration Discord
              </CardTitle>
              <CardDescription>
                Gérez les paramètres Discord et les webhooks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="principal-guild">Guilde Principale</Label>
                  <Input
                    id="principal-guild"
                    value={import.meta.env.VITE_MAIN_GUILD_ID || ''}
                    disabled
                    placeholder="ID de la guilde principale"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dot-guild">Guilde DOT</Label>
                  <Input
                    id="dot-guild"
                    value={import.meta.env.VITE_DOT_GUILD_ID || ''}
                    disabled
                    placeholder="ID de la guilde DOT"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline">
                  <TestTube className="h-4 w-4 mr-2" />
                  Tester Health Discord
                </Button>
                <Button variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Sync Rôles
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Système */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Informations Système
              </CardTitle>
              <CardDescription>
                État du système et liens utiles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Toutes les tables sont protégées par des politiques RLS (Row Level Security).
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" asChild>
                    <a 
                      href="https://supabase.com/dashboard" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      Dashboard Supabase
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a 
                      href="https://discord.com/developers/applications" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      Discord Developer Portal
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SuperAdminPage;