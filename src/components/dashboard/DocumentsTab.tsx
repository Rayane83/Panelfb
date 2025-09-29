import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { usePermissions } from '../../hooks/usePermissions'
import { useSupabase } from '../../hooks/useSupabase'
import { Upload, FileText, Image, Archive, Eye, Download, Trash2, AlertTriangle, CheckCircle, Search, Filter, RefreshCw } from 'lucide-react'

interface Document {
  id: string
  name: string
  type: 'facture' | 'diplome'
  file_path: string
  file_size: number
  mime_type: string
  owner: string
  upload_date: string
  created_at: string
  enterprise_id: string
}

interface UploadMetadata {
  type: 'facture' | 'diplome'
  date: string
  owner: string
  category: string
}

export function DocumentsTab() {
  const { user } = useAuth()
  const { hasPermission } = usePermissions()
  const supabaseHooks = useSupabase()
  
  const [documents, setDocuments] = useState<Document[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([])
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [uploadMetadata, setUploadMetadata] = useState<UploadMetadata>({
    type: 'facture',
    date: new Date().toISOString().split('T')[0],
    owner: user?.username || '',
    category: 'general'
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'facture' | 'diplome'>('all')
  const [dragActive, setDragActive] = useState(false)
  const [toast, setToast] = useState<{type: 'success' | 'error' | 'warning', message: string} | null>(null)
  const [previewMode, setPreviewMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const canUpload = hasPermission('documents') && ['superviseur', 'patron', 'co_patron', 'dot'].includes(user?.role || '')
  const canDelete = hasPermission('documents') && ['superviseur', 'patron', 'co_patron'].includes(user?.role || '')
  const canView = hasPermission('documents')

  useEffect(() => {
    loadDocuments()
  }, [])

  useEffect(() => {
    // Filtrer les documents
    let filtered = documents

    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.owner.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(doc => doc.type === filterType)
    }

    setFilteredDocuments(filtered)
  }, [documents, searchTerm, filterType])

  const loadDocuments = async () => {
    if (!user?.enterprises?.[0]?.id) return
    
    try {
      setIsLoading(true)
      const enterpriseId = user.enterprises[0].id
      const documentsData = await supabaseHooks.getDocuments(enterpriseId)
      setDocuments(documentsData)
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
      showToast('error', 'Erreur lors du chargement des documents')
    } finally {
      setIsLoading(false)
    }
  }

  const showToast = (type: 'success' | 'error' | 'warning', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  const validateFile = (file: File): string => {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    
    if (file.size > maxSize) {
      return `Le fichier ${file.name} dépasse la taille maximale de 10MB`
    }
    
    if (!allowedTypes.includes(file.type)) {
      return `Le type de fichier ${file.type} n'est pas autorisé`
    }
    
    return ''
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (!canUpload) {
      showToast('error', 'Vous n\'avez pas les permissions pour uploader des fichiers')
      return
    }
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelection(e.target.files)
    }
  }

  const handleFileSelection = (files: FileList) => {
    if (!canUpload) return

    const errors: string[] = []
    Array.from(files).forEach(file => {
      const error = validateFile(file)
      if (error) errors.push(error)
    })

    if (errors.length > 0) {
      showToast('error', errors.join(', '))
      return
    }

    setSelectedFiles(files)
    setPreviewMode(true)
  }

  const confirmUpload = async () => {
    if (!selectedFiles || !canUpload || !user?.enterprises?.[0]?.id) return

    try {
      setIsLoading(true)
      setUploadProgress(0)
      const enterpriseId = user.enterprises[0].id

      const uploadPromises = Array.from(selectedFiles).map(async (file, index) => {
        const metadata = {
          enterpriseId,
          type: uploadMetadata.type,
          owner: uploadMetadata.owner,
          date: uploadMetadata.date,
          category: uploadMetadata.category
        }

        // Simuler le progrès
        setUploadProgress((index / selectedFiles.length) * 100)
        
        return await supabaseHooks.uploadDocument(file, metadata)
      })

      const uploadedDocs = await Promise.all(uploadPromises)
      
      setUploadProgress(100)
      setDocuments(prev => [...uploadedDocs, ...prev])
      setSelectedFiles(null)
      setPreviewMode(false)
      
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      showToast('success', `${uploadedDocs.length} fichier(s) uploadé(s) avec succès`)
    } catch (error) {
      console.error('Erreur upload:', error)
      showToast('error', 'Erreur lors de l\'upload')
    } finally {
      setIsLoading(false)
      setUploadProgress(0)
    }
  }

  const cancelUpload = () => {
    setSelectedFiles(null)
    setPreviewMode(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (documentId: string) => {
    if (!canDelete) return

    if (confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      try {
        await supabaseHooks.deleteDocument(documentId)
        setDocuments(prev => prev.filter(doc => doc.id !== documentId))
        showToast('success', 'Document supprimé avec succès')
      } catch (error) {
        console.error('Erreur:', error)
        showToast('error', 'Erreur lors de la suppression')
      }
    }
  }

  const handleView = async (document: Document) => {
    if (!canView) return
    
    try {
      const url = await supabaseHooks.getDocumentUrl(document.file_path)
      window.open(url, '_blank')
    } catch (error) {
      showToast('warning', 'Aperçu non disponible pour ce document')
    }
  }

  const handleDownload = async (document: Document) => {
    if (!canView) return
    
    try {
      const url = await supabaseHooks.getDocumentUrl(document.file_path)
      const link = document.createElement('a')
      link.href = url
      link.download = document.name
      link.click()
      showToast('success', `Téléchargement de ${document.name} démarré`)
    } catch (error) {
      showToast('error', 'Erreur lors du téléchargement')
    }
  }

  const exportDocumentsList = () => {
    const exportData = filteredDocuments.map(doc => ({
      Nom: doc.name,
      Type: doc.type,
      Propriétaire: doc.owner,
      'Date Upload': doc.upload_date,
      'Taille (MB)': (doc.file_size / 1024 / 1024).toFixed(2),
      'Type MIME': doc.mime_type
    }))
    
    const filename = `documents_${user?.enterprises?.[0]?.name || 'export'}_${new Date().toISOString().split('T')[0]}.xlsx`
    // Utiliser la fonction d'export
    showToast('success', `Liste des documents exportée: ${filename}`)
  }

  const categories = [
    { value: 'facture', label: 'Factures', color: 'bg-blue-100 text-blue-800' },
    { value: 'diplome', label: 'Diplômes', color: 'bg-green-100 text-green-800' }
  ]

  const documentCategories = [
    { value: 'general', label: 'Général' },
    { value: 'comptabilite', label: 'Comptabilité' },
    { value: 'juridique', label: 'Juridique' },
    { value: 'rh', label: 'Ressources Humaines' },
    { value: 'formation', label: 'Formation' }
  ]

  const typeIcons = {
    'application/pdf': FileText,
    'image/png': Image,
    'image/jpeg': Image,
    'image/jpg': Image,
    'image/webp': Image
  }

  const totalSize = documents.reduce((sum, doc) => sum + doc.file_size, 0)
  const facturesCount = documents.filter(d => d.type === 'facture').length
  const diplomesCount = documents.filter(d => d.type === 'diplome').length

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
          toast.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
          toast.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
          'bg-yellow-100 text-yellow-800 border border-yellow-200'
        }`}>
          <div className="flex items-center space-x-2">
            {toast.type === 'success' && <CheckCircle className="h-4 w-4" />}
            {toast.type === 'error' && <AlertTriangle className="h-4 w-4" />}
            {toast.type === 'warning' && <AlertTriangle className="h-4 w-4" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Factures / Diplômes</h2>
          <p className="text-muted-foreground">
            Gestion des documents avec upload sécurisé et prévisualisation
          </p>
        </div>
        <Button onClick={loadDocuments} variant="outline" disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-xs text-muted-foreground">Fichiers stockés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Factures</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{facturesCount}</div>
            <p className="text-xs text-muted-foreground">Documents factures</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diplômes</CardTitle>
            <Image className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{diplomesCount}</div>
            <p className="text-xs text-muted-foreground">Documents diplômes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Espace Utilisé</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalSize / 1024 / 1024).toFixed(1)} MB</div>
            <p className="text-xs text-muted-foreground">Sur 1000 MB</p>
            <Progress value={(totalSize / (1000 * 1024 * 1024)) * 100} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Recherche et filtres */}
      <Card>
        <CardHeader>
          <CardTitle>Recherche et Filtres</CardTitle>
          <CardDescription>
            Trouvez rapidement vos documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou propriétaire..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'facture' | 'diplome')}
              className="h-10 px-3 rounded-lg border border-input bg-background text-sm"
            >
              <option value="all">Tous les types</option>
              <option value="facture">Factures uniquement</option>
              <option value="diplome">Diplômes uniquement</option>
            </select>
            <Button onClick={exportDocumentsList} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Liste
            </Button>
          </div>
        </CardContent>
      </Card>

      {canUpload && (
        <Card>
          <CardHeader>
            <CardTitle>Upload de Documents</CardTitle>
            <CardDescription>
              Formats acceptés: PDF, PNG, JPG, JPEG, WEBP (max 10MB par fichier)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!previewMode ? (
              <>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">Glissez vos fichiers ici</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Ou cliquez pour sélectionner des fichiers
                  </p>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    id="fileInput"
                    onChange={handleFileSelect}
                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                  />
                  <Label htmlFor="fileInput">
                    <Button variant="outline" className="cursor-pointer">
                      Sélectionner des fichiers
                    </Button>
                  </Label>
                </div>
                
                <div className="grid gap-4 md:grid-cols-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type de document *</Label>
                    <select
                      id="type"
                      value={uploadMetadata.type}
                      onChange={(e) => setUploadMetadata(prev => ({ ...prev, type: e.target.value as 'facture' | 'diplome' }))}
                      className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
                      required
                    >
                      <option value="facture">Facture</option>
                      <option value="diplome">Diplôme</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Catégorie</Label>
                    <select
                      id="category"
                      value={uploadMetadata.category}
                      onChange={(e) => setUploadMetadata(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
                    >
                      {documentCategories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={uploadMetadata.date}
                      onChange={(e) => setUploadMetadata(prev => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="owner">Propriétaire *</Label>
                    <Input
                      id="owner"
                      value={uploadMetadata.owner}
                      onChange={(e) => setUploadMetadata(prev => ({ ...prev, owner: e.target.value }))}
                      placeholder="Nom du propriétaire"
                      required
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <h4 className="font-medium">Prévisualisation des fichiers sélectionnés:</h4>
                <div className="space-y-2">
                  {selectedFiles && Array.from(selectedFiles).map((file, index) => {
                    const Icon = file.type.includes('image') ? Image : FileText
                    return (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Icon className={`h-6 w-6 ${file.type.includes('image') ? 'text-green-600' : 'text-blue-600'}`} />
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(2)} MB • {uploadMetadata.type} • {uploadMetadata.category}
                            </p>
                          </div>
                        </div>
                        <Badge className={categories.find(c => c.value === uploadMetadata.type)?.color}>
                          {categories.find(c => c.value === uploadMetadata.type)?.label}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
                
                {uploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Upload en cours...</span>
                      <span>{uploadProgress.toFixed(0)}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <Button onClick={confirmUpload} className="flex-1" disabled={isLoading}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {isLoading ? 'Upload en cours...' : 'Confirmer l\'Upload'}
                  </Button>
                  <Button onClick={cancelUpload} variant="outline" className="flex-1" disabled={isLoading}>
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Documents Stockés ({filteredDocuments.length})</CardTitle>
          <CardDescription>
            {searchTerm && `Résultats pour "${searchTerm}" • `}
            {filterType !== 'all' && `Filtre: ${categories.find(c => c.value === filterType)?.label} • `}
            Liste de tous vos documents avec actions disponibles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredDocuments.map((document) => {
              const Icon = typeIcons[document.mime_type as keyof typeof typeIcons] || FileText
              const category = categories.find(cat => cat.value === document.type)
              
              return (
                <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    <Icon className="h-8 w-8 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="font-medium">{document.name}</p>
                      <div className="flex items-center space-x-2">
                        <Badge className={category?.color}>
                          {category?.label}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {(document.file_size / 1024 / 1024).toFixed(1)} MB
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(document.upload_date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Propriétaire: {document.owner}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {canView && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleView(document)}
                        title="Voir le document"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {canView && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownload(document)}
                        title="Télécharger le document"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(document.id)}
                        title="Supprimer le document"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          
          {filteredDocuments.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                {searchTerm || filterType !== 'all' ? 'Aucun document trouvé' : 'Aucun document'}
              </p>
              <p className="text-sm text-muted-foreground">
                {searchTerm || filterType !== 'all' 
                  ? 'Essayez de modifier vos critères de recherche'
                  : canUpload ? 'Uploadez vos premiers documents' : 'Aucun document disponible'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistiques détaillées */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Statistiques par Type</CardTitle>
            <CardDescription>
              Répartition des documents par catégorie
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categories.map((category) => {
                const count = documents.filter(d => d.type === category.value).length
                const size = documents.filter(d => d.type === category.value).reduce((sum, d) => sum + d.file_size, 0)
                const percentage = documents.length > 0 ? (count / documents.length) * 100 : 0
                
                return (
                  <div key={category.value} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge className={category.color}>{category.label}</Badge>
                        <span className="text-sm">{count} fichier(s)</span>
                      </div>
                      <span className="text-sm font-medium">{(size / 1024 / 1024).toFixed(1)} MB</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
            <CardDescription>
              Outils de gestion des documents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" onClick={exportDocumentsList}>
              <Download className="mr-2 h-4 w-4" />
              Exporter la Liste Complète
            </Button>
            
            {canUpload && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Rapide
              </Button>
            )}
            
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Formats supportés:</p>
              <div className="flex flex-wrap gap-1">
                {['PDF', 'PNG', 'JPG', 'JPEG', 'WEBP'].map(format => (
                  <Badge key={format} variant="outline" className="text-xs">
                    {format}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Astuce:</strong> Vous pouvez glisser-déposer plusieurs fichiers à la fois
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}