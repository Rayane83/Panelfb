import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { 
  Building2, 
  Shield, 
  Users, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Clock,
  Calendar
} from 'lucide-react';
import { useSupabase } from '../hooks/useSupabase';
import { useAuth } from '../hooks/useAuth';

interface Enterprise {
  id: string;
  name: string;
  guild_id: string;
  blanchiment_enabled: boolean;
  type: string;
  employees_count: number;
  last_dotation_date?: string;
  dotation_status: 'sent' | 'not_sent' | 'late';
  days_since_dotation: number;
}

const StaffPage: React.FC = () => {
  const { user } = useAuth();
  const supabaseHooks = useSupabase();
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
      
      const enterprisesData = await supabaseHooks.getAllEnterprises();

      // Simuler les données de dotation et statut
      const processedEnterprises = enterprisesData.map(enterprise => {
        const lastDotationDays = Math.floor(Math.random() * 45); // 0-45 jours
        const lastDotationDate = new Date(Date.now() - lastDotationDays * 24 * 60 * 60 * 1000);
        
        let dotationStatus: 'sent' | 'not_sent' | 'late' = 'sent';
        if (lastDotationDays > 30) {
          dotationStatus = 'late';
        } else if (lastDotationDays > 25) {
          dotationStatus = 'not_sent';
        }

        return {
          ...enterprise,
          employees_count: Math.floor(Math.random() * 20) + 1,
          last_dotation_date: lastDotationDate.toISOString(),
          dotation_status: dotationStatus,
          days_since_dotation: lastDotationDays
        };
      });

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
      // Simulation de la mise à jour
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
    enterprise.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalEnterprises = enterprises.length;
  const blanchimentEnabled = enterprises.filter(e => e.blanchiment_enabled).length;
  const dotationsSent = enterprises.filter(e => e.dotation_status === 'sent').length;
  const dotationsLate = enterprises.filter(e => e.dotation_status === 'late').length;

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

  const getDotationStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'not_sent':
        return 'bg-yellow-100 text-yellow-800';
      case 'late':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDotationStatusText = (status: string) => {
    switch (status) {
      case 'sent':
        return 'Envoyée';
      case 'not_sent':
        return 'Non envoyée';
      case 'late':
        return 'En retard';
      default:
        return 'Inconnu';
    }
  };

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
          Gestion du blanchiment et suivi des dotations par entreprise
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
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{blanchimentEnabled}</div>
            <p className="text-xs text-muted-foreground">Entreprises autorisées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dotations Envoyées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{dotationsSent}</div>
            <p className="text-xs text-muted-foreground">À jour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dotations en Retard</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{dotationsLate}</div>
            <p className="text-xs text-muted-foreground">Nécessitent attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Recherche */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Recherche d'Entreprises</CardTitle>
          <CardDescription>
            Recherchez par nom, Guild ID ou type d'entreprise
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
          <CardTitle>Gestion des Entreprises</CardTitle>
          <CardDescription>
            Activez/désactivez le blanchiment et suivez le statut des dotations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEnterprises.map((enterprise) => (
              <div key={enterprise.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{enterprise.name}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {enterprise.blanchiment_enabled ? (
                          <Badge className="bg-green-100 text-green-800">
                            <Shield className="h-3 w-3 mr-1" />
                            Blanchiment Activé
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">
                            <XCircle className="h-3 w-3 mr-1" />
                            Blanchiment Désactivé
                          </Badge>
                        )}
                        <Badge variant="outline">{enterprise.type}</Badge>
                        <Badge className={getDotationStatusColor(enterprise.dotation_status)}>
                          <Calendar className="h-3 w-3 mr-1" />
                          {getDotationStatusText(enterprise.dotation_status)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-muted-foreground ml-8">
                    <span>Guild: {enterprise.guild_id}</span>
                    <span>Employés: {enterprise.employees_count}</span>
                    {enterprise.last_dotation_date && (
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          Dernière dotation: il y a {enterprise.days_since_dotation} jour(s)
                        </span>
                      </span>
                    )}
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

      {/* Actions rapides et informations */}
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
            <CardTitle className="text-blue-800">Suivi des Dotations</CardTitle>
            <CardDescription className="text-blue-700">
              Statuts et alertes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-blue-800">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Envoyée: Dotation reçue dans les temps</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span>Non envoyée: Dotation attendue</span>
            </div>
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span>En retard: Plus de 30 jours</span>
            </div>
            <p className="mt-3 text-xs">
              Les entreprises en retard nécessitent un suivi particulier
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffPage;