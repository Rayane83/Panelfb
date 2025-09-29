import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { FileText, Upload, Download, Eye, Trash2, Tag, Search } from 'lucide-react'

export function DocumentsTab() {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  
  const [documents] = useState([
    {
      id: '1',
      name: 'Facture_Client_A_Janvier.pdf',
      type: 'facture',
      fileSize: 245760,
      mimeType: 'application/pdf',
      owner: 'Jean Dupont',
      uploadDate: '2024-01-15',
      tags: ['client-a', 'janvier', 'facture']
    },
    {
      id: '2',
      name: 'Diplome_Formation_Securite.pdf',
      type: 'diplome',
      fileSize: 1048576,
      mimeType: 'application/pdf',
      owner: 'Marie Martin',
      uploadDate: '2024-01-10',
      tags: ['formation', 'sécurité', 'certification']
    },
    {
      id: '3',
      name: 'Contrat_Partenariat_TechCorp.docx',
      type: 'facture',
      fileSize: 524288,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      owner: 'Pierre Durand',
      uploadDate: '2024-01-08',
      tags: ['contrat', 'partenariat', 'techcorp']
    }
  ])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'facture': return 'bg-blue-100 text-blue-800'
      case 'diplome': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'facture': return 'Facture'
      case 'diplome': return 'Diplôme'
      default: return type
    }
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = typeFilter === 'all' || doc.type === typeFilter
    return matchesSearch && matchesType
  })

  const stats = [
    {
      title: "Total Documents",
      value: documents.length.toString(),
      description: "Fichiers stockés",
      icon: FileText,
      color: "text-blue-600"
    },
    {
      title: "Factures",
      value: documents.filter(d => d.type === 'facture').length.toString(),
      description: "Documents factures",
      icon: FileText,
      color: "text-green-600"
    },
    {
      title: "Diplômes",
      value: documents.filter(d => d.type === 'diplome').length.toString(),
      description: "Certifications",
      icon: FileText,
      color: "text-purple-600"
    },
    {
      title: "Espace Utilisé",
      value: formatFileSize(documents.reduce((acc, doc) => acc + doc.fileSize, 0)),
      description: "Stockage total",
      icon: FileText,
      color: "text-orange-600"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestion des Documents</h2>
          <p className="text-muted-foreground">
            Upload, organisation et gestion de vos documents d'entreprise
          </p>
        </div>
        <Button className="btn-glow">
          <Upload className="h-4 w-4 mr-2" />
          Uploader Document
        </Button>
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
                placeholder="Rechercher par nom ou tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background"
              />
            </div>
            <div className="w-48">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background"
              >
                <option value="all">Tous les types</option>
                <option value="facture">Factures</option>
                <option value="diplome">Diplômes</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>
            {filteredDocuments.length} document(s) trouvé(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredDocuments.map((document) => (
              <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg card-hover">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-medium">{document.name}</h4>
                    <Badge className={getTypeColor(document.type)}>
                      {getTypeLabel(document.type)}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Taille: {formatFileSize(document.fileSize)} • 
                    Propriétaire: {document.owner} • 
                    Uploadé: {new Date(document.uploadDate).toLocaleDateString('fr-FR')}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Tag className="h-3 w-3 text-muted-foreground" />
                    <div className="flex space-x-1">
                      {document.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Voir
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Télécharger
                  </Button>
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

      {/* Upload Zone */}
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Upload className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Glissez-déposez vos fichiers ici
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            ou cliquez pour sélectionner des fichiers
          </p>
          <Button>
            Choisir des fichiers
          </Button>
          <p className="text-xs text-gray-400 mt-2">
            Formats supportés: PDF, DOC, DOCX, JPG, PNG (Max: 10MB)
          </p>
        </CardContent>
      </Card>
    </div>
  )
}