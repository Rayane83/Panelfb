import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { usePermissions } from '../../hooks/usePermissions'
import { AlertTriangle, Shuffle, TrendingUp, Clock, Save, Download, Plus, Trash2 } from 'lucide-react'
import { formatCurrency } from '../../lib/utils'

interface BlanchimentConfig {
  enabled: boolean
  useGlobal: boolean
  percEntreprise: number
  percGroupe: number
}

interface BlanchimentLine {
  id: string
  statut: 'En cours' | 'Terminé' | 'Annulé'
  dateRecu: string
  dateRendu: string
  duree: number
  groupe: string
  employe: string
  donneur: string
  recep: string
  somme: number
  percEntreprise: number
  percGroupe: number
  isTemporary?: boolean
  markedForDeletion?: boolean
}

export function BlanchimentTab() {
  const { user } = useAuth()
  const { hasPermission } = usePermissions()
  const [config, setConfig] = useState<BlanchimentConfig>({
    enabled: true,
    useGlobal: false,
    percEntreprise: 15,
    percGroupe: 10
  })
  const [lines, setLines] = useState<BlanchimentLine[]>([
    {
      id: '1',
      statut: 'En cours',
      dateRecu: '2024-01-15',
      dateRendu: '2024-01-20',
      duree: 5,
      groupe: 'Groupe A',
      employe: 'Jean Dupont',
      donneur: 'Client X',
      recep: 'Destinataire Y',
      somme: 25000,
      percEntreprise: 15,
      percGroupe: 10
    },
    {
      id: '2',
      statut: 'Terminé',
      dateRecu: '2024-01-10',
      dateRendu: '2024-01-18',
      duree: 8,
      groupe: 'Groupe B',
      employe: 'Marie Martin',
      donneur: 'Client Z',
      recep: 'Destinataire W',
      somme: 45000,
      percEntreprise: 15,
      percGroupe: 10
    }
  ])
  const [toast, setToast] = useState<{type: 'success' | 'error' | 'warning', message: string} | null>(null)
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const canEdit = hasPermission('blanchiment') && ['patron', 'co_patron'].includes(user?.role || '')
  const canExport = hasPermission('blanchiment') && ['patron', 'co_patron', 'staff'].includes(user?.role || '')
  const canView = hasPermission('blanchiment')

  const showToast = (type: 'success' | 'error' | 'warning', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  const validateDate = (date: string): boolean => {
    if (!date) return false
    const dateObj = new Date(date)
    return !isNaN(dateObj.getTime())
  }

  const validatePercentage = (value: number): boolean => {
    return value >= 0 && value <= 100
  }

  const calculateDuration = (dateRecu: string, dateRendu: string): number => {
    if (!validateDate(dateRecu) || !validateDate(dateRendu)) return 0
    const recu = new Date(dateRecu)
    const rendu = new Date(dateRendu)
    const diffTime = rendu.getTime() - recu.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  const handleConfigChange = (field: keyof BlanchimentConfig, value: any) => {
    if (!canEdit) return

    const newConfig = { ...config, [field]: value }
    
    // Validation des pourcentages
    if ((field === 'percEntreprise' || field === 'percGroupe') && !validatePercentage(value)) {
      setErrors(prev => ({ ...prev, [field]: 'Le pourcentage doit être entre 0 et 100' }))
      return
    } else {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }

    setConfig(newConfig)
  }

  const handleLineChange = (lineId: string, field: keyof BlanchimentLine, value: any) => {
    if (!canEdit) return

    setLines(prev => prev.map(line => {
      if (line.id === lineId) {
        const updatedLine = { ...line, [field]: value }
        
        // Recalculer la durée si les dates changent
        if (field === 'dateRecu' || field === 'dateRendu') {
          updatedLine.duree = calculateDuration(updatedLine.dateRecu, updatedLine.dateRendu)
          
          // Validation des dates
          if (field === 'dateRendu' && updatedLine.dateRecu && updatedLine.dateRendu) {
            const recu = new Date(updatedLine.dateRecu)
            const rendu = new Date(updatedLine.dateRendu)
            if (rendu < recu) {
              setErrors(prev => ({ ...prev, [`${lineId}_dateRendu`]: 'La date de rendu doit être >= à la date de réception' }))
            } else {
              setErrors(prev => ({ ...prev, [`${lineId}_dateRendu`]: '' }))
            }
          }
        }
        
        // Validation des montants
        if (field === 'somme' && (isNaN(value) || value < 0)) {
          setErrors(prev => ({ ...prev, [`${lineId}_somme`]: 'Le montant doit être un nombre positif' }))
        } else if (field === 'somme') {
          setErrors(prev => ({ ...prev, [`${lineId}_somme`]: '' }))
        }
        
        // Mettre à jour les pourcentages selon la config
        if (!config.useGlobal) {
          updatedLine.percEntreprise = config.percEntreprise
          updatedLine.percGroupe = config.percGroupe
        }
        
        return updatedLine
      }
      return line
    }))
  }

  const addNewLine = () => {
    if (!canEdit) return

    const newLine: BlanchimentLine = {
      id: `temp_${Date.now()}`,
      statut: 'En cours',
      dateRecu: new Date().toISOString().split('T')[0],
      dateRendu: '',
      duree: 0,
      groupe: '',
      employe: '',
      donneur: '',
      recep: '',
      somme: 0,
      percEntreprise: config.useGlobal ? 0 : config.percEntreprise,
      percGroupe: config.useGlobal ? 0 : config.percGroupe,
      isTemporary: true
    }

    setLines(prev => [newLine, ...prev])
  }

  const deleteLine = (lineId: string) => {
    if (!canEdit) return

    const line = lines.find(l => l.id === lineId)
    if (!line) return

    if (line.isTemporary) {
      // Suppression immédiate pour les lignes temporaires
      setLines(prev => prev.filter(l => l.id !== lineId))
    } else {
      // Marquer pour suppression pour les lignes persistées
      setLines(prev => prev.map(l => 
        l.id === lineId ? { ...l, markedForDeletion: true } : l
      ))
    }
  }

  const handleSave = () => {
    if (!canEdit) return

    // Validation globale
    const hasErrors = Object.values(errors).some(error => error !== '')
    if (hasErrors) {
      showToast('error', 'Veuillez corriger les erreurs avant de sauvegarder')
      return
    }

    // Sauvegarder via Supabase
    const enterpriseId = user?.enterprises?.[0]?.id || user?.currentGuild?.id
    if (enterpriseId) {
      supabaseHooks.saveBlanchimentOperations(enterpriseId, lines)
        .then(() => {
          const linesToSave = lines.filter(l => !l.markedForDeletion)
          const linesToDelete = lines.filter(l => l.markedForDeletion)
          
          // Supprimer les lignes marquées pour suppression
          setLines(linesToSave.map(line => ({ ...line, isTemporary: false })))
          
          showToast('success', `Configuration sauvegardée. ${linesToSave.length} ligne(s) mise(s) à jour, ${linesToDelete.length} ligne(s) supprimée(s)`)
        })
        .catch((error) => {
          console.error('Erreur lors de la sauvegarde:', error)
          showToast('error', 'Erreur lors de la sauvegarde')
        })
    } else {
      showToast('error', 'Aucune entreprise sélectionnée')
    }
  }

  const handleExport = (format: 'pdf' | 'excel') => {
    if (!canExport) return
    showToast('success', `Export ${format.toUpperCase()} généré avec succès`)
  }

  const globalPercentages = { percEntreprise: 20, percGroupe: 15 } // Simulation des pourcentages globaux
  const effectivePercentages = config.useGlobal ? globalPercentages : config

  const totalSomme = lines.filter(l => !l.markedForDeletion).reduce((sum, line) => sum + line.somme, 0)
  const averageDuration = lines.filter(l => !l.markedForDeletion && l.duree > 0).reduce((sum, line, _, arr) => sum + line.duree / arr.length, 0)

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

      <div className="flex items-center space-x-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestion du Blanchiment</h2>
          <p className="text-muted-foreground">
            Configuration et suivi des opérations de blanchiment
          </p>
        </div>
        <Badge className="bg-orange-100 text-orange-800">
          {config.enabled ? 'Activé' : 'Désactivé'}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volume Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSomme)}</div>
            <p className="text-xs text-muted-foreground">Montant total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opérations</CardTitle>
            <Shuffle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lines.filter(l => !l.markedForDeletion).length}</div>
            <p className="text-xs text-muted-foreground">En cours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">% Entreprise</CardTitle>
            <AlertTriangle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{effectivePercentages.percEntreprise}%</div>
            <p className="text-xs text-muted-foreground">
              {config.useGlobal ? 'Global' : 'Local'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Durée Moyenne</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(averageDuration || 0)}j</div>
            <p className="text-xs text-muted-foreground">Traitement</p>
          </CardContent>
        </Card>
      </div>

      {canEdit && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Configuration du Blanchiment</CardTitle>
            <CardDescription className="text-yellow-700">
              Paramètres globaux et pourcentages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enabled">Système activé</Label>
                  <Switch
                    id="enabled"
                    checked={config.enabled}
                    onCheckedChange={(checked) => handleConfigChange('enabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="useGlobal">Utiliser les paramètres globaux</Label>
                  <Switch
                    id="useGlobal"
                    checked={config.useGlobal}
                    onCheckedChange={(checked) => handleConfigChange('useGlobal', checked)}
                  />
                </div>
              </div>
              
              {!config.useGlobal && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="percEntreprise">% Entreprise (0-100)</Label>
                    <Input
                      id="percEntreprise"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={config.percEntreprise}
                      onChange={(e) => handleConfigChange('percEntreprise', parseFloat(e.target.value) || 0)}
                      className={errors.percEntreprise ? 'border-red-500' : ''}
                    />
                    {errors.percEntreprise && (
                      <p className="text-sm text-red-600">{errors.percEntreprise}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="percGroupe">% Groupe (0-100)</Label>
                    <Input
                      id="percGroupe"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={config.percGroupe}
                      onChange={(e) => handleConfigChange('percGroupe', parseFloat(e.target.value) || 0)}
                      className={errors.percGroupe ? 'border-red-500' : ''}
                    />
                    {errors.percGroupe && (
                      <p className="text-sm text-red-600">{errors.percGroupe}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">Pourcentages effectifs:</p>
              <p className="text-sm text-blue-700">
                Entreprise: {effectivePercentages.percEntreprise}% • Groupe: {effectivePercentages.percGroupe}%
                {config.useGlobal && <span className="ml-2 text-xs">(Paramètres globaux)</span>}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Opérations de Blanchiment</CardTitle>
          <CardDescription>
            Grille éditable triée par date de création (plus récent en premier)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {canEdit && (
            <div className="mb-4">
              <Button onClick={addNewLine}>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle Opération
              </Button>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Statut</th>
                  <th className="text-left p-2 font-medium">Date Reçu</th>
                  <th className="text-left p-2 font-medium">Date Rendu</th>
                  <th className="text-left p-2 font-medium">Durée (j)</th>
                  <th className="text-left p-2 font-medium">Groupe</th>
                  <th className="text-left p-2 font-medium">Employé</th>
                  <th className="text-left p-2 font-medium">Donneur</th>
                  <th className="text-left p-2 font-medium">Recep</th>
                  <th className="text-left p-2 font-medium">Somme</th>
                  <th className="text-left p-2 font-medium">% Ent.</th>
                  <th className="text-left p-2 font-medium">% Grp.</th>
                  {canEdit && <th className="text-left p-2 font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {lines
                  .filter(line => !line.markedForDeletion)
                  .sort((a, b) => new Date(b.dateRecu).getTime() - new Date(a.dateRecu).getTime())
                  .map((line) => (
                  <tr key={line.id} className={`border-b hover:bg-muted/50 ${line.isTemporary ? 'bg-blue-50' : ''}`}>
                    <td className="p-2">
                      <select
                        value={line.statut}
                        onChange={(e) => handleLineChange(line.id, 'statut', e.target.value)}
                        disabled={!canEdit}
                        className="w-full h-8 px-2 rounded border border-input bg-background text-sm"
                      >
                        <option value="En cours">En cours</option>
                        <option value="Terminé">Terminé</option>
                        <option value="Annulé">Annulé</option>
                      </select>
                    </td>
                    <td className="p-2">
                      <Input
                        type="date"
                        value={line.dateRecu}
                        onChange={(e) => handleLineChange(line.id, 'dateRecu', e.target.value)}
                        disabled={!canEdit}
                        className="h-8 text-sm"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="date"
                        value={line.dateRendu}
                        onChange={(e) => handleLineChange(line.id, 'dateRendu', e.target.value)}
                        disabled={!canEdit}
                        className={`h-8 text-sm ${errors[`${line.id}_dateRendu`] ? 'border-red-500' : ''}`}
                      />
                      {errors[`${line.id}_dateRendu`] && (
                        <p className="text-xs text-red-600 mt-1">{errors[`${line.id}_dateRendu`]}</p>
                      )}
                    </td>
                    <td className="p-2">
                      <Input
                        value={line.duree}
                        disabled
                        className="h-8 text-sm bg-muted"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        value={line.groupe}
                        onChange={(e) => handleLineChange(line.id, 'groupe', e.target.value)}
                        disabled={!canEdit}
                        className="h-8 text-sm"
                        placeholder="Groupe"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        value={line.employe}
                        onChange={(e) => handleLineChange(line.id, 'employe', e.target.value)}
                        disabled={!canEdit}
                        className="h-8 text-sm"
                        placeholder="Employé"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        value={line.donneur}
                        onChange={(e) => handleLineChange(line.id, 'donneur', e.target.value)}
                        disabled={!canEdit}
                        className="h-8 text-sm"
                        placeholder="Donneur"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        value={line.recep}
                        onChange={(e) => handleLineChange(line.id, 'recep', e.target.value)}
                        disabled={!canEdit}
                        className="h-8 text-sm"
                        placeholder="Recep"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.somme}
                        onChange={(e) => handleLineChange(line.id, 'somme', parseFloat(e.target.value) || 0)}
                        disabled={!canEdit}
                        className={`h-8 text-sm ${errors[`${line.id}_somme`] ? 'border-red-500' : ''}`}
                        placeholder="0"
                      />
                      {errors[`${line.id}_somme`] && (
                        <p className="text-xs text-red-600 mt-1">{errors[`${line.id}_somme`]}</p>
                      )}
                    </td>
                    <td className="p-2">
                      <Input
                        value={`${line.percEntreprise}%`}
                        disabled
                        className="h-8 text-sm bg-muted"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        value={`${line.percGroupe}%`}
                        disabled
                        className="h-8 text-sm bg-muted"
                      />
                    </td>
                    {canEdit && (
                      <td className="p-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteLine(line.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {lines.filter(l => !l.markedForDeletion).length === 0 && (
            <div className="text-center py-8">
              <Shuffle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">Aucune opération</p>
              <p className="text-sm text-muted-foreground">
                {canEdit ? 'Ajoutez votre première opération de blanchiment' : 'Aucune opération disponible'}
              </p>
            </div>
          )}
          
          <div className="flex space-x-2 mt-4">
            {canEdit && (
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Sauvegarder
              </Button>
            )}
            {canExport && (
              <>
                <Button onClick={() => handleExport('pdf')} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
                <Button onClick={() => handleExport('excel')} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export Excel
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}