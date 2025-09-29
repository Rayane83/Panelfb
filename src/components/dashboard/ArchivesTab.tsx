import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Archive, Search, Filter, Download, Eye, CheckCircle, XCircle } from 'lucide-react'

export function ArchivesTab() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  
  const [archives] = useState([
    {
      id: '1',
      numero: 'ARC-2024-001',
      date: '2024-01-15',
      amount: 15000,
      description: 'Dotation Janvier 2024 - Équipe Alpha',
      status: 'Validé',
      type: 'Dotation',
      createdBy: 'Jean Dupont',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      numero: 'ARC-2024-002',
      date: '2024-01-10',
      amount: 8500,
      description: 'Calcul fiscal Q4 2023',
      status: 'En attente',
      type: 'Fiscal',
      createdBy: 'Marie Martin',
      createdAt: '2024-01-10'
    },
    {
      id: '3',
      numero: 'ARC-2024-003',
      date: '2024-01-05',
      amount: 25000,
      description: 'Opération blanchiment - Client Premium',
      status: 'Refusé',
      type: 'Blanchiment',
      createdBy: 'Pierre Durand',
      createdAt: '2024-01-05'
    }
  ])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Validé': return 'bg-green-100 text-green-800'
      case 'En attente': return 'bg-yellow-100 text-yellow-800'
      case 'Refusé': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Dotation': return 'bg-blue-100 text-blue-800'
      case 'Fiscal': return 'bg-purple-100 text-purple-800'
      case 'Blanchiment': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredArchives = archives.filter(archive => {
    const matchesSearch = archive.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         archive.numero.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || archive.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = [
    {
      title: "Total Archives",
      value: archives.length.toString(),
      description: "Documents archivés",
      icon: Archive,
      color: "text-blue-600"
    },
    {
      title: "En Attente",
      value: archives.filter(a => a.status === 'En attente').length.toString(),
      description: "À valider",
      icon: CheckCircle,
      color: "text-yellow-600"
    },
    {
      title: "Validés",
      value: archives.filter(a => a.status === 'Validé').length.toString(),
      description: "Approuvés",
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      title: "Refusés",
      value: archives.filter(a => a.status === 'Refusé').length.toString(),
      description: "Rejetés",
      icon: XCircle,
      color: "text-red-600"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Archives</h2>
        <p className="text-muted-foreground">
          Consultation et gestion des documents archivés
        </p>
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

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Recherche et Filtres</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Rechercher par numéro ou description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background"
              />
            </div>
            <div className="w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background"
              >
                <option value="all">Tous les statuts</option>
                <option value="En attente">En attente</option>
                <option value="Validé">Validé</option>
                <option value="Refusé">Refusé</option>
              </select>
            </div>
            <Button>
              <Filter className="h-4 w-4 mr-2" />
              Filtrer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Archives List */}
      <Card>
        <CardHeader>
          <CardTitle>Documents Archivés</CardTitle>
          <CardDescription>
            {filteredArchives.length} document(s) trouvé(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredArchives.map((archive) => (
              <div key={archive.id} className="flex items-center justify-between p-4 border rounded-lg card-hover">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-medium">{archive.numero}</h4>
                    <Badge className={getStatusColor(archive.status)}>
                      {archive.status}
                    </Badge>
                    <Badge variant="outline" className={getTypeColor(archive.type)}>
                      {archive.type}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {archive.description}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Montant: {formatCurrency(archive.amount)} • 
                    Date: {new Date(archive.date).toLocaleDateString('fr-FR')} • 
                    Créé par: {archive.createdBy}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Voir
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                  {archive.status === 'En attente' && (
                    <>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Valider
                      </Button>
                      <Button size="sm" variant="destructive">
                        <XCircle className="h-4 w-4 mr-1" />
                        Refuser
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}