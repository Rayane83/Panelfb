import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { useState, useRef } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { usePermissions } from '../../hooks/usePermissions'
import { Upload, FileText, Image, Archive, Eye, Download, Trash2, AlertTriangle, CheckCircle } from 'lucide-react'

interface Document {
  id: string
  name: string
  type: string
  size: string
  uploadDate: Date
  category: 'facture' | 'diplome'
  owner: string
  url?: string
  preview?: string
}

export function DocumentsTab() {
  const { user } = useAuth()
  const { hasPermission } = usePermissions()
  const [documents, setDocuments] = useState<Document[]>([
    { 
      id: '1', 
      name: 'Facture_Janvier_2024.pdf', 
      type: 'PDF', 
      size: '2.1 MB', 
      uploadDate: new Date(), 
      category: 'facture', 
      owner: 'Jean Dupont'
    },
    { 
      id: '2', 
      name: 'Diplome_Comptabilite.pdf', 
      type: 'PDF', 
      size: '1.8 MB', 
      uploadDate: new Date(Date.now() - 86400000), 
      category: 'diplome', 
      owner: 'Marie Martin'
    }
  ])
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [uploadMetadata, setUploadMetadata] = useState({
    type: 'facture' as 'facture' | 'diplome',
    date: new Date().toISOString().split('T')[0],
    owner: user?.username || ''
  })
  const [dragActive, setDragActive] = useState(false)
  const [toast, setToast] = useState<{type: 'success' | 'error' | 'warning', message: string} | null>(null)
  const [previewMode, setPreviewMode] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const canUpload = hasPermission('documents') && ['staff', 'patron', 'co_patron', 'dot'].includes(user?.role || '')
  const canDelete = hasPermission('documents') && ['staff', 'patron', 'co_patron'].includes(user?.role || '')
  const canView = hasPermission('documents')

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

    // Validation des fichiers
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

  const confirmUpload = () => {
    if (!selectedFiles || !canUpload) return

    try {
      const newDocuments = Array.from(selectedFiles).map(file => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type.includes('pdf') ? 'PDF' : 'Image',
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        uploadDate: new Date(),
        category: uploadMetadata.type,
        owner: uploadMetadata.owner,
        url: URL.createObjectURL(file)
      }))

      setDocuments(prev => [...prev, ...newDocuments])
      setSelectedFiles(null)
      setPreviewMode(false)
      showToast('success', `${newDocuments.length} fichier(s) uploadé(s) avec succès`)
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      showToast('error', 'Erreur lors de l\'upload des fichiers')
    }
  }

  const cancelUpload = () => {
    setSelectedFiles(null)
    setPreviewMode(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDelete = (documentId: string) => {
    if (!canDelete) return

    if (confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      setDocuments(prev => prev.filter(doc => doc.id !== documentId))
      showToast('success', 'Document supprimé avec succès')
    }
  }

  const handleView = (document: Document) => {
    if (!canView) return
    
    if (document.url) {
      window.open(document.url, '_blank')
    } else {
      showToast('warning', 'Aperçu non disponible pour ce document')
    }
  }

  const handleDownload = (document: Document) => {
    if (!canView) return
    
    // Simulation du téléchargement
    showToast('success', `Téléchargement de ${document.name} démarré`)
  }

  const categories = [
    { value: 'facture', label: 'Factures', color: 'bg-blue-100 text-blue-800' },
    { value: 'diplome', label: 'Diplômes', color: 'bg-green-100 text-green-800' }
  ]

  const typeIcons = {
    'PDF': FileText,
    'Image': Image,
    'Archive': Archive
  }

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

      <div>
        <h2 className="text-3xl font-bold tracking-tight">Factures / Diplômes</h2>
        <p className="text-muted-foreground">
          Gestion des documents avec upload sécurisé et prévisualisation
        </p>
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
            <div className="text-2xl font-bold text-blue-600">
              {documents.filter(d => d.category === 'facture').length}
            </div>
            <p className="text-xs text-muted-foreground">Documents factures</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diplômes</CardTitle>
            <Image className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {documents.filter(d => d.category === 'diplome').length}
            </div>
            <p className="text-xs text-muted-foreground">Documents diplômes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Espace Utilisé</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.9 MB</div>
            <p className="text-xs text-muted-foreground">Sur 100 MB</p>
          </CardContent>
        </Card>
      </div>

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
                
                <div className="grid gap-4 md:grid-cols-3 mt-4">
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
                  {selectedFiles && Array.from(selectedFiles).map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {file.type.includes('image') ? (
                          <Image className="h-6 w-6 text-green-600" />
                        ) : (
                          <FileText className="h-6 w-6 text-blue-600" />
                        )}
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB • {uploadMetadata.type}
                          </p>
                        </div>
                      </div>
                      <Badge className={categories.find(c => c.value === uploadMetadata.type)?.color}>
                        {categories.find(c => c.value === uploadMetadata.type)?.label}
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <Button onClick={confirmUpload} className="flex-1">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Confirmer l'Upload
                  </Button>
                  <Button onClick={cancelUpload} variant="outline" className="flex-1">
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
          <CardTitle>Documents Stockés</CardTitle>
          <CardDescription>
            Liste de tous vos documents avec actions disponibles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.map((document) => {
              const Icon = typeIcons[document.type as keyof typeof typeIcons] || FileText
              const category = categories.find(cat => cat.value === document.category)
              
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
                        <span className="text-sm text-muted-foreground">{document.size}</span>
                        <span className="text-sm text-muted-foreground">
                          {document.uploadDate.toLocaleDateString('fr-FR')}
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
          
          {documents.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">Aucun document</p>
              <p className="text-sm text-muted-foreground">
                {canUpload ? 'Uploadez vos premiers documents' : 'Aucun document disponible'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}