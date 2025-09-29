import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { usePermissions } from '../../hooks/usePermissions'
import { Plus, Download, FileText, Calculator, Upload, Save, Archive, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '../../lib/utils'

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
  const [employees, setEmployees] = useState<Employee[]>([
    { id: '1', nom: 'Jean Dupont', grade: 'Senior', run: 15000, facture: 8000, vente: 5000, caTotal: 28000, salaire: 3500, prime: 500 },
    { id: '2', nom: 'Marie Martin', grade: 'Manager', run: 20000, facture: 12000, vente: 8000, caTotal: 40000, salaire: 4500, prime: 750 }
  ])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [pasteData, setPasteData] = useState('')
  const [selectedCell, setSelectedCell] = useState<{row: number, col: string} | null>(null)
  const [toast, setToast] = useState<{type: 'success' | 'error' | 'warning', message: string} | null>(null)
  
  const canEdit = hasPermission('dotations') && (user?.role === 'patron' || user?.role === 'co_patron')
  const canExport = hasPermission('dotations')
  const isReadOnly = user?.role === 'staff' || user?.role === 'dot' || user?.role === 'employee'

  const showToast = (type: 'success' | 'error' | 'warning', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  const handlePasteData = () => {
    if (!canEdit || !pasteData.trim()) return

    try {
      const lines = pasteData.trim().split('\n')
      const newEmployees = [...employees]

      lines.forEach(line => {
        const parts = line.split(/[;\t,]/).map(p => p.trim())
        if (parts.length >= 4) {
          const [nom, run, facture, vente] = parts
          const runVal = parseFloat(run.replace(',', '.')) || 0
          const factureVal = parseFloat(facture.replace(',', '.')) || 0
          const venteVal = parseFloat(vente.replace(',', '.')) || 0
          const caTotal = runVal + factureVal + venteVal

          const existingIndex = newEmployees.findIndex(emp => emp.nom === nom)
          const newEmployee: Employee = {
            id: existingIndex >= 0 ? newEmployees[existingIndex].id : Date.now().toString(),
            nom,
            grade: existingIndex >= 0 ? newEmployees[existingIndex].grade : 'Junior',
            run: runVal,
            facture: factureVal,
            vente: venteVal,
            caTotal,
            salaire: calculateSalary(caTotal, existingIndex >= 0 ? newEmployees[existingIndex].grade : 'Junior'),
            prime: calculatePrime(caTotal, existingIndex >= 0 ? newEmployees[existingIndex].grade : 'Junior')
          }

          if (existingIndex >= 0) {
            newEmployees[existingIndex] = newEmployee
          } else {
            newEmployees.push(newEmployee)
          }
        }
      })

      setEmployees(newEmployees)
      setPasteData('')
      showToast('success', 'Données importées avec succès')
    } catch (error) {
      showToast('error', 'Erreur lors de l\'importation des données')
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

  const addExpense = () => {
    if (!canEdit) return
    setExpenses([...expenses, { id: Date.now().toString(), date: '', justificatif: '', montant: 0 }])
  }

  const addWithdrawal = () => {
    if (!canEdit) return
    setWithdrawals([...withdrawals, { id: Date.now().toString(), date: '', justificatif: '', montant: 0 }])
  }

  const handleSave = () => {
    if (!canEdit) return
    
    // Validation
    const incompleteRows = employees.filter(emp => !emp.nom.trim() || emp.run < 0 || emp.facture < 0 || emp.vente < 0)
    if (incompleteRows.length > 0) {
      showToast('warning', `${incompleteRows.length} ligne(s) incomplète(s) détectée(s)`)
    }

    showToast('success', 'Rapport enregistré avec succès')
  }

  const handleArchive = () => {
    if (!canEdit) return
    showToast('success', 'Rapport envoyé aux archives')
  }

  const totalCA = employees.reduce((sum, emp) => sum + emp.caTotal, 0)
  const totalSalaires = employees.reduce((sum, emp) => sum + emp.salaire, 0)
  const totalPrimes = employees.reduce((sum, emp) => sum + emp.prime, 0)

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

      <div className="grid gap-4 md:grid-cols-4">
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
            <CardTitle>Import de Données</CardTitle>
            <CardDescription>
              Collez vos données Excel/CSV au format : Nom;RUN;FACTURE;VENTE
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {canEdit && (
            <div className="flex space-x-2 mt-4">
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer
              </Button>
              <Button onClick={handleArchive} variant="outline">
                <Archive className="mr-2 h-4 w-4" />
                Envoyer aux Archives
              </Button>
            </div>
          )}
          
          {canExport && (
            <Button variant="outline" className="mt-2">
              <Download className="mr-2 h-4 w-4" />
              Exporter PDF
            </Button>
          )}
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
            <div className="space-y-4">
              {expenses.map((expense, index) => (
                <div key={expense.id} className="grid grid-cols-3 gap-2">
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
                  />
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
            <div className="space-y-4">
              {withdrawals.map((withdrawal, index) => (
                <div key={withdrawal.id} className="grid grid-cols-3 gap-2">
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
                  />
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