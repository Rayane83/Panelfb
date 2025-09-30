import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { 
  Shield, 
  Monitor, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Search,
  Plus,
  Trash2,
  Eye,
  Lock
} from 'lucide-react'

export function HWIPAdminPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [newHWID, setNewHWID] = useState('')
  
  const [hwipDevices] = useState([
    {
      id: '1',
      hwid: 'HWID-ABC123-DEF456-GHI789',
      username: 'Jean Dupont',
      discordId: '123456789012345678',
      status: 'Autorisé',
      lastSeen: '2024-01-20 14:30',
      attempts: 0,
      deviceInfo: 'Windows 11 - Chrome 120'
    },
    {
      id: '2',
      hwid: 'HWID-XYZ987-UVW654-RST321',
      username: 'Marie Martin',
      discordId: '987654321098765432',
      status: 'Bloqué',
      lastSeen: '2024-01-19 09:15',
      attempts: 3,
      deviceInfo: 'Windows 10 - Firefox 121'
    },
    {
      id: '3',
      hwid: 'HWID-LMN456-OPQ789-ABC123',
      username: 'Pierre Durand',
      discordId: '456789123456789123',
      status: 'En attente',
      lastSeen: '2024-01-20 16:45',
      attempts: 1,
      deviceInfo: 'macOS 14 - Safari 17'
    }
  ])

  const [securityLogs] = useState([
    {
      id: '1',
      timestamp: '2024-01-20 16:45:23',
      event: 'Tentative de connexion',
      hwid: 'HWID-LMN456-OPQ789-ABC123',
      username: 'Pierre Durand',
      status: 'Bloqué',
      reason: 'HWID non autorisé'
    },
    {
      id: '2',
      timestamp: '2024-01-20 14:30:12',
      event: 'Connexion réussie',
      hwid: 'HWID-ABC123-DEF456-GHI789',
      username: 'Jean Dupont',
      status: 'Succès',
      reason: 'HWID autorisé'
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Autorisé': return 'bg-green-100 text-green-800'
      case 'Bloqué': return 'bg-red-100 text-red-800'
      case 'En attente': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Autorisé': return <CheckCircle className="h-4 w-4" />
      case 'Bloqué': return <XCircle className="h-4 w-4" />
      case 'En attente': return <AlertTriangle className="h-4 w-4" />
      default: return <Monitor className="h-4 w-4" />
    }
  }

  const filteredDevices = hwipDevices.filter(device =>
    device.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.hwid.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = [
    {
      title: "Dispositifs Autorisés",
      value: hwipDevices.filter(d => d.status === 'Autorisé').length.toString(),
      description: "Accès accordé",
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      title: "Dispositifs Bloqués",
      value: hwipDevices.filter(d => d.status === 'Bloqué').length.toString(),
      description: "Accès refusé",
      icon: XCircle,
      color: "text-red-600"
    },
    {
      title: "En Attente",
      value: hwipDevices.filter(d => d.status === 'En attente').length.toString(),
      description: "Validation requise",
      icon: AlertTriangle,
      color: "text-yellow-600"
    },
    {
      title: "Total Dispositifs",
      value: hwipDevices.length.toString(),
      description: "Enregistrés",
      icon: Monitor,
      color: "text-blue-600"
    }
  ]

  const handleAddHWID = () => {
    if (newHWID.trim()) {
      console.log('Ajout HWID:', newHWID)
      setNewHWID('')
      alert('HWID ajouté avec succès !')
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center space-x-3">
            <Shield className="h-8 w-8 text-red-600" />
            <span>Administration HWIP</span>
          </h1>
          <p className="text-muted-foreground">
            Gestion des restrictions matérielles et contrôle d'accès par dispositif
          </p>
        </div>
        <Badge className="bg-red-100 text-red-800 px-4 py-2">
          <Lock className="h-4 w-4 mr-2" />
          Sécurité Maximale
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Add New HWID */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Ajouter un Nouveau HWID</span>
          </CardTitle>
          <CardDescription className="text-blue-700">
            Autoriser un nouveau dispositif matériel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="HWID-XXXXX-XXXXX-XXXXX"
              value={newHWID}
              onChange={(e) => setNewHWID(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAddHWID} className="btn-glow">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Recherche de Dispositifs</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Rechercher par nom d'utilisateur ou HWID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Devices List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Monitor className="h-5 w-5" />
            <span>Dispositifs Enregistrés</span>
          </CardTitle>
          <CardDescription>
            {filteredDevices.length} dispositif(s) trouvé(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredDevices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg card-hover">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-medium">{device.username}</h4>
                    <Badge className={getStatusColor(device.status)}>
                      {getStatusIcon(device.status)}
                      <span className="ml-1">{device.status}</span>
                    </Badge>
                    {device.attempts > 0 && (
                      <Badge variant="outline" className="text-red-600">
                        {device.attempts} tentative(s)
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    HWID: {device.hwid}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Discord: {device.discordId} • 
                    Dernière connexion: {device.lastSeen} • 
                    {device.deviceInfo}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Détails
                  </Button>
                  {device.status === 'En attente' && (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Autoriser
                    </Button>
                  )}
                  {device.status === 'Autorisé' && (
                    <Button size="sm" variant="destructive">
                      <XCircle className="h-4 w-4 mr-1" />
                      Bloquer
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Supprimer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Logs de Sécurité</span>
          </CardTitle>
          <CardDescription>
            Historique des tentatives de connexion et événements de sécurité
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium">{log.event}</span>
                    <Badge className={log.status === 'Succès' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {log.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Utilisateur: {log.username} • HWID: {log.hwid}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {log.timestamp} • Raison: {log.reason}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800 flex items-center space-x-2">
            <Lock className="h-5 w-5" />
            <span>Paramètres de Sécurité HWIP</span>
          </CardTitle>
          <CardDescription className="text-red-700">
            Configuration avancée de la sécurité matérielle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2 text-red-800">
                Tentatives Max Autorisées
              </label>
              <Input
                type="number"
                defaultValue="3"
                className="border-red-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-red-800">
                Durée de Blocage (heures)
              </label>
              <Input
                type="number"
                defaultValue="24"
                className="border-red-300"
              />
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-red-800">Mode Strict HWIP</span>
              <Button variant="destructive" size="sm">
                Activé
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-red-800">Auto-blocage Tentatives</span>
              <Button variant="destructive" size="sm">
                Activé
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-red-800">Notifications Sécurité</span>
              <Button variant="outline" size="sm">
                Activé
              </Button>
            </div>
          </div>
          <Button className="mt-6 w-full" variant="destructive">
            Sauvegarder Configuration Sécurité
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}