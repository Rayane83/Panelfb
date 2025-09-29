import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { Textarea } from '../ui/textarea'
import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { usePermissions } from '../../hooks/usePermissions'
import { useSupabase } from '../../hooks/useSupabase'
import { Award, User, Plus, Star, Calendar, TrendingUp, Save, Edit, Trash2, RefreshCw, CheckCircle, X } from 'lucide-react'
import { formatCurrency } from '../../lib/utils'

interface Qualification {
  id: string
  name: string
  level: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
  salary_bonus: number
  description: string
  requirements: string[]
  enterprise_id: string
  created_at: string
}

interface EmployeeQualification {
  id: string
  employee_id: string
  qualification_id: string
  date_obtained: string
  status: 'active' | 'expired' | 'revoked'
  notes?: string
}

interface Employee {
  id: string
  username: string
  grade_name: string
  qualifications: (Qualification & { date_obtained: string; status: string })[]
  total_qualification_bonus: number
}

export function QualificationsTab() {
  const { user } = useAuth()
  const { hasPermission } = usePermissions()
  const supabaseHooks = useSupabase()
  
  const [qualifications, setQualifications] = useState<Qualification[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [employeeQualifications, setEmployeeQualifications] = useState<EmployeeQualification[]>([])
  const [newQualification, setNewQualification] = useState({
    name: '',
    level: 'Bronze' as const,
    salary_bonus: 150,
    description: '',
    requirements: ['']
  })
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [selectedQualification, setSelectedQualification] = useState('')
  const [editingQual, setEditingQual] = useState<string | null>(null)
  const [toast, setToast] = useState<{type: 'success' | 'error', message: string} | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const canEdit = hasPermission('qualifications') && ['patron', 'co_patron', 'superviseur'].includes(user?.role || '')
  const canAssign = hasPermission('qualifications') && ['patron', 'co_patron'].includes(user?.role || '')
  const canView = hasPermission('qualifications')

  useEffect(() => {
    loadQualificationsData()
  }, [])

  const loadQualificationsData = async () => {
    if (!user?.enterprises?.[0]?.id) return
    
    try {
      setIsLoading(true)
      const enterpriseId = user.enterprises[0].id
      
      const [qualificationsData, employeesData, empQualData] = await Promise.all([
        supabaseHooks.getQualifications(enterpriseId),
        supabaseHooks.getEmployees(enterpriseId),
        supabaseHooks.getEmployeeQualifications(enterpriseId)
      ])
      
      setQualifications(qualificationsData)
      setEmployeeQualifications(empQualData)
      
      // Enrichir les employés avec leurs qualifications
      const enrichedEmployees = employeesData.map(emp => {
        const empQuals = empQualData.filter(eq => eq.employee_id === emp.id)
        const qualificationsWithDetails = empQuals.map(eq => {
          const qual = qualificationsData.find(q => q.id === eq.qualification_id)
          return qual ? {
            ...qual,
            date_obtained: eq.date_obtained,
            status: eq.status
          } : null
        }).filter(Boolean)
        
        const totalBonus = qualificationsWithDetails.reduce((sum, q) => sum + (q?.salary_bonus || 0), 0)
        
        return {
          ...emp,
          qualifications: qualificationsWithDetails,
          total_qualification_bonus: totalBonus
        }
      })
      
      setEmployees(enrichedEmployees)
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
      showToast('error', 'Erreur lors du chargement des qualifications')
    } finally {
      setIsLoading(false)
    }
  }

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  const createQualification = async () => {
    if (!canEdit || !user?.enterprises?.[0]?.id) return

    if (!newQualification.name || !newQualification.description) {
      showToast('error', 'Veuillez remplir tous les champs obligatoires')
      return
    }

    try {
      setIsLoading(true)
      
      const qualificationData = {
        ...newQualification,
        enterprise_id: user.enterprises[0].id,
        requirements: newQualification.requirements.filter(req => req.trim() !== '')
      }
      
      const createdQual = await supabaseHooks.createQualification(qualificationData)
      setQualifications(prev => [createdQual, ...prev])
      
      setNewQualification({
        name: '',
        level: 'Bronze',
        salary_bonus: 150,
        description: '',
        requirements: ['']
      })
      setShowCreateForm(false)
      
      showToast('success', 'Qualification créée avec succès')
    } catch (error) {
      console.error('Erreur:', error)
      showToast('error', 'Erreur lors de la création')
    } finally {
      setIsLoading(false)
    }
  }

  const assignQualification = async () => {
    if (!canAssign || !selectedEmployee || !selectedQualification) return

    try {
      setIsLoading(true)
      
      const assignmentData = {
        employee_id: selectedEmployee,
        qualification_id: selectedQualification,
        date_obtained: new Date().toISOString().split('T')[0],
        status: 'active'
      }
      
      await supabaseHooks.assignQualification(assignmentData)
      await loadQualificationsData()
      
      setSelectedEmployee('')
      setSelectedQualification('')
      
      showToast('success', 'Qualification attribuée avec succès')
    } catch (error) {
      console.error('Erreur:', error)
      showToast('error', 'Erreur lors de l\'attribution')
    } finally {
      setIsLoading(false)
    }
  }

  const revokeQualification = async (employeeId: string, qualificationId: string) => {
    if (!canEdit) return

    if (confirm('Êtes-vous sûr de vouloir révoquer cette qualification ?')) {
      try {
        setIsLoading(true)
        await supabaseHooks.revokeQualification(employeeId, qualificationId)
        await loadQualificationsData()
        showToast('success', 'Qualification révoquée')
      } catch (error) {
        console.error('Erreur:', error)
        showToast('error', 'Erreur lors de la révocation')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const deleteQualification = async (qualificationId: string) => {
    if (!canEdit) return

    if (confirm('Êtes-vous sûr de vouloir supprimer cette qualification ?')) {
      try {
        setIsLoading(true)
        await supabaseHooks.deleteQualification(qualificationId)
        await loadQualificationsData()
        showToast('success', 'Qualification supprimée')
      } catch (error) {
        console.error('Erreur:', error)
        showToast('error', 'Erreur lors de la suppression')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const addRequirement = () => {
    setNewQualification(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }))
  }

  const updateRequirement = (index: number, value: string) => {
    setNewQualification(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => i === index ? value : req)
    }))
  }

  const removeRequirement = (index: number) => {
    setNewQualification(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }))
  }

  const levelColors = {
    'Bronze': 'bg-amber-100 text-amber-800',
    'Silver': 'bg-gray-100 text-gray-800',
    'Gold': 'bg-yellow-100 text-yellow-800',
    'Platinum': 'bg-purple-100 text-purple-800'
  }

  const levelIcons = {
    'Bronze': '🥉',
    'Silver': '🥈',
    'Gold': '🥇',
    'Platinum': '💎'
  }

  const levelBonuses = {
    'Bronze': 150,
    'Silver': 300,
    'Gold': 500,
    'Platinum': 750
  }

  const totalQualifications = qualifications.length
  const totalEmployeesWithQual = employees.filter(e => e.qualifications.length > 0).length
  const totalBonusImpact = employees.reduce((sum, e) => sum + e.total_qualification_bonus, 0)
  const averageQualPerEmployee = employees.length > 0 ? employees.reduce((sum, e) => sum + e.qualifications.length, 0) / employees.length : 0

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
          toast.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
          'bg-red-100 text-red-800 border border-red-200'
        }`}>
          <span>{toast.message}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestion des Qualifications</h2>
          <p className="text-muted-foreground">
            Attribuez et gérez les qualifications des employés avec impact salarial
          </p>
        </div>
        <div className="flex space-x-2">
          {canEdit && (
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle Qualification
            </Button>
          )}
          <Button onClick={loadQualificationsData} variant="outline" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Qualifications</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQualifications}</div>
            <p className="text-xs text-muted-foreground">Disponibles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employés Qualifiés</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployeesWithQual}</div>
            <p className="text-xs text-muted-foreground">Avec qualifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impact Salarial</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalBonusImpact)}</div>
            <p className="text-xs text-muted-foreground">Bonus mensuels</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Moyenne/Employé</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageQualPerEmployee.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Qualifications</p>
          </CardContent>
        </Card>
      </div>

      {/* Formulaire de création */}
      {showCreateForm && canEdit && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Nouvelle Qualification</CardTitle>
            <CardDescription className="text-green-700">
              Créez une nouvelle qualification avec bonus salarial
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="qualName">Nom de la qualification *</Label>
                <Input
                  id="qualName"
                  placeholder="Expert en..."
                  value={newQualification.name}
                  onChange={(e) => setNewQualification(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Niveau *</Label>
                <select 
                  id="level"
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
                  value={newQualification.level}
                  onChange={(e) => setNewQualification(prev => ({ 
                    ...prev, 
                    level: e.target.value as any,
                    salary_bonus: levelBonuses[e.target.value as keyof typeof levelBonuses]
                  }))}
                >
                  <option value="Bronze">Bronze (+{formatCurrency(levelBonuses.Bronze)})</option>
                  <option value="Silver">Silver (+{formatCurrency(levelBonuses.Silver)})</option>
                  <option value="Gold">Gold (+{formatCurrency(levelBonuses.Gold)})</option>
                  <option value="Platinum">Platinum (+{formatCurrency(levelBonuses.Platinum)})</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Description détaillée de la qualification..."
                value={newQualification.description}
                onChange={(e) => setNewQualification(prev => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Prérequis</Label>
              {newQualification.requirements.map((req, index) => (
                <div key={index} className="flex space-x-2">
                  <Input
                    placeholder="Prérequis..."
                    value={req}
                    onChange={(e) => updateRequirement(index, e.target.value)}
                    className="flex-1"
                  />
                  {newQualification.requirements.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeRequirement(index)}
                      className="text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button onClick={addRequirement} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un Prérequis
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={createQualification} className="flex-1" disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                Créer la Qualification
              </Button>
              <Button onClick={() => setShowCreateForm(false)} variant="outline" className="flex-1">
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attribution rapide */}
      {canAssign && (
        <Card>
          <CardHeader>
            <CardTitle>Attribution Rapide</CardTitle>
            <CardDescription>
              Attribuez une qualification à un employé
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="employee">Employé *</Label>
                <select
                  id="employee"
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                >
                  <option value="">Sélectionner un employé</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.username} ({emp.grade_name}) - {emp.qualifications.length} qual.
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="qualification">Qualification *</Label>
                <select 
                  id="qualification"
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
                  value={selectedQualification}
                  onChange={(e) => setSelectedQualification(e.target.value)}
                >
                  <option value="">Sélectionner une qualification</option>
                  {qualifications.map((qual) => (
                    <option key={qual.id} value={qual.id}>
                      {qual.name} ({qual.level}) - +{formatCurrency(qual.salary_bonus)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <Button 
              onClick={assignQualification} 
              className="w-full"
              disabled={!selectedEmployee || !selectedQualification || isLoading}
            >
              <Award className="mr-2 h-4 w-4" />
              Attribuer la Qualification
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Catalogue des Qualifications ({qualifications.length})</CardTitle>
          <CardDescription>
            Toutes les qualifications disponibles avec leurs avantages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {qualifications.map((qualification) => (
              <div key={qualification.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{levelIcons[qualification.level]}</span>
                    <h4 className="font-medium">{qualification.name}</h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={levelColors[qualification.level]}>
                      {qualification.level}
                    </Badge>
                    {canEdit && (
                      <Button variant="outline" size="sm" onClick={() => deleteQualification(qualification.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {qualification.description}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Bonus salarial:</span>
                    <span className="font-bold text-green-600">+{formatCurrency(qualification.salary_bonus)}</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Prérequis:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {qualification.requirements.map((req, index) => (
                        <li key={index} className="flex items-center space-x-1">
                          <span>•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Créée le {new Date(qualification.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
            ))}
            
            {qualifications.length === 0 && (
              <div className="col-span-2 text-center py-8">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground">Aucune qualification</p>
                <p className="text-sm text-muted-foreground">
                  {canEdit ? 'Créez votre première qualification' : 'Aucune qualification disponible'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Employés et leurs Qualifications</CardTitle>
          <CardDescription>
            Vue d'ensemble des qualifications par employé avec impact salarial
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {employees.map((employee) => (
              <div key={employee.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">{employee.username}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{employee.grade_name}</Badge>
                        <Badge className="bg-blue-100 text-blue-800">
                          {employee.qualifications.length} qualification(s)
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">+{formatCurrency(employee.total_qualification_bonus)}/mois</p>
                    <p className="text-xs text-muted-foreground">Bonus qualifications</p>
                  </div>
                </div>
                
                <div className="grid gap-3 md:grid-cols-2">
                  {employee.qualifications.map((qual, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex items-center space-x-2">
                        <span>{levelIcons[qual.level]}</span>
                        <div>
                          <p className="text-sm font-medium">{qual.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Obtenue le {new Date(qual.date_obtained).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={levelColors[qual.level]}>
                          +{formatCurrency(qual.salary_bonus)}
                        </Badge>
                        {canEdit && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => revokeQualification(employee.id, qual.id)}
                            className="text-red-600"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {employee.qualifications.length === 0 && (
                    <div className="col-span-2 text-center py-4 text-muted-foreground">
                      <Award className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Aucune qualification</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {employees.length === 0 && (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground">Aucun employé</p>
                <p className="text-sm text-muted-foreground">
                  Les employés apparaîtront ici une fois ajoutés
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistiques détaillées */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Répartition par Niveau</CardTitle>
            <CardDescription>
              Distribution des qualifications par niveau
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(levelColors).map(([level, colorClass]) => {
                const count = qualifications.filter(q => q.level === level).length
                const percentage = qualifications.length > 0 ? (count / qualifications.length) * 100 : 0
                
                return (
                  <div key={level} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span>{levelIcons[level as keyof typeof levelIcons]}</span>
                        <Badge className={colorClass}>{level}</Badge>
                      </div>
                      <span className="text-sm font-medium">{count}</span>
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
            <CardTitle>Impact Financier</CardTitle>
            <CardDescription>
              Analyse de l'impact des qualifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Bonus total/mois:</span>
                <span className="font-bold text-green-600">{formatCurrency(totalBonusImpact)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Bonus moyen/employé:</span>
                <span className="font-medium">{formatCurrency(totalEmployeesWithQual > 0 ? totalBonusImpact / totalEmployeesWithQual : 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Impact annuel:</span>
                <span className="font-bold">{formatCurrency(totalBonusImpact * 12)}</span>
              </div>
            </div>
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 Les qualifications augmentent la motivation et la productivité
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
            <CardDescription>
              Outils de gestion des qualifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" onClick={() => {
              const exportData = qualifications.map(q => ({
                Nom: q.name,
                Niveau: q.level,
                Bonus: q.salary_bonus,
                Description: q.description,
                Prérequis: q.requirements.join('; ')
              }))
              showToast('success', 'Catalogue des qualifications exporté')
            }}>
              <Download className="mr-2 h-4 w-4" />
              Exporter le Catalogue
            </Button>
            
            <Button variant="outline" className="w-full" onClick={() => {
              const exportData = employees.map(e => ({
                Employé: e.username,
                Grade: e.grade_name,
                'Nb Qualifications': e.qualifications.length,
                'Bonus Total': e.total_qualification_bonus,
                Qualifications: e.qualifications.map(q => q.name).join(', ')
              }))
              showToast('success', 'Rapport employés exporté')
            }}>
              <Download className="mr-2 h-4 w-4" />
              Exporter Rapport Employés
            </Button>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Gestion complète des qualifications</p>
              <p>• Attribution et révocation</p>
              <p>• Impact salarial automatique</p>
              <p>• Export Excel personnalisé</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}