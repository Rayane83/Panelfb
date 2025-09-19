import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { Textarea } from '../ui/textarea'
import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { usePermissions } from '../../hooks/usePermissions'
import { useSupabase } from '../../hooks/useSupabase'
import { AlertTriangle, Shuffle, TrendingUp, Clock, Save, Download, Plus, Trash2, Upload, RefreshCw, Archive, Eye } from 'lucide-react'
import { formatCurrency } from '../../lib/utils'
import { parseBlanchimentData, exportToExcel } from '../../utils/csvParser'

interface BlanchimentConfig {
  enabled: boolean
  useGlobal: boolean
  percEntreprise: number
  percGroupe: number
  threshold: number
  maxAmount: number
  cooldownHours: number
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
  const supabaseHooks = useSupabase()
  
  const [config, setConfig] = useState<BlanchimentConfig>({
    enabled: true,
    useGlobal: false,
    percEntreprise: 15,
    percGroupe: 10,
    threshold: 1000,
    maxAmount: 100000,
    cooldownHours: 24
  })
  const [lines, setLines] = useState<BlanchimentLine[]>([])
  const [pasteData, setPasteData] = useState('')
  const [toast, setToast] = useState<{type: 'success' | 'error' | 'warning', message: string} | null>(null)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isLoading, setIsLoading] = useState(false)
  const [selectedOperation, setSelectedOperation] = useState<BlanchimentLine | null>(null)

  const canEdit = hasPermission('blanchiment') && ['patron', 'co_patron'].includes(user?.role || '')
  const canExport = hasPermission('blanchiment') && ['patron', 'co_patron', 'superviseur'].includes(user?.role || '')
  const canView = hasPermission('blanchiment')
  const canManageConfig = hasPermission('blanchiment') && ['patron'].includes(user?.role || '')

  useEffect(() => {
    loadBlanchimentData()
  }, [])

  const loadBlanchimentData = async () => {
    if (!user?.enterprises?.[0]?.id) return
    
    try {
      setIsLoading(true)
      const enterpriseId = user.enterprises[0].id
      
      // Charger les opérations
      const operations = await supabaseHooks.getBlanchimentOperations(enterpriseId)
      const formattedLines = operations.map((op: any) => ({
        id: op.id,
        statut: op.status,
        dateRecu: op.date_received,
        dateRendu: op.date_returned || '',
        duree: op.duration_days || 0,
        groupe: op.groupe || '',
        employe: op.employee || '',
        donneur: op.donneur || '',
        recep: op.recep || '',
        somme: op.amount,
        percEntreprise: op.perc_entreprise,
        percGroupe: op.perc_groupe
      }))
      setLines(formattedLines)
      
      // Charger la configuration depuis les settings de l'entreprise
      const enterprise = await supabaseHooks.getEnterprise(enterpriseId)
      if (enterprise?.settings?.blanchiment) {
        setConfig(enterprise.settings.blanchiment)
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
      showToast('error', 'Erreur lors du chargement des données')
    } finally {
      setIsLoading(false)
    }
  }

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
    if (!canManageConfig) return

    const newConfig = { ...config, [field]: value }
    
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
        
        if (field === 'dateRecu' || field === 'dateRendu') {
          updatedLine.duree = calculateDuration(updatedLine.dateRecu, updatedLine.dateRendu)
          
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
        
        if (field === 'somme' && (isNaN(value) || value < 0)) {
          setErrors(prev => ({ ...prev, [`${lineId}_somme`]: 'Le montant doit être un nombre positif' }))
        } else if (field === 'somme') {
          setErrors(prev => ({ ...prev, [`${lineId}_somme`]: '' }))
        }
        
        if (!config.useGlobal) {
          updatedLine.percEntreprise = config.percEntreprise
          updatedLine.percGroupe = config.percGroupe
        }
        
        return updatedLine
      }
      return line
    }))
  }

  const handlePasteData = () => {
    if (!canEdit || !pasteData.trim()) return

    try {
      const parsedData = parseBlanchimentData(pasteData)
      setLines(prev => [...parsedData, ...prev])
      setPasteData('')
      showToast('success', `${parsedData.length} opération(s) importée(s)`)
    } catch (error) {
      showToast('error', 'Erreur lors de l\'importation des données')
    }
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
      setLines(prev => prev.filter(l => l.id !== lineId))
    } else {
      setLines(prev => prev.map(l => 
        l.id === lineId ? { ...l, markedForDeletion: true } : l
      ))
    }
  }

  const handleSave = async () => {
    if (!canEdit || !user?.enterprises?.[0]?.id) return

    const hasErrors = Object.values(errors).some(error => error !== '')
    if (hasErrors) {
      showToast('error', 'Veuillez corriger les erreurs avant de sauvegarder')
      return
    }

    try {
      setIsLoading(true)
      const enterpriseId = user.enterprises[0].id
      
      // Sauvegarder les opérations
      await supabaseHooks.saveBlanchimentOperations(enterpriseId, lines)
      
      // Sauvegarder la configuration
      await supabaseHooks.updateEnterpriseSettings(enterpriseId, { blanchiment: config })
      
      const linesToSave = lines.filter(l => !l.markedForDeletion)
      const linesToDelete = lines.filter(l => l.markedForDeletion)
      
      setLines(linesToSave.map(line => ({ ...line, isTemporary: false })))
      
      showToast('success', `Configuration sauvegardée. ${linesToSave.length} ligne(s) mise(s) à jour, ${linesToDelete.length} ligne(s) supprimée(s)`)
    } catch (error) {
      console.error('Erreur:', error)
      showToast('error', 'Erreur lors de la sauvegarde')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = (format: 'pdf' | 'excel') => {
    if (!canExport) return
    
    if (format === 'excel') {
      const exportData = lines.filter(l => !l.markedForDeletion).map(line => ({
        Statut: line.statut,
        'Date Reçu': line.dateRecu,
        'Date Rendu': line.dateRendu,
        'Durée (jours)': line.duree,
        Groupe: line.groupe,
        Employé: line.employe,
        Donneur: line.donneur,
        Receveur: line.recep,
        Somme: line.somme,
        '% Entreprise': line.percEntreprise,
        '% Groupe': line.percGroupe
      }))
      
      const filename = `blanchiment_${user?.enterprises?.[0]?.name || 'export'}_${new Date().toISOString().split('T')[0]}.xlsx`
      exportToExcel(exportData, filename)
    }
    
    showToast('success', `Export ${format.toUpperCase()} généré avec succès`)
  }

  const archiveOperations = async () => {
    if (!canEdit || !user?.enterprises?.[0]?.id) return

    try {
      setIsLoading(true)
      
      const reportData = {
        type: 'blanchiment',
        description: `Rapport blanchiment ${new Date().toLocaleDateString('fr-FR')}`,
        totalAmount: totalSomme,
        operations: lines.filter(l => !l.markedForDeletion).length,
        lines: lines.filter(l => !l.markedForDeletion),
        config
      }
      
      await supabaseHooks.archiveReport(user.enterprises[0].id, reportData)
      showToast('success', 'Opérations archivées avec succès')
    } catch (error) {
      console.error('Erreur:', error)
      showToast('error', 'Erreur lors de l\'archivage')
    } finally {
      setIsLoading(false)
    }
  }

  const globalPercentages = { percEntreprise: 20, percGroupe: 15 }
  const effectivePercentages = config.useGlobal ? globalPercentages : config

  const totalSomme = lines.filter(l => !l.markedForDeletion).reduce((sum, line) => sum + line.somme, 0)
  const averageDuration = lines.filter(l => !l.markedForDeletion && l.duree > 0).reduce((sum, line, _, arr) => sum + line.duree / arr.length, 0)
  const operationsEnCours = lines.filter(l => !l.markedForDeletion && l.statut === 'En cours').length
  const operationsTerminees = lines.filter(l => !l.markedForDeletion && l.statut === 'Terminé').length

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
        <div className="flex items-center space-x-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Gestion du Blanchiment</h2>
            <p className="text-muted-foreground">
              Configuration et suivi des opérations de blanchiment
            </p>
          </div>
          <Badge className={config.enabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
            {config.enabled ? 'Activé' : 'Désactivé'}
          </Badge>
        </div>
        <Button onClick={loadBlanchimentData} variant="outline" disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
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
            <CardTitle className="text-sm font-medium">En Cours</CardTitle>
            <Shuffle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{operationsEnCours}</div>
            <p className="text-xs text-muted-foreground">Opérations actives</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terminées</CardTitle>
            <Shuffle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{operationsTerminees}</div>
            <p className="text-xs text-muted-foreground">Complétées</p>
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

      {canManageConfig && (
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

                <div className="space-y-2">
                  <Label htmlFor="threshold">Seuil minimum (€)</Label>
                  <Input
                    id="threshold"
                    type="number"
                    min="0"
                    value={config.threshold}
                    onChange={(e) => handleConfigChange('threshold', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="maxAmount">Montant maximum (€)</Label>
                  <Input
                    id="maxAmount"
                    type="number"
                    min="0"
                    value={config.maxAmount}
                    onChange={(e) => handleConfigChange('maxAmount', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cooldown">Délai de carence (heures)</Label>
                  <Input
                    id="cooldown"
                    type="number"
                    min="0"
                    value={config.cooldownHours}
                    onChange={(e) => handleConfigChange('cooldownHours', parseFloat(e.target.value) || 0)}
                  />
                </div>

                {!config.useGlobal && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="percEntreprise">% Entreprise</Label>
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
                      <Label htmlFor="percGroupe">% Groupe</Label>
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

      {canEdit && (
        <Card>
          <CardHeader>
            <CardTitle>Import de Données</CardTitle>
            <CardDescription>
              Format: Statut;Date Reçu;Date Rendu;Groupe;Employé;Donneur;Recep;Somme
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              className="min-h-32 font-mono text-sm"
              placeholder="En cours;2024-01-15;2024-01-20;Groupe A;Jean Dupont;Client X;Dest Y;25000&#10;Terminé;2024-01-10;2024-01-18;Groupe B;Marie Martin;Client Z;Dest W;45000"
              value={pasteData}
              onChange={(e) => setPasteData(e.target.value)}
            />
            <Button onClick={handlePasteData} disabled={!pasteData.trim()}>
              <Upload className="mr-2 h-4 w-4" />
              Importer les Opérations
            </Button>
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
                  <tr key={line.id} className={`border-b hover:bg-muted/50 ${line.isTemporary ? 'bg-blue-50' : ''} ${line.markedForDeletion ? 'opacity-50 bg-red-50' : ''}`}>
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
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOperation(line)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteLine(line.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
              <>
                <Button onClick={handleSave} disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  Sauvegarder
                </Button>
                <Button onClick={archiveOperations} variant="outline" disabled={isLoading}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archiver
                </Button>
              </>
            )}
            {canExport && (
              <>
                <Button onClick={() => handleExport('excel')} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export Excel
                </Button>
                <Button onClick={() => handleExport('pdf')} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de détail d'opération */}
      {selectedOperation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Détail de l'Opération</h3>
                <Button variant="ghost" size="sm" onClick={() => setSelectedOperation(null)}>
                  ×
                </Button>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div>
                    <Label>Statut</Label>
                    <Badge className={
                      selectedOperation.statut === 'En cours' ? 'bg-orange-100 text-orange-800' :
                      selectedOperation.statut === 'Terminé' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {selectedOperation.statut}
                    </Badge>
                  </div>
                  <div>
                    <Label>Montant</Label>
                    <p className="text-lg font-bold">{formatCurrency(selectedOperation.somme)}</p>
                  </div>
                  <div>
                    <Label>Durée de traitement</Label>
                    <p>{selectedOperation.duree} jour(s)</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label>Groupe</Label>
                    <p>{selectedOperation.groupe}</p>
                  </div>
                  <div>
                    <Label>Employé responsable</Label>
                    <p>{selectedOperation.employe}</p>
                  </div>
                  <div>
                    <Label>Commissions</Label>
                    <p>Entreprise: {selectedOperation.percEntreprise}% • Groupe: {selectedOperation.percGroupe}%</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Calculs financiers</h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Commission entreprise:</span>
                    <span className="font-medium">{formatCurrency(selectedOperation.somme * selectedOperation.percEntreprise / 100)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Commission groupe:</span>
                    <span className="font-medium">{formatCurrency(selectedOperation.somme * selectedOperation.percGroupe / 100)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Total commissions:</span>
                    <span className="font-bold">{formatCurrency(selectedOperation.somme * (selectedOperation.percEntreprise + selectedOperation.percGroupe) / 100)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button variant="outline" onClick={() => setSelectedOperation(null)}>
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}