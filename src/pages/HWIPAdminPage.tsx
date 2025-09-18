import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { useState } from 'react'
import { Shield, Monitor, AlertTriangle, CheckCircle, XCircle, Search } from 'lucide-react'

interface HWIPDevice {
  id: string
  fingerprint: string
  username: string
  status: 'authorized' | 'blocked' | 'pending'
  lastSeen: Date
  location: string
  deviceInfo: string
}

export function HWIPAdminPage() {
  const [searchTerm, setSearchTerm] = useState('')
  
  const mockDevices: HWIPDevice[] = [
    {
      id: '1',
      fingerprint: 'FP-ABC123DEF456',
      username: 'JeanDupont#1234',
      status: 'authorized',
      lastSeen: new Date(),
      location: 'Paris, FR',
      deviceInfo: 'Windows 11, Chrome 120'
    },
    {
      id: '2',
      fingerprint: 'FP-GHI789JKL012',
      username: 'MarieMartín#5678',
      status: 'authorized',
      lastSeen: new Date(Date.now() - 3600000),
      location: 'Lyon, FR',
      deviceInfo: 'macOS Sonoma, Safari 17'
    },
    {
      id: '3',
      fingerprint: 'FP-MNO345PQR678',
      username: 'Unknown',
      status: 'pending',
      lastSeen: new Date(Date.now() - 1800000),
      location: 'Unknown',
      deviceInfo: 'Linux Ubuntu, Firefox 121'
    },
    {
      id: '4',
      fingerprint: 'FP-STU901VWX234',
      username: 'SuspiciousUser#9999',
      status: 'blocked',
      lastSeen: new Date(Date.now() - 86400000),
      location: 'Moscow, RU',
      deviceInfo: 'Windows 10, Chrome 119'
    }
  ]

  const filteredDevices = mockDevices.filter(device => 
    device.fingerprint.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const statusColors = {
    authorized: 'bg-green-100 text-green-800',
    blocked: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800'
  }

  const statusIcons = {
    authorized: CheckCircle,
    blocked: XCircle,
    pending: AlertTriangle
  }

  const authorizedCount = mockDevices.filter(d => d.status === 'authorized').length
  const blockedCount = mockDevices.filter(d => d.status === 'blocked').length
  const pendingCount = mockDevices.filter(d => d.status === 'pending').length

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex items-center space-x-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Shield className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-600">Administration HWIP</h1>
          <p className="text-muted-foreground">
            Gestion des restrictions d'accès basées sur l'empreinte matérielle
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dispositifs Autorisés</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{authorizedCount}</div>
            <p className="text-xs text-muted-foreground">Accès autorisé</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dispositifs Bloqués</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{blockedCount}</div>
            <p className="text-xs text-muted-foreground">Accès refusé</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Validation requise</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Dispositifs</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockDevices.length}</div>
            <p className="text-xs text-muted-foreground">Dans le système</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Recherche et Filtres</CardTitle>
          <CardDescription>
            Trouvez rapidement un dispositif par empreinte ou utilisateur
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par empreinte ou nom d'utilisateur..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gestion des Dispositifs</CardTitle>
          <CardDescription>
            Liste complète des dispositifs avec leurs statuts d'autorisation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredDevices.map((device) => {
              const StatusIcon = statusIcons[device.status]
              
              return (
                <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    <StatusIcon className={`h-6 w-6 ${
                      device.status === 'authorized' ? 'text-green-600' : 
                      device.status === 'blocked' ? 'text-red-600' : 'text-yellow-600'
                    }`} />
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium font-mono">{device.fingerprint}</p>
                        <Badge className={statusColors[device.status]}>
                          {device.status === 'authorized' ? 'Autorisé' : 
                           device.status === 'blocked' ? 'Bloqué' : 'En attente'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Utilisateur: {device.username}</span>
                        <span>Localisation: {device.location}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <span>{device.deviceInfo}</span>
                        <span className="ml-4">Dernière activité: {device.lastSeen.toLocaleString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {device.status === 'pending' && (
                      <>
                        <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Autoriser
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <XCircle className="h-4 w-4 mr-1" />
                          Bloquer
                        </Button>
                      </>
                    )}
                    {device.status === 'authorized' && (
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <XCircle className="h-4 w-4 mr-1" />
                        Révoquer
                      </Button>
                    )}
                    {device.status === 'blocked' && (
                      <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Débloquer
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      Détails
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
          
          {filteredDevices.length === 0 && (
            <div className="text-center py-8">
              <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">Aucun dispositif trouvé</p>
              <p className="text-sm text-muted-foreground">Essayez de modifier vos critères de recherche</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Configuration HWIP</CardTitle>
            <CardDescription className="text-blue-700">
              Paramètres de sécurité matérielle
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Autorisation automatique</span>
                <Badge variant="outline">Désactivée</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Période d'expiration</span>
                <Badge variant="outline">30 jours</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Max dispositifs/utilisateur</span>
                <Badge variant="outline">3</Badge>
              </div>
            </div>
            <Button className="w-full" variant="outline">
              <Shield className="mr-2 h-4 w-4" />
              Modifier la Configuration
            </Button>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Logs de Sécurité</CardTitle>
            <CardDescription className="text-yellow-700">
              Dernières tentatives d'accès suspectes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p className="text-yellow-800">• [14:32] Tentative d'accès depuis dispositif non autorisé</p>
              <p className="text-yellow-800">• [12:15] Nouveau dispositif détecté (en attente)</p>
              <p className="text-yellow-800">• [09:45] Dispositif révoqué pour activité suspecte</p>
              <p className="text-yellow-800">• [08:30] Échec d'authentification HWIP répété</p>
            </div>
            <Button className="w-full mt-4" variant="outline">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Voir Tous les Logs
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}