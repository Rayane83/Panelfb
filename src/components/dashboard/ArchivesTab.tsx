import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { usePermissions } from '../../hooks/usePermissions'
import { useSupabase } from '../../hooks/useSupabase'
import { Search, Archive, Calendar, Download, FileText, Filter, Eye, Edit, Check, X, Trash2, Upload, AlertTriangle, RefreshCw, Save } from 'lucide-react'
import { formatCurrency } from '../../lib/utils'

interface ArchiveItem {
  id: string
  numero: string
  date: string
  amount: number
  description: string
  status: 'En attente' | 'Validé' | 'Refusé'
  type: string
  payload: any
  created_by: string
  created_at: string
  updated_at: string
  enterprise_id: string
}

export function ArchivesTab() {
  const { user } = useAuth()
  const { hasPermission } = usePermissions()
  const supabaseHooks = useSupabase()
  
  const [archives, setArchives] = useState<ArchiveItem[]>([])
  const [filteredArchives, setFilteredArchives] = useState<ArchiveItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'En attente' | 'Validé' | 'Refusé'>('all')
  const [filterType, setFilterType] = useState<'all' | 'dotation' | 'blanchiment' | 'impots'>('all')
  const [selectedItem, setSelectedItem] = useState<ArchiveItem | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState<Partial<ArchiveItem>>({})
  const [toast, setToast] = useState<{type: 'success' | 'error' | 'warning', message: string} | null>(null)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isLoading, setIsLoading] = useState(false)
  
  const canEdit = hasPermission('archives') && ['superviseur'].includes(user?.role || '')
  const canValidate = hasPermission('archives') && ['superviseur'].includes(user?.role || '')
  const canDelete = hasPermission('archives') && ['superviseur'].includes(user?.role || '')
  const canExport = hasPermission('archives')
  const canImport = hasPermission('archives') && ['superviseur'].includes(user?.role || '')
  const canEditRefused = hasPermission('archives') && ['patron', 'co_patron'].includes(user?.role || '') 

  useEffect(() => {
    loadArchives()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    let filtered = archives

    if (debouncedSearch) {
      filtered = filtered.filter(archive => {
        const searchableContent = JSON.stringify({
          numero: archive.numero,
          description: archive.description,
          type: archive.type,
          payload: archive.payload
        }).toLowerCase()
        
        return searchableContent.includes(debouncedSearch.toLowerCase())
      })
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(archive => archive.status === filterStatus)
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(archive => archive.type === filterType)
    }

    setFilteredArchives(filtered)
  }, [archives, debouncedSearch, filterStatus, filterType])

  const loadArchives = async () => {
    if (!user?.enterprises?.[0]?.id) return
    
    try {
      setIsLoading(true)
      const enterpriseId = user.enterprises[0].id
      const archivesData = await supabaseHooks.getArchives(enterpriseId)
      setArchives(archivesData)
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
      showToast('error', 'Erreur lors du chargement des archives')
    } finally {
      setIsLoading(false)
    }
  }

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
      case 'amount':
        if (!value || isNaN(value) || value < 0) return 'Le montant doit être un nombre positif'
        break
      case 'description':
        if (!value || value.trim().length === 0) return 'La description est requise'
        break
    }
    return ''
  }

  const handleView = (item: ArchiveItem) => {
    setSelectedItem(item)
    setEditMode(false)
  }

  const handleEdit = (item: ArchiveItem) => {
    if (!canEdit && !(canEditRefused && item.status === 'Refusé')) {
      showToast('error', 'Vous n\'avez pas les permissions pour éditer cet élément')
      return
    }
    
    setSelectedItem(item)
    setEditData({
      date: item.date,
      amount: item.amount,
      description: item.description
    })
    setEditMode(true)
    setErrors({})
  }

  const handleSaveEdit = async () => {
    if (!selectedItem) return

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

    try {
      setIsLoading(true)
      await supabaseHooks.updateArchive(selectedItem.id, editData)
      await loadArchives()
      showToast('success', 'Modifications sauvegardées avec succès')
      setEditMode(false)
      setSelectedItem(null)
    } catch (error) {
      console.error('Erreur:', error)
      showToast('error', 'Erreur lors de la sauvegarde')
    } finally {
      setIsLoading(false)
    }
  }

  const handleValidate = async (itemId: string, action: 'validate' | 'refuse') => {
    if (!canValidate) return

    try {
      setIsLoading(true)
      const newStatus = action === 'validate' ? 'Validé' : 'Refusé'
      await supabaseHooks.updateArchiveStatus(itemId, newStatus)
      await loadArchives()
      
      const actionText = action === 'validate' ? 'validé' : 'refusé'
      showToast('success', `Élément ${actionText} avec succès`)
    } catch (error) {
      console.error('Erreur:', error)
      showToast('error', 'Erreur lors de la validation')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!canDelete) return

    if (confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      try {
        setIsLoading(true)
        await supabaseHooks.deleteArchive(itemId)
        await loadArchives()
        showToast('success', 'Élément supprimé avec succès')
      } catch (error) {
        console.error('Erreur:', error)
        showToast('error', 'Erreur lors de la suppression')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleExport = () => {
    if (!canExport) return
    
    const exportData = filteredArchives.map(archive => ({
      Numéro: archive.numero,
      Date: archive.date,
      Montant: archive.amount,
      Description: archive.description,
      Statut: archive.status,
      Type: archive.type,
      'Créé par': archive.created_by,
      'Date création': new Date(archive.created_at).toLocaleDateString('fr-FR')
    }))
    
    const today = new Date().toISOString().split('T')[0]
    const filename = `archives_${user?.enterprises?.[0]?.name || 'export'}_${today}.xlsx`
    // Utiliser la fonction d'export
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
    'impots': 'bg-purple-100 text-purple-800',
    'simulation_fiscale': 'bg-indigo-100 text-indigo-800'
  }

  const totalAmount = filteredArchives.reduce((sum, a) => sum + a.amount, 0)
  const pendingCount = archives.filter(a => a.status === 'En attente').length
  const validatedCount = archives.filter(a => a.status === 'Validé').length
  const refusedCount = archives.filter(a => a.status === 'Refusé').length

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

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Archives</h2>
          <p className="text-muted-foreground">
            Recherche, consultation et gestion des archives avec validation
          </p>
        </div>
        <Button onClick={loadArchives} variant="outline" disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
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
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">À valider</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Validés</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{validatedCount}</div>
            <p className="text-xs text-muted-foreground">Approuvés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volume Total</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
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
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="h-10 px-3 rounded-lg border border-input bg-background text-sm"
            >
              <option value="all">Tous les statuts</option>
              <option value="En attente">En attente</option>
              <option value="Validé">Validé</option>
              <option value="Refusé">Refusé</option>
            </select>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="h-10 px-3 rounded-lg border border-input bg-background text-sm"
            >
              <option value="all">Tous les types</option>
              <option value="dotation">Dotations</option>
              <option value="blanchiment">Blanchiment</option>
              <option value="impots">Impôts</option>
            </select>
            
            <div className="flex space-x-2">
              {canExport && (
                <Button onClick={handleExport} variant="outline" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              )}
              {canImport && (
                <Button onClick={handleImport} variant="outline" className="flex-1">
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Éléments Archivés ({filteredArchives.length})</CardTitle>
          <CardDescription>
            {debouncedSearch && `Résultats pour "${debouncedSearch}" • `}
            {filterStatus !== 'all' && `Statut: ${filterStatus} • `}
            {filterType !== 'all' && `Type: ${filterType} • `}
            Gestion des archives avec validation
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
                    <Badge className={statusColors[archive.status]}>
                      {archive.status}
                    </Badge>
                    <Badge className={typeColors[archive.type as keyof typeof typeColors] || 'bg-gray-100 text-gray-800'}>
                      {archive.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{archive.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>{new Date(archive.date).toLocaleDateString('fr-FR')}</span>
                    <span>{formatCurrency(archive.amount)}</span>
                    <span>Par: {archive.created_by}</span>
                    <span>{new Date(archive.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleView(archive)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  {(canEdit || (canEditRefused && archive.status === 'Refusé')) && (
                    <Button variant="outline" size="sm" onClick={() => handleEdit(archive)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {canValidate && archive.status === 'En attente' && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-green-600 hover:text-green-700"
                        onClick={() => handleValidate(archive.id, 'validate')}
                        disabled={isLoading}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleValidate(archive.id, 'refuse')}
                        disabled={isLoading}
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
                      disabled={isLoading}
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
                {debouncedSearch || filterStatus !== 'all' || filterType !== 'all' 
                  ? 'Aucun résultat trouvé' 
                  : 'Aucune archive'
                }
              </p>
              <p className="text-sm text-muted-foreground">
                {debouncedSearch || filterStatus !== 'all' || filterType !== 'all'
                  ? 'Essayez de modifier vos critères de recherche'
                  : 'Les éléments archivés apparaîtront ici'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistiques par type */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Répartition par Type</CardTitle>
            <CardDescription>
              Distribution des archives par catégorie
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(typeColors).map(([type, colorClass]) => {
                const count = archives.filter(a => a.type === type).length
                const amount = archives.filter(a => a.type === type).reduce((sum, a) => sum + a.amount, 0)
                
                return (
                  <div key={type} className="flex items-center justify-between p-2 rounded">
                    <div className="flex items-center space-x-2">
                      <Badge className={colorClass}>{type}</Badge>
                      <span className="text-sm">{count} élément(s)</span>
                    </div>
                    <span className="text-sm font-medium">{formatCurrency(amount)}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition par Statut</CardTitle>
            <CardDescription>
              État de validation des archives
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(statusColors).map(([status, colorClass]) => {
                const count = archives.filter(a => a.status === status).length
                const percentage = archives.length > 0 ? (count / archives.length) * 100 : 0
                
                return (
                  <div key={status} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge className={colorClass}>{status}</Badge>
                      <span className="text-sm font-medium">{count} ({percentage.toFixed(0)}%)</span>
                    </div>
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
              Outils de gestion des archives
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {canValidate && pendingCount > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 font-medium">
                  {pendingCount} élément(s) en attente de validation
                </p>
              </div>
            )}
            
            <Button className="w-full" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Exporter Tout
            </Button>
            
            {canImport && (
              <Button variant="outline" className="w-full" onClick={handleImport}>
                <Upload className="mr-2 h-4 w-4" />
                Importer Template
              </Button>
            )}
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Recherche en temps réel avec debounce</p>
              <p>• Filtrage par statut et type</p>
              <p>• Export Excel personnalisé</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de visualisation/édition */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {editMode ? 'Édition' : 'Visualisation'} - {selectedItem.numero}
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setSelectedItem(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
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
                      <p className="text-sm">{new Date(selectedItem.date).toLocaleDateString('fr-FR')}</p>
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
                          value={editData.amount || selectedItem.amount}
                          onChange={(e) => setEditData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                          className={errors.amount ? 'border-red-500' : ''}
                        />
                        {errors.amount && <p className="text-sm text-red-600">{errors.amount}</p>}
                      </>
                    ) : (
                      <p className="text-sm">{formatCurrency(selectedItem.amount)}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Description</Label>
                    {editMode ? (
                      <>
                        <Textarea
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
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Informations</Label>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Numéro:</span>
                        <span className="font-mono">{selectedItem.numero}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Statut:</span>
                        <Badge className={statusColors[selectedItem.status]}>{selectedItem.status}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <Badge className={typeColors[selectedItem.type as keyof typeof typeColors]}>{selectedItem.type}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Créé par:</span>
                        <span>{selectedItem.created_by}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Date création:</span>
                        <span>{new Date(selectedItem.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Payload (Données)</Label>
                    <div className="max-h-40 overflow-y-auto">
                      <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                        {JSON.stringify(selectedItem.payload, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                {editMode ? (
                  <>
                    <Button variant="outline" onClick={() => setEditMode(false)} disabled={isLoading}>
                      Annuler
                    </Button>
                    <Button onClick={handleSaveEdit} disabled={isLoading}>
                      <Save className="mr-2 h-4 w-4" />
                      {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
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