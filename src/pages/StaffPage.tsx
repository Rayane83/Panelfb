import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { 
  Building2, 
  Shield, 
  Users, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search
} from 'lucide-react';
import { Input } from '../components/ui/input';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface Enterprise {
  id: string;
  name: string;
  guild_id: string;
  blanchiment_enabled: boolean;
  sector?: {
    name: string;
  };
  employees_count: number;
  last_activity: string;
}

const StaffPage: React.FC = () => {
  const { user } = useAuth();
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    loadEnterprises();
  }, []);

  const loadEnterprises = async () => {
    try {
      setLoading(true);
      
      const { data: enterprisesData, error } = await supabase
        .from('enterprises')
        .select(`
          *,
          sector:sectors(name),
          employees:employees(count)
        `)
        .order('name', { ascending: true });

      if (error) throw error;

      // Simuler le nombre d'employés et dernière activité
      const processedEnterprises = enterprisesData.map(enterprise => ({
        ...enterprise,
        employees_count: Math.floor(Math.random() * 20) + 1,
        last_activity: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      }));

      setEnterprises(processedEnterprises);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      showToast('error', 'Erreur lors du chargement des entreprises');
    } finally {
      setLoading(false);
    }
  };

  const toggleBlanchiment = async (enterpriseId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('enterprises')
        .update({ blanchiment_enabled: enabled })
        .eq('id', enterpriseId);

      if (error) throw error;

      setEnterprises(prev => prev.map(enterprise => 
        enterprise.id === enterpriseId 
          ? { ...enterprise, blanchiment_enabled: enabled }
          : enterprise
      ));

      const enterprise = enterprises.find(e => e.id === enterpriseId);
      showToast('success', 
        `Blanchiment ${enabled ? 'activé' : 'désactivé'} pour ${enterprise?.name}`
      );
    } catch (error) {
      console.error('Erreur:', error);
      showToast('error', 'Erreur lors de la modification');
    }
  };

  const filteredEnterprises = enterprises.filter(enterprise =>
    enterprise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enterprise.guild_id.includes(searchTerm) ||
    enterprise.sector?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalEnterprises = enterprises.length;
  const blanchimentEnabled = enterprises.filter(e => e.blanchiment_enabled).length;
  const blanchimentDisabled = totalEnterprises - blanchimentEnabled;

  // Vérifier les permissions
  if (!user || (user.role !== 'superviseur' && user.role !== 'superadmin')) {
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
          <p>Chargement des entreprises...</p>
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
        <h1 className="text-3xl font-bold tracking-tight">Gestion Staff</h1>
        <p className="text-muted-foreground">
          Gestion des entreprises et activation/désactivation du blanchiment
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entreprises</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnterprises}</div>
            <p className="text-xs text-muted-foreground">Entreprises enregistrées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blanchiment Activé</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{blanchimentEnabled}</div>
            <p className="text-xs text-muted-foreground">Entreprises autorisées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blanchiment Désactivé</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{blanchimentDisabled}</div>
            <p className="text-xs text-muted-foreground">Entreprises non autorisées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'Activation</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalEnterprises > 0 ? Math.round((blanchimentEnabled / totalEnterprises) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Blanchiment activé</p>
          </CardContent>
        </Card>
      </div>

      {/* Recherche */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Recherche d'Entreprises</CardTitle>
          <CardDescription>
            Recherchez par nom, Guild ID ou secteur d'activité
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une entreprise..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Liste des entreprises */}
      <Card>
        <CardHeader>
          <CardTitle>Gestion du Blanchiment par Entreprise</CardTitle>
          <CardDescription>
            Activez ou désactivez l'espace blanchiment pour chaque entreprise
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEnterprises.map((enterprise) => (
              <div key={enterprise.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{enterprise.name}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {enterprise.blanchiment_enabled ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Blanchiment Activé
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">
                            <XCircle className="h-3 w-3 mr-1" />
                            Blanchiment Désactivé
                          </Badge>
                        )}
                        {enterprise.sector && (
                          <Badge variant="outline">{enterprise.sector.name}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground ml-8">
                    <span>Guild: {enterprise.guild_id}</span>
                    <span>Employés: {enterprise.employees_count}</span>
                    <span>Dernière activité: {new Date(enterprise.last_activity).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={`blanchiment-${enterprise.id}`} className="text-sm">
                      Blanchiment
                    </Label>
                    <Switch
                      id={`blanchiment-${enterprise.id}`}
                      checked={enterprise.blanchiment_enabled}
                      onCheckedChange={(checked) => toggleBlanchiment(enterprise.id, checked)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredEnterprises.length === 0 && (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                {searchTerm ? 'Aucune entreprise trouvée' : 'Aucune entreprise'}
              </p>
              <p className="text-sm text-muted-foreground">
                {searchTerm ? 'Essayez de modifier vos critères de recherche' : 'Les entreprises apparaîtront ici une fois créées'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <div className="grid gap-4 md:grid-cols-2 mt-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Actions Rapides</CardTitle>
            <CardDescription className="text-green-700">
              Gestion en lot des autorisations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => {
                if (confirm('Activer le blanchiment pour toutes les entreprises ?')) {
                  enterprises.forEach(enterprise => {
                    if (!enterprise.blanchiment_enabled) {
                      toggleBlanchiment(enterprise.id, true);
                    }
                  });
                }
              }}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Activer Tout
            </Button>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => {
                if (confirm('Désactiver le blanchiment pour toutes les entreprises ?')) {
                  enterprises.forEach(enterprise => {
                    if (enterprise.blanchiment_enabled) {
                      toggleBlanchiment(enterprise.id, false);
                    }
                  });
                }
              }}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Désactiver Tout
            </Button>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Informations</CardTitle>
            <CardDescription className="text-blue-700">
              Statistiques et conseils
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-blue-800">
            <p>• Le blanchiment peut être activé/désactivé à tout moment</p>
            <p>• Les entreprises avec blanchiment activé peuvent accéder à l'onglet correspondant</p>
            <p>• Les modifications sont appliquées immédiatement</p>
            <p>• Utilisez la recherche pour trouver rapidement une entreprise</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffPage;