import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
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
  RotateCcw
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface DiscordConfig {
  principalGuildId?: string;
  dot?: { guildId?: string };
  enterprises?: Array<{
    key: string;
    name: string;
    guildId: string;
    role_id: string;
    employee_role_id?: string;
  }>;
}

interface Enterprise {
  id: string;
  guild_id: string;
  key: string;
  name: string;
  discord_role_id: string | null;
  discord_guild_id: string | null;
}

interface TaxBracket {
  id: string;
  guild_id: string;
  min_profit: number;
  max_profit: number;
  tax_rate: number;
  max_employee_salary: number;
  max_boss_salary: number;
  max_employee_bonus: number;
  max_boss_bonus: number;
}

const SuperAdminPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  // États pour les différentes sections
  const [discordConfig, setDiscordConfig] = useState<DiscordConfig>({});
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [taxBrackets, setTaxBrackets] = useState<TaxBracket[]>([]);
  
  // États pour les formulaires
  const [newEnterprise, setNewEnterprise] = useState({
    guild_id: '',
    key: '',
    name: '',
    discord_role_id: '',
    discord_guild_id: ''
  });

  const [newTaxBracket, setNewTaxBracket] = useState({
    guild_id: '',
    min_profit: 0,
    max_profit: 0,
    tax_rate: 0,
    max_employee_salary: 0,
    max_boss_salary: 0,
    max_employee_bonus: 0,
    max_boss_bonus: 0
  });

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
      
      // Charger la config Discord
      const { data: discordConfigData } = await supabase
        .from('discord_config')
        .select('data')
        .eq('id', 'default')
        .single();
      
      if (discordConfigData?.data) {
        setDiscordConfig(discordConfigData.data as DiscordConfig);
      }

      // Charger les entreprises
      const { data: enterprisesData } = await supabase
        .from('enterprises')
        .select('*')
        .order('guild_id', { ascending: true });
      
      setEnterprises(enterprisesData || []);

      // Charger les tranches fiscales
      const { data: taxBracketsData } = await supabase
        .from('tax_brackets')
        .select('*')
        .order('guild_id', { ascending: true })
        .order('min_profit', { ascending: true });
      
      setTaxBrackets(taxBracketsData || []);

    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      showToast('error', 'Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const saveDiscordConfig = async () => {
    try {
      const { error } = await supabase
        .from('discord_config')
        .upsert({
          id: 'default',
          data: discordConfig as any
        });

      if (error) throw error;

      showToast('success', 'Configuration Discord sauvegardée');
    } catch (error) {
      console.error('Erreur:', error);
      showToast('error', 'Erreur lors de la sauvegarde');
    }
  };

  const saveEnterprise = async () => {
    try {
      const { error } = await supabase
        .from('enterprises')
        .insert(newEnterprise);

      if (error) throw error;

      showToast('success', 'Entreprise créée');
      
      setNewEnterprise({
        guild_id: '',
        key: '',
        name: '',
        discord_role_id: '',
        discord_guild_id: ''
      });
      
      loadData();
    } catch (error) {
      console.error('Erreur:', error);
      showToast('error', 'Erreur lors de la création');
    }
  };

  const deleteEnterprise = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette entreprise ?')) return;
    
    try {
      const { error } = await supabase
        .from('enterprises')
        .delete()
        .eq('id', id);

      if (error) throw error;

      showToast('success', 'Entreprise supprimée');
      
      loadData();
    } catch (error) {
      console.error('Erreur:', error);
      showToast('error', 'Erreur lors de la suppression');
    }
  };

  const saveTaxBracket = async () => {
    try {
      const { error } = await supabase
        .from('tax_brackets')
        .insert(newTaxBracket);

      if (error) throw error;

      showToast('success', 'Tranche fiscale créée');
      
      setNewTaxBracket({
        guild_id: '',
        min_profit: 0,
        max_profit: 0,
        tax_rate: 0,
        max_employee_salary: 0,
        max_boss_salary: 0,
        max_employee_bonus: 0,
        max_boss_bonus: 0
      });
      
      loadData();
    } catch (error) {
      console.error('Erreur:', error);
      showToast('error', 'Erreur lors de la création');
    }
  };

  const testDiscordHealth = async () => {
    try {
      showToast('success', 'Test en cours...');
      
      // Appeler la fonction Edge
      const { data, error } = await supabase.functions.invoke('discord-health');
      
      if (error) throw error;
      
      showToast('success', 'Test Discord réussi');
    } catch (error) {
      console.error('Erreur test Discord:', error);
      showToast('error', 'Échec du test Discord');
    }
  };

  const syncDiscordRoles = async () => {
    try {
      showToast('success', 'Synchronisation...');
      
      const { data, error } = await supabase.functions.invoke('discord-sync');
      
      if (error) throw error;
      
      showToast('success', 'Synchronisation terminée');
    } catch (error) {
      console.error('Erreur sync:', error);
      showToast('error', 'Échec de la synchronisation');
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
        <h1 className="text-3xl font-bold tracking-tight">Administration SuperStaff</h1>
        <p className="text-muted-foreground">
          Panel de contrôle complet - Accès SuperAdmin
        </p>
      </div>

      <Tabs defaultValue="discord" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="discord">Discord</TabsTrigger>
          <TabsTrigger value="enterprises">Entreprises</TabsTrigger>
          <TabsTrigger value="tax-brackets">Paliers</TabsTrigger>
          <TabsTrigger value="blanchiment">Blanchiment</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
        </TabsList>

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
                    value={discordConfig.principalGuildId || ''}
                    onChange={(e) => setDiscordConfig(prev => ({
                      ...prev,
                      principalGuildId: e.target.value
                    }))}
                    placeholder="ID de la guilde principale"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dot-guild">Guilde DOT</Label>
                  <Input
                    id="dot-guild"
                    value={discordConfig.dot?.guildId || ''}
                    onChange={(e) => setDiscordConfig(prev => ({
                      ...prev,
                      dot: { ...prev.dot, guildId: e.target.value }
                    }))}
                    placeholder="ID de la guilde DOT"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={saveDiscordConfig}>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder
                </Button>
                <Button variant="outline" onClick={testDiscordHealth}>
                  <TestTube className="h-4 w-4 mr-2" />
                  Tester Health
                </Button>
                <Button variant="outline" onClick={syncDiscordRoles}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Sync Rôles
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gestion des entreprises */}
        <TabsContent value="enterprises">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Ajouter une Entreprise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Guilde ID</Label>
                    <Input
                      value={newEnterprise.guild_id}
                      onChange={(e) => setNewEnterprise(prev => ({
                        ...prev,
                        guild_id: e.target.value
                      }))}
                      placeholder="ID de la guilde"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Clé</Label>
                    <Input
                      value={newEnterprise.key}
                      onChange={(e) => setNewEnterprise(prev => ({
                        ...prev,
                        key: e.target.value
                      }))}
                      placeholder="Clé unique"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nom</Label>
                    <Input
                      value={newEnterprise.name}
                      onChange={(e) => setNewEnterprise(prev => ({
                        ...prev,
                        name: e.target.value
                      }))}
                      placeholder="Nom de l'entreprise"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Rôle Discord ID</Label>
                    <Input
                      value={newEnterprise.discord_role_id}
                      onChange={(e) => setNewEnterprise(prev => ({
                        ...prev,
                        discord_role_id: e.target.value
                      }))}
                      placeholder="ID du rôle Discord"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Guilde Discord ID</Label>
                    <Input
                      value={newEnterprise.discord_guild_id}
                      onChange={(e) => setNewEnterprise(prev => ({
                        ...prev,
                        discord_guild_id: e.target.value
                      }))}
                      placeholder="ID de la guilde Discord"
                    />
                  </div>
                </div>
                <Button onClick={saveEnterprise}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter l'Entreprise
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Entreprises Existantes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-medium">Guilde</th>
                        <th className="text-left p-2 font-medium">Clé</th>
                        <th className="text-left p-2 font-medium">Nom</th>
                        <th className="text-left p-2 font-medium">Rôle Discord</th>
                        <th className="text-left p-2 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enterprises.map((enterprise) => (
                        <tr key={enterprise.id} className="border-b">
                          <td className="p-2">
                            <Badge variant="outline">{enterprise.guild_id}</Badge>
                          </td>
                          <td className="p-2">{enterprise.key}</td>
                          <td className="p-2">{enterprise.name}</td>
                          <td className="p-2">{enterprise.discord_role_id}</td>
                          <td className="p-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600"
                              onClick={() => deleteEnterprise(enterprise.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Gestion des paliers fiscaux */}
        <TabsContent value="tax-brackets">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Ajouter une Tranche Fiscale
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Guilde ID</Label>
                    <Input
                      value={newTaxBracket.guild_id}
                      onChange={(e) => setNewTaxBracket(prev => ({
                        ...prev,
                        guild_id: e.target.value
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bénéfice Min (€)</Label>
                    <Input
                      type="number"
                      value={newTaxBracket.min_profit}
                      onChange={(e) => setNewTaxBracket(prev => ({
                        ...prev,
                        min_profit: parseFloat(e.target.value) || 0
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bénéfice Max (€)</Label>
                    <Input
                      type="number"
                      value={newTaxBracket.max_profit}
                      onChange={(e) => setNewTaxBracket(prev => ({
                        ...prev,
                        max_profit: parseFloat(e.target.value) || 0
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Taux (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newTaxBracket.tax_rate}
                      onChange={(e) => setNewTaxBracket(prev => ({
                        ...prev,
                        tax_rate: parseFloat(e.target.value) || 0
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sal Max Employé (€)</Label>
                    <Input
                      type="number"
                      value={newTaxBracket.max_employee_salary}
                      onChange={(e) => setNewTaxBracket(prev => ({
                        ...prev,
                        max_employee_salary: parseFloat(e.target.value) || 0
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sal Max Patron (€)</Label>
                    <Input
                      type="number"
                      value={newTaxBracket.max_boss_salary}
                      onChange={(e) => setNewTaxBracket(prev => ({
                        ...prev,
                        max_boss_salary: parseFloat(e.target.value) || 0
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Prime Max Employé (€)</Label>
                    <Input
                      type="number"
                      value={newTaxBracket.max_employee_bonus}
                      onChange={(e) => setNewTaxBracket(prev => ({
                        ...prev,
                        max_employee_bonus: parseFloat(e.target.value) || 0
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Prime Max Patron (€)</Label>
                    <Input
                      type="number"
                      value={newTaxBracket.max_boss_bonus}
                      onChange={(e) => setNewTaxBracket(prev => ({
                        ...prev,
                        max_boss_bonus: parseFloat(e.target.value) || 0
                      }))}
                    />
                  </div>
                </div>
                <Button onClick={saveTaxBracket}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter la Tranche
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tranches Fiscales Existantes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-medium">Guilde</th>
                        <th className="text-left p-2 font-medium">Bénéfice Min</th>
                        <th className="text-left p-2 font-medium">Bénéfice Max</th>
                        <th className="text-left p-2 font-medium">Taux</th>
                        <th className="text-left p-2 font-medium">Sal Max Emp</th>
                        <th className="text-left p-2 font-medium">Sal Max Pat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {taxBrackets.map((bracket) => (
                        <tr key={bracket.id} className="border-b">
                          <td className="p-2">
                            <Badge variant="outline">{bracket.guild_id}</Badge>
                          </td>
                          <td className="p-2">{bracket.min_profit.toLocaleString('fr-FR')} €</td>
                          <td className="p-2">{bracket.max_profit.toLocaleString('fr-FR')} €</td>
                          <td className="p-2">
                            <Badge>{(bracket.tax_rate * 100).toFixed(1)}%</Badge>
                          </td>
                          <td className="p-2">{bracket.max_employee_salary.toLocaleString('fr-FR')} €</td>
                          <td className="p-2">{bracket.max_boss_salary.toLocaleString('fr-FR')} €</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Configuration Blanchiment */}
        <TabsContent value="blanchiment">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configuration Blanchiment
              </CardTitle>
              <CardDescription>
                Paramètres globaux et par entreprise pour le blanchiment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Configuration du blanchiment à implémenter...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sécurité */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Sécurité & RLS
              </CardTitle>
              <CardDescription>
                État des politiques de sécurité et liens Supabase
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
                      href="https://supabase.com/dashboard/project/pmhktnxqponixycsjcwr" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      Dashboard Supabase
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a 
                      href="https://supabase.com/dashboard/project/pmhktnxqponixycsjcwr/auth/users" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      Utilisateurs
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