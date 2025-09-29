import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { Switch } from '../ui/switch'
import { AlertTriangle, Settings, Users, Shield, Database, Server } from 'lucide-react'

export function ConfigStaffTab() {
  const systemSettings = [
    { key: 'maintenance_mode', label: 'Mode Maintenance', value: false, description: 'Active le mode maintenance du système' },
    { key: 'debug_mode', label: 'Mode Debug', value: true, description: 'Affiche les logs détaillés' },
    { key: 'auto_backup', label: 'Sauvegarde Auto', value: true, description: 'Sauvegarde automatique quotidienne' },
    { key: 'rate_limiting', label: 'Limitation de Débit', value: true, description: 'Active la limitation des requêtes' }
  ]

  const privilegedUsers = [
    { id: '1', username: 'fondateur', role: 'superadmin', lastLogin: new Date(), active: true },
    { id: '2', username: 'superviseur_1', role: 'superviseur', lastLogin: new Date(Date.now() - 86400000), active: true },
    { id: '3', username: 'superviseur_2', role: 'superviseur', lastLogin: new Date(Date.now() - 172800000), active: false }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <AlertTriangle className="h-6 w-6 text-red-500" />
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-red-600">Configuration Staff</h2>
          <p className="text-muted-foreground">
            Paramètres système avancés - Accès Fondateur uniquement
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{privilegedUsers.filter(u => u.active).length}</div>
            <p className="text-xs text-muted-foreground">Actifs sur {privilegedUsers.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Statut Système</CardTitle>
            <Server className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Opérationnel</div>
            <p className="text-xs text-muted-foreground">Tous services actifs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sauvegardes</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">Cette semaine</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800 flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Zone de Configuration Critique</span>
          </CardTitle>
          <CardDescription className="text-red-700">
            Les modifications dans cette section peuvent affecter l'ensemble du système. 
            Procédez avec précaution.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {systemSettings.map((setting, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Label className="font-medium">{setting.label}</Label>
                    {setting.key === 'maintenance_mode' && (
                      <Badge variant="destructive" className="text-xs">Critique</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{setting.description}</p>
                </div>
                <Switch defaultChecked={setting.value} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gestion des Utilisateurs Staff</CardTitle>
            <CardDescription>
              Utilisateurs avec privilèges administratifs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {privilegedUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${user.active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{user.role}</Badge>
                        <span className="text-xs text-muted-foreground">
                          Dernière connexion: {user.lastLogin.toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Gérer
                  </Button>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Ajouter un Utilisateur Staff
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Outils d'Administration</CardTitle>
            <CardDescription>
              Actions système et utilitaires de maintenance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Button variant="outline" className="justify-start">
                <Database className="mr-2 h-4 w-4" />
                Forcer Sauvegarde Complète
              </Button>
              <Button variant="outline" className="justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Vider le Cache Système
              </Button>
              <Button variant="outline" className="justify-start">
                <Server className="mr-2 h-4 w-4" />
                Redémarrer les Services
              </Button>
            </div>
            
            <div className="pt-4 border-t">
              <Label className="text-sm font-medium text-red-600">Actions Dangereuses</Label>
              <div className="grid gap-2 mt-2">
                <Button variant="destructive" className="justify-start">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Réinitialiser Configuration
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Logs Système</CardTitle>
          <CardDescription>
            Dernières activités du système
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 font-mono text-sm bg-black text-green-400 p-4 rounded-lg max-h-64 overflow-y-auto">
            <p>[2024-01-15 14:32:15] INFO: Système démarré avec succès</p>
            <p>[2024-01-15 14:32:16] INFO: Base de données connectée</p>
            <p>[2024-01-15 14:32:17] INFO: Discord OAuth configuré</p>
            <p>[2024-01-15 14:32:18] INFO: Tous les services actifs</p>
            <p>[2024-01-15 14:35:22] INFO: Utilisateur 'admin' connecté</p>
            <p>[2024-01-15 14:36:45] WARN: Tentative de connexion échouée pour 'unknown_user'</p>
            <p>[2024-01-15 14:45:12] INFO: Sauvegarde automatique effectuée</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}