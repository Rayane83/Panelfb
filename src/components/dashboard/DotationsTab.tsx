import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { usePermissions } from '../../hooks/usePermissions'
import { useSupabase } from '../../hooks/useSupabase'
import { Plus, Download, FileText, Calculator, Upload, Save, Archive, AlertTriangle, Trash2 } from 'lucide-react'
import { formatCurrency } from '../../lib/utils'
import { parseDotationData, parseExpenseData, exportToExcel } from '../../utils/csvParser'

interface Employee {
  id: string
  nom: string
  grade: string
  run: number
  facture: number
  vente: number
  caTotal: number
  salaire: number
  prime: number
}

interface Expense {
  id: string
  date: string
  justificatif: string
  montant: number
}

interface Withdrawal {
  id: string
  date: string
  justificatif: string
  montant: number
}

export function DotationsTab() {
  const { user } = useAuth()
  const { hasPermission } = usePermissions()
  const supabaseHooks = useSupabase()
  
  const [employees, setEmployees] = useState<Employee[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [pasteData, setPasteData] = useState('')
  const [expensePasteData, setExpensePasteData] = useState('')
  const [withdrawalPasteData, setWithdrawalPasteData] = useState('')
  const [selectedCell, setSelectedCell] = useState<{row: number, col: string} | null>(null)
  const [toast, setToast] = useState<{type: 'success' | 'error' | 'warning', message: string} | null>(null)
  const [currentDotationId, setCurrentDotationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const canEdit = hasPermission('dotations') && (user?.role === 'patron' || user?.role === 'co_patron')
  const canExport = hasPermission('dotations')
  const isReadOnly = user?.role === 'superviseur' || user?.role === 'dot' || user?.role === 'employee'

  useEffect(() => {
    loadDotations()
  }, [])

  const loadDotations = async () => {
    if (!user?.currentGuild?.id) return
    
    try {
      setIsLoading(true)
      const dotations = await supabaseHooks.getDotations(user.currentGuild.id)
      
      if (dotations.length > 0) {
        const latest = dotations[0]
        setCurrentDotationId(latest.id)
        
        // Charger les lignes d'employés
        const employeeLines = latest.dotation_lines.map((line: any) => ({
          id: line.id,
          nom: line.employee_name,
          grade: line.grade || 'Junior',
          run: line.run_amount,
          facture: line.facture_amount,
          vente: line.vente_amount,
          caTotal: line.ca_total,
          salaire: line.salary,
          prime: line.bonus
        }))
        setEmployees(employeeLines)
        
        // Charger les dépenses
        const expenseLines = latest.expenses.map((exp: any) => ({
          id: exp.id,
          date: exp.date,
          justificatif: exp.description,
          montant: exp.amount
        }))
        setExpenses(expenseLines)
        
        // Charger les retraits
        const withdrawalLines = latest.withdrawals.map((wit: any) => ({
          id: wit.id,
          date: wit.date,
          justificatif: wit.description,
          montant: wit.amount
        }))
        setWithdrawals(withdrawalLines)
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

  const handlePasteData = () => {
    if (!canEdit || !pasteData.trim()) return

    try {
      const parsedData = parseDotationData(pasteData)
      
      const newEmployees = [...employees]
      
      parsedData.forEach(newEmp => {
        const existingIndex = newEmployees.findIndex(emp => emp.nom === newEmp.nom)
        
        if (existingIndex >= 0) {
          // Mettre à jour l'employé existant
          newEmployees[existingIndex] = {
            ...newEmployees[existingIndex],
            ...newEmp,
            id: newEmployees[existingIndex].id
          }
        } else {
          // Ajouter un nouvel employé
          newEmployees.push({
            ...newEmp,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
          })
        }
      })

      setEmployees(newEmployees)
      setPasteData('')
      showToast('success', `${parsedData.length} ligne(s) importée(s) avec succès`)
    } catch (error) {
      console.error('Erreur lors de l\'importation:', error)
      showToast('error', 'Erreur lors de l\'importation des données')
    }
  }

  const handlePasteExpenses = () => {
    if (!canEdit || !expensePasteData.trim()) return

    try {
      const parsedData = parseExpenseData(expensePasteData)
      setExpenses(prev => [...prev, ...parsedData])
      setExpensePasteData('')
      showToast('success', `${parsedData.length} dépense(s) importée(s)`)
    } catch (error) {
      showToast('error', 'Erreur lors de l\'importation des dépenses')
    }
  }

  const handlePasteWithdrawals = () => {
    if (!canEdit || !withdrawalPasteData.trim()) return

    try {
      const parsedData = parseExpenseData(withdrawalPasteData) // Même format
      setWithdrawals(prev => [...prev, ...parsedData])
      setWithdrawalPasteData('')
      showToast('success', `${parsedData.length} retrait(s) importé(s)`)
    } catch (error) {
      showToast('error', 'Erreur lors de l\'importation des retraits')
    }
  }

  const calculateSalary = (caTotal: number, grade: string): number => {
    const baseRates = { 'Junior': 2500, 'Senior': 3500, 'Manager': 4500, 'Director': 6000 }
    return baseRates[grade as keyof typeof baseRates] || 2500
  }

  const calculatePrime = (caTotal: number, grade: string): number => {
    const primeRates = { 'Junior': 0.05, 'Senior': 0.08, 'Manager': 0.12, 'Director': 0.15 }
    return Math.round(caTotal * (primeRates[grade as keyof typeof primeRates] || 0.05))
  }

  const handleCellEdit = (rowIndex: number, field: string, value: string) => {
    if (!canEdit) return

    const newEmployees = [...employees]
    const employee = newEmployees[rowIndex]

    if (field === 'nom' || field === 'grade') {
      (employee as any)[field] = value
      if (field === 'grade') {
        employee.salaire = calculateSalary(employee.caTotal, value)
        employee.prime = calculatePrime(employee.caTotal, value)
      }
    } else if (['run', 'facture', 'vente'].includes(field)) {
      const numValue = parseFloat(value.replace(',', '.')) || 0
      if (numValue >= 0) {
        (employee as any)[field] = numValue
        employee.caTotal = employee.run + employee.facture + employee.vente
        employee.salaire = calculateSalary(employee.caTotal, employee.grade)
        employee.prime = calculatePrime(employee.caTotal, employee.grade)
      }
    }

    setEmployees(newEmployees)
  }

  const handleKeyDown = (e: React.KeyboardEvent, rowIndex: number, field: string) => {
    if (!canEdit) return

    const fields = ['nom', 'grade', 'run', 'facture', 'vente']
    const currentFieldIndex = fields.indexOf(field)

    switch (e.key) {
      case 'ArrowRight':
        if (currentFieldIndex < fields.length - 1) {
          setSelectedCell({ row: rowIndex, col: fields[currentFieldIndex + 1] })
        }
        break
      case 'ArrowLeft':
        if (currentFieldIndex > 0) {
          setSelectedCell({ row: rowIndex, col: fields[currentFieldIndex - 1] })
        }
        break
      case 'ArrowDown':
        if (rowIndex < employees.length - 1) {
          setSelectedCell({ row: rowIndex + 1, col: field })
        }
        break
      case 'ArrowUp':
        if (rowIndex > 0) {
          setSelectedCell({ row: rowIndex - 1, col: field })
        }
        break
      case 'Home':
        setSelectedCell({ row: rowIndex, col: fields[0] })
        break
      case 'End':
        setSelectedCell({ row: rowIndex, col: fields[fields.length - 1] })
        break
    }
  }

  const addEmployee = () => {
    if (!canEdit) return
    
    const newEmployee: Employee = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      nom: '',
      grade: 'Junior',
      run: 0,
      facture: 0,
      vente: 0,
      caTotal: 0,
      salaire: 2500,
      prime: 0
    }
    
    setEmployees(prev => [...prev, newEmployee])
  }

  const removeEmployee = (index: number) => {
    if (!canEdit) return
    setEmployees(prev => prev.filter((_, i) => i !== index))
  }

  const addExpense = () => {
    if (!canEdit) return
    setExpenses(prev => [...prev, { 
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9), 
      date: new Date().toISOString().split('T')[0], 
      justificatif: '', 
      montant: 0 
    }])
  }

  const removeExpense = (index: number) => {
    if (!canEdit) return
    setExpenses(prev => prev.filter((_, i) => i !== index))
  }

  const addWithdrawal = () => {
    if (!canEdit) return
    setWithdrawals(prev => [...prev, { 
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9), 
      date: new Date().toISOString().split('T')[0], 
      justificatif: '', 
      montant: 0 
    }])
  }

  const removeWithdrawal = (index: number) => {
    if (!canEdit) return
    setWithdrawals(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!canEdit || !user?.currentGuild?.id) return
    
    try {
      setIsLoading(true)
      
      let dotationId = currentDotationId
      
      if (!dotationId) {
        // Créer une nouvelle dotation
        const dotation = await supabaseHooks.createDotation(
          user.currentGuild.id,
          `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
        )
        dotationId = dotation.id
        setCurrentDotationId(dotationId)
      }
      
      // Sauvegarder les lignes d'employés
      await supabaseHooks.saveDotationLines(dotationId, employees)
      
      // Sauvegarder les dépenses
      await supabaseHooks.saveExpenses(dotationId, expenses)
      
      // Sauvegarder les retraits
      await supabaseHooks.saveWithdrawals(dotationId, withdrawals)
      
      showToast('success', 'Rapport enregistré avec succès')
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      showToast('error', 'Erreur lors de la sauvegarde')
    } finally {
      setIsLoading(false)
    }
  }

  const handleArchive = async () => {
    if (!canEdit || !user?.currentGuild?.id) return
    
    try {
      setIsLoading(true)
      
      const reportData = {
        type: 'dotation',
        description: `Rapport dotation ${new Date().toLocaleDateString('fr-FR')}`,
        totalAmount: totalCA,
        employees: employees.length,
        lines: employees,
        expenses,
        withdrawals,
        totals: {
          ca: totalCA,
          salaires: totalSalaires,
          primes: totalPrimes
        }
      }
      
      await supabaseHooks.archiveReport(user.currentGuild.id, reportData)
      showToast('success', 'Rapport envoyé aux archives')
    } catch (error) {
      console.error('Erreur lors de l\'archivage:', error)
      showToast('error', 'Erreur lors de l\'archivage')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = () => {
    if (!canExport) return
    
    const exportData = employees.map(emp => ({
      Nom: emp.nom,
      Grade: emp.grade,
      RUN: emp.run,
      FACTURE: emp.facture,
      VENTE: emp.vente,
      'CA TOTAL': emp.caTotal,
      Salaire: emp.salaire,
      Prime: emp.prime
    }))
    
    const filename = `dotations_${user?.currentGuild?.name || 'export'}_${new Date().toISOString().split('T')[0]}.xlsx`
    exportToExcel(exportData, filename)
    showToast('success', 'Export généré avec succès')
  }

  const totalCA = employees.reduce((sum, emp) => sum + emp.caTotal, 0)
  const totalSalaires = employees.reduce((sum, emp) => sum + emp.salaire, 0)
  const totalPrimes = employees.reduce((sum, emp) => sum + emp.prime, 0)
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.montant, 0)
  const totalWithdrawals = withdrawals.reduce((sum, wit) => sum + wit.montant, 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
    )
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
            {toast.type === 'warning' && <AlertTriangle className="h-4 w-4" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-3xl font-bold tracking-tight">Gestion des Dotations</h2>
        <p className="text-muted-foreground">
          Saisie et calcul automatique des dotations avec import Excel/CSV
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CA Total</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCA)}</div>
            <p className="text-xs text-muted-foreground">Chiffre d'affaires</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salaires</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSalaires)}</div>
            <p className="text-xs text-muted-foreground">Total mensuel</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Primes</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPrimes)}</div>
            <p className="text-xs text-muted-foreground">Total calculé</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dépenses</CardTitle>
            <FileText className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">Déductibles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employés</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-muted-foreground">Actifs</p>
          </CardContent>
        </Card>
      </div>

      {canEdit && (
        <Card>
          <CardHeader>
            <CardTitle>Import de Données Employés</CardTitle>
            <CardDescription>
              Collez vos données Excel/CSV au format : Nom;RUN;FACTURE;VENTE (séparateurs acceptés : tab, virgule, point-virgule)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              className="w-full h-32 p-3 border rounded-lg resize-none font-mono text-sm"
              placeholder="Jean Dupont;15000;8000;5000&#10;Marie Martin;20000;12000;8000"
              value={pasteData}
              onChange={(e) => setPasteData(e.target.value)}
              disabled={isReadOnly}
            />
            <Button onClick={handlePasteData} disabled={!pasteData.trim() || isReadOnly}>
              <Upload className="mr-2 h-4 w-4" />
              Importer les Données
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Table des Employés</CardTitle>
          <CardDescription>
            Grille éditable avec navigation clavier (flèches, Home/End, Tab)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" role="grid" aria-label="Tableau des employés">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Nom</th>
                  <th className="text-left p-2 font-medium">Grade</th>
                  <th className="text-left p-2 font-medium">RUN</th>
                  <th className="text-left p-2 font-medium">FACTURE</th>
                  <th className="text-left p-2 font-medium">VENTE</th>
                  <th className="text-left p-2 font-medium">CA TOTAL</th>
                  <th className="text-left p-2 font-medium">Salaire</th>
                  <th className="text-left p-2 font-medium">Prime</th>
                  {canEdit && <th className="text-left p-2 font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {employees.map((employee, rowIndex) => (
                  <tr key={employee.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <Input
                        value={employee.nom}
                        onChange={(e) => handleCellEdit(rowIndex, 'nom', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, rowIndex, 'nom')}
                        onFocus={() => setSelectedCell({ row: rowIndex, col: 'nom' })}
                        disabled={!canEdit}
                        className={selectedCell?.row === rowIndex && selectedCell?.col === 'nom' ? 'ring-2 ring-primary' : ''}
                        aria-label={`Nom employé ligne ${rowIndex + 1}`}
                        required
                      />
                    </td>
                    <td className="p-2">
                      <select
                        value={employee.grade}
                        onChange={(e) => handleCellEdit(rowIndex, 'grade', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, rowIndex, 'grade')}
                        onFocus={() => setSelectedCell({ row: rowIndex, col: 'grade' })}
                        disabled={!canEdit}
                        className={`w-full h-10 px-3 rounded-lg border border-input bg-background text-sm ${
                          selectedCell?.row === rowIndex && selectedCell?.col === 'grade' ? 'ring-2 ring-primary' : ''
                        }`}
                        aria-label={`Grade employé ligne ${rowIndex + 1}`}
                      >
                        <option value="Junior">Junior</option>
                        <option value="Senior">Senior</option>
                        <option value="Manager">Manager</option>
                        <option value="Director">Director</option>
                      </select>
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={employee.run}
                        onChange={(e) => handleCellEdit(rowIndex, 'run', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, rowIndex, 'run')}
                        onFocus={() => setSelectedCell({ row: rowIndex, col: 'run' })}
                        disabled={!canEdit}
                        className={selectedCell?.row === rowIndex && selectedCell?.col === 'run' ? 'ring-2 ring-primary' : ''}
                        aria-label={`RUN employé ligne ${rowIndex + 1}`}
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={employee.facture}
                        onChange={(e) => handleCellEdit(rowIndex, 'facture', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, rowIndex, 'facture')}
                        onFocus={() => setSelectedCell({ row: rowIndex, col: 'facture' })}
                        disabled={!canEdit}
                        className={selectedCell?.row === rowIndex && selectedCell?.col === 'facture' ? 'ring-2 ring-primary' : ''}
                        aria-label={`Facture employé ligne ${rowIndex + 1}`}
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={employee.vente}
                        onChange={(e) => handleCellEdit(rowIndex, 'vente', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, rowIndex, 'vente')}
                        onFocus={() => setSelectedCell({ row: rowIndex, col: 'vente' })}
                        disabled={!canEdit}
                        className={selectedCell?.row === rowIndex && selectedCell?.col === 'vente' ? 'ring-2 ring-primary' : ''}
                        aria-label={`Vente employé ligne ${rowIndex + 1}`}
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        value={formatCurrency(employee.caTotal)}
                        disabled
                        className="bg-muted"
                        aria-label={`CA Total employé ligne ${rowIndex + 1}`}
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        value={formatCurrency(employee.salaire)}
                        disabled
                        className="bg-muted"
                        aria-label={`Salaire employé ligne ${rowIndex + 1}`}
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        value={formatCurrency(employee.prime)}
                        disabled
                        className="bg-muted"
                        aria-label={`Prime employé ligne ${rowIndex + 1}`}
                      />
                    </td>
                    {canEdit && (
                      <td className="p-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeEmployee(rowIndex)}
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
          
          <div className="flex space-x-2 mt-4">
            {canEdit && (
              <>
                <Button onClick={addEmployee}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter Employé
                </Button>
                <Button onClick={handleSave} disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer
                </Button>
                <Button onClick={handleArchive} variant="outline" disabled={isLoading}>
                  <Archive className="mr-2 h-4 w-4" />
                  Envoyer aux Archives
                </Button>
              </>
            )}
            
            {canExport && (
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Exporter Excel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dépenses Déductibles</CardTitle>
            <CardDescription>
              Justificatifs et montants des dépenses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {canEdit && (
              <div className="mb-4 space-y-2">
                <Label>Import dépenses (Date;Justificatif;Montant)</Label>
                <textarea
                  className="w-full h-20 p-2 border rounded text-sm font-mono"
                  placeholder="01/01/2024;Frais de bureau;1200&#10;02/01/2024;Essence;85.50"
                  value={expensePasteData}
                  onChange={(e) => setExpensePasteData(e.target.value)}
                />
                <Button onClick={handlePasteExpenses} size="sm" disabled={!expensePasteData.trim()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Importer
                </Button>
              </div>
            )}
            
            <div className="space-y-4">
              {expenses.map((expense, index) => (
                <div key={expense.id} className="grid grid-cols-4 gap-2 items-center">
                  <Input
                    type="date"
                    value={expense.date}
                    onChange={(e) => {
                      const newExpenses = [...expenses]
                      newExpenses[index].date = e.target.value
                      setExpenses(newExpenses)
                    }}
                    disabled={!canEdit}
                    aria-label={`Date dépense ${index + 1}`}
                    required
                  />
                  <Input
                    placeholder="Justificatif"
                    value={expense.justificatif}
                    onChange={(e) => {
                      const newExpenses = [...expenses]
                      newExpenses[index].justificatif = e.target.value
                      setExpenses(newExpenses)
                    }}
                    disabled={!canEdit}
                    aria-label={`Justificatif dépense ${index + 1}`}
                    required
                  />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Montant"
                    value={expense.montant}
                    onChange={(e) => {
                      const newExpenses = [...expenses]
                      newExpenses[index].montant = parseFloat(e.target.value) || 0
                      setExpenses(newExpenses)
                    }}
                    disabled={!canEdit}
                    aria-label={`Montant dépense ${index + 1}`}
                    required
                  />
                  {canEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeExpense(index)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {canEdit && (
                <Button onClick={addExpense} variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une Dépense
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tableau des Retraits</CardTitle>
            <CardDescription>
              Historique des retraits effectués
            </CardDescription>
          </CardHeader>
          <CardContent>
            {canEdit && (
              <div className="mb-4 space-y-2">
                <Label>Import retraits (Date;Justificatif;Montant)</Label>
                <textarea
                  className="w-full h-20 p-2 border rounded text-sm font-mono"
                  placeholder="01/01/2024;Retrait patron;5000&#10;15/01/2024;Dividendes;2500"
                  value={withdrawalPasteData}
                  onChange={(e) => setWithdrawalPasteData(e.target.value)}
                />
                <Button onClick={handlePasteWithdrawals} size="sm" disabled={!withdrawalPasteData.trim()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Importer
                </Button>
              </div>
            )}
            
            <div className="space-y-4">
              {withdrawals.map((withdrawal, index) => (
                <div key={withdrawal.id} className="grid grid-cols-4 gap-2 items-center">
                  <Input
                    type="date"
                    value={withdrawal.date}
                    onChange={(e) => {
                      const newWithdrawals = [...withdrawals]
                      newWithdrawals[index].date = e.target.value
                      setWithdrawals(newWithdrawals)
                    }}
                    disabled={!canEdit}
                    aria-label={`Date retrait ${index + 1}`}
                    required
                  />
                  <Input
                    placeholder="Justificatif"
                    value={withdrawal.justificatif}
                    onChange={(e) => {
                      const newWithdrawals = [...withdrawals]
                      newWithdrawals[index].justificatif = e.target.value
                      setWithdrawals(newWithdrawals)
                    }}
                    disabled={!canEdit}
                    aria-label={`Justificatif retrait ${index + 1}`}
                    required
                  />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Montant"
                    value={withdrawal.montant}
                    onChange={(e) => {
                      const newWithdrawals = [...withdrawals]
                      newWithdrawals[index].montant = parseFloat(e.target.value) || 0
                      setWithdrawals(newWithdrawals)
                    }}
                    disabled={!canEdit}
                    aria-label={`Montant retrait ${index + 1}`}
                    required
                  />
                  {canEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeWithdrawal(index)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {canEdit && (
                <Button onClick={addWithdrawal} variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un Retrait
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}