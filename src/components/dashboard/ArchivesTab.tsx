import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Label } from '../ui/label'
import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { usePermissions } from '../../hooks/usePermissions'
import { Search, Archive, Calendar, Download, FileText, Filter, Eye, Edit, Check, X, Trash2, Upload, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '../../lib/utils'

interface ArchiveItem {
  id: string
  numero: string
  date: string
  montant: number
  description: string
  statut: 'En attente' | 'Validé' | 'Refusé'
  type: string
  entreprise: string
  guild: string
  payload: any
  createdAt: Date
}

export function ArchivesTab() {
  const { user } = useAuth()
  const { hasPermission } = usePermissions()
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState<ArchiveItem | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState<Partial<ArchiveItem>>({})
  const [toast, setToast] = useState<{type: 'success' | 'error' | 'warning', message: string} | null>(null)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  
  const [archives] = useState<ArchiveItem[]>([
    {
      id: '1',
      numero: 'DOT-2024-001',
      date: '2024-01-15',
      montant: 25000,
      description: 'Rapport dotation Q1 2024',
      statut: 'Validé',
      type: 'dotation',
      entreprise: 'Tech Corp',
      guild: 'main',
      payload: { employees: 5, totalCA: 125000 },
      createdAt: new Date('2024-01-15')
    },
    {
      id: '2',
      numero: 'BLA-2024-002',
      date: '2024-01-20',
      montant: 45000,
      description: 'Opération blanchiment janvier',
      statut: 'En attente',
      type: 'blanchiment',
      entreprise: 'Service Plus',
      guild: 'main',
      payload: { operations: 3, duration: 8 },
      createdAt: new Date('2024-01-20')
    },
    {
      id: '3',
      numero: 'IMP-2024-003',
      date: '2024-01-18',
      montant: 8750,
      description: 'Déclaration fiscale Q1',
      statut: 'Refusé',
      type: 'impots',
      entreprise: 'Digital Agency',
      guild: 'dot',
      payload: { taxRate: 25, income: 35000 },
      createdAt: new Date('2024-01-18')
    }
  ])

  const canEdit = hasPermission('archives') && ['staff'].includes(user?.role || '')
  const canValidate = hasPermission('archives') && ['staff'].includes(user?.role || '')
  const canDelete = hasPermission('archives') && ['staff'].includes(user?.role || '')
  const canExport = hasPermission('archives')
  const canImport = hasPermission('archives') && ['staff'].includes(user?.role || '')
  const canEditRefused = hasPermission('archives') && ['patron', 'co_patron'].includes(user?.role || '') 

  // Debounce search avec 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const showToast = (type: 'success' | 'error' | 'warning', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  const validateField = (field: string, value: any): string => {
    switch (field) {
      case 'date':
        if (!value) return 'La date est requise'
        if (isNaN(new Date(value).getTime())) return 'Date invalide'
        break
      case 'montant':
        if (!value || isNaN(value) || value < 0) return 'Le montant doit être un nombre positif'
        break
      case 'description':
        if (!value || value.trim().length === 0) return 'La description est requise'
        break
    }
    return ''
  }

  // Filtrage avec stringification du payload
  const filteredArchives = archives.filter(archive => {
    if (!debouncedSearch) return true
    
    const searchableContent = JSON.stringify({
      numero: archive.numero,
      description: archive.description,
      entreprise: archive.entreprise,
      type: archive.type,
      payload: archive.payload
    }).toLowerCase()
    
    return searchableContent.includes(debouncedSearch.toLowerCase())
  })

  const handleView = (item: ArchiveItem) => {
    setSelectedItem(item)
    setEditMode(false)
  }

  const handleEdit = (item: ArchiveItem) => {
    if (!canEdit && !(canEditRefused && item.statut.includes('Refusé'))) {
      showToast('error', 'Vous n\'avez pas les permissions pour éditer cet élément')
      return
    }
    
    setSelectedItem(item)
    setEditData({
      date: item.date,
      montant: item.montant,
      description: item.description
    })
    setEditMode(true)
    setErrors({})
  }

  const handleSaveEdit = () => {
    if (!selectedItem) return

    // Validation
    const newErrors: {[key: string]: string} = {}
    Object.keys(editData).forEach(field => {
      const error = validateField(field, (editData as any)[field])
      if (error) newErrors[field] = error
    })

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      showToast('error', 'Veuillez corriger les erreurs avant de sauvegarder')
      return
    }

    // Simulation de la sauvegarde
    showToast('success', 'Modifications sauvegardées avec succès')
    setEditMode(false)
    setSelectedItem(null)
  }

  const handleValidate = (itemId: string, action: 'validate' | 'refuse') => {
    if (!canValidate) return

    const actionText = action === 'validate' ? 'validé' : 'refusé'
    showToast('success', `Élément ${actionText} avec succès`)
  }

  const handleDelete = (itemId: string) => {
    if (!canDelete) return

    if (confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      showToast('success', 'Élément supprimé avec succès')
    }
  }

  const handleExport = () => {
    if (!canExport) return
    
    const today = new Date().toISOString().split('T')[0]
    const filename = `archives_${user?.currentGuild?.name || 'toutes'}_${user?.currentGuild?.id || 'all'}_${today}.xlsx`
    showToast('success', `Export Excel généré: ${filename}`)
  }

  const handleImport = () => {
    if (!canImport) return
    showToast('success', 'Template Excel importé avec succès')
  }

  const statusColors = {
    'En attente': 'bg-yellow-100 text-yellow-800',
    'Validé': 'bg-green-100 text-green-800',
    'Refusé': 'bg-red-100 text-red-800'
  }

  const typeColors = {
    'dotation': 'bg-blue-100 text-blue-800',
    'blanchiment': 'bg-orange-100 text-orange-800',
    'impots': 'bg-purple-100 text-purple-800'
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
            <AlertTriangle className="h-4 w-4" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-3xl font-bold tracking-tight">Archives</h2>
        <p className="text-muted-foreground">
          Recherche, consultation et gestion des archives avec validation
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Archives</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{archives.length}</div>
            <p className="text-xs text-muted-foreground">Éléments archivés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {archives.filter(a => a.statut === 'En attente').length}
            </div>
            <p className="text-xs text-muted-foreground">À valider</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Validés</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {archives.filter(a => a.statut === 'Validé').length}
            </div>
            <p className="text-xs text-muted-foreground">Approuvés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volume Total</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(archives.reduce((sum, a) => sum + a.montant, 0))}
            </div>
            <p className="text-xs text-muted-foreground">Montant total</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recherche et Filtres</CardTitle>
          <CardDescription>
            Recherche avec debounce 300ms sur l'ensemble des données (payload inclus)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par numéro, description, entreprise, payload..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {canExport && (
              <Button onClick={handleExport} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Excel
              </Button>
            )}
            {canImport && (
              <Button onClick={handleImport} variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Import Template
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Éléments Archivés</CardTitle>
          <CardDescription>
            {filteredArchives.length} élément(s) trouvé(s)
            {debouncedSearch && ` pour "${debouncedSearch}"`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredArchives.map((archive) => (
              <div key={archive.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{archive.numero}</p>
                    <Badge className={statusColors[archive.statut]}>
                      {archive.statut}
                    </Badge>
                    <Badge className={typeColors[archive.type as keyof typeof typeColors]}>
                      {archive.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{archive.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>{archive.date}</span>
                    <span>{formatCurrency(archive.montant)}</span>
                    <span>{archive.entreprise}</span>
                    <span>Guild: {archive.guild}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleView(archive)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  {(canEdit || (canEditRefused && archive.statut.includes('Refusé'))) && (
                    <Button variant="outline" size="sm" onClick={() => handleEdit(archive)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {canValidate && archive.statut === 'En attente' && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-green-600 hover:text-green-700"
                        onClick={() => handleValidate(archive.id, 'validate')}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleValidate(archive.id, 'refuse')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  {canDelete && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(archive.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {filteredArchives.length === 0 && (
            <div className="text-center py-8">
              <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                {debouncedSearch ? 'Aucun résultat trouvé' : 'Aucune archive'}
              </p>
              <p className="text-sm text-muted-foreground">
                {debouncedSearch ? 'Essayez de modifier vos critères de recherche' : 'Les éléments archivés apparaîtront ici'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de visualisation/édition */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {editMode ? 'Édition' : 'Visualisation'} - {selectedItem.numero}
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setSelectedItem(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    {editMode ? (
                      <>
                        <Input
                          type="date"
                          value={editData.date || selectedItem.date}
                          onChange={(e) => setEditData(prev => ({ ...prev, date: e.target.value }))}
                          className={errors.date ? 'border-red-500' : ''}
                        />
                        {errors.date && <p className="text-sm text-red-600">{errors.date}</p>}
                      </>
                    ) : (
                      <p className="text-sm">{selectedItem.date}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Montant</Label>
                    {editMode ? (
                      <>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editData.montant || selectedItem.montant}
                          onChange={(e) => setEditData(prev => ({ ...prev, montant: parseFloat(e.target.value) || 0 }))}
                          className={errors.montant ? 'border-red-500' : ''}
                        />
                        {errors.montant && <p className="text-sm text-red-600">{errors.montant}</p>}
                      </>
                    ) : (
                      <p className="text-sm">{formatCurrency(selectedItem.montant)}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Description</Label>
                  {editMode ? (
                    <>
                      <Input
                        value={editData.description || selectedItem.description}
                        onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                        className={errors.description ? 'border-red-500' : ''}
                      />
                      {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                    </>
                  ) : (
                    <p className="text-sm">{selectedItem.description}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Payload (Données)</Label>
                  <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                    {JSON.stringify(selectedItem.payload, null, 2)}
                  </pre>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>Statut: <Badge className={statusColors[selectedItem.statut]}>{selectedItem.statut}</Badge></span>
                  <span>Type: <Badge className={typeColors[selectedItem.type as keyof typeof typeColors]}>{selectedItem.type}</Badge></span>
                  <span>Entreprise: {selectedItem.entreprise}</span>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                {editMode ? (
                  <>
                    <Button variant="outline" onClick={() => setEditMode(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleSaveEdit}>
                      Sauvegarder
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={() => setSelectedItem(null)}>
                    Fermer
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}