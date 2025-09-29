import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useSupabase() {
  const { user } = useAuth()
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Vérifier la connexion Supabase
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase.from('enterprises').select('count').limit(1)
        setIsConnected(!error)
      } catch (error) {
        setIsConnected(false)
      }
    }

    checkConnection()
  }, [])

  // Fonctions pour les entreprises
  const getAllEnterprises = async () => {
    try {
      const { data, error } = await supabase
        .from('enterprises')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching enterprises:', error)
      return []
    }
  }

  const createEnterprise = async (enterpriseData: any) => {
    try {
      const { data, error } = await supabase
        .from('enterprises')
        .insert({
          name: enterpriseData.name,
          guild_id: enterpriseData.guild_id,
          type: enterpriseData.type || 'SARL',
          description: enterpriseData.description,
          owner_discord_id: enterpriseData.owner_discord_id,
          settings: enterpriseData.settings || {}
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating enterprise:', error)
      throw error
    }
  }

  const updateEnterprise = async (enterpriseId: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('enterprises')
        .update(updates)
        .eq('id', enterpriseId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating enterprise:', error)
      throw error
    }
  }

  const deleteEnterprise = async (enterpriseId: string) => {
    try {
      const { error } = await supabase
        .from('enterprises')
        .delete()
        .eq('id', enterpriseId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting enterprise:', error)
      throw error
    }
  }

  // Fonctions pour les employés
  const getEmployees = async (enterpriseId: string) => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          grades (
            name,
            ca_percentage,
            hourly_rate
          )
        `)
        .eq('enterprise_id', enterpriseId)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching employees:', error)
      return []
    }
  }

  const createEmployee = async (employeeData: any) => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .insert(employeeData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating employee:', error)
      throw error
    }
  }

  // Fonctions pour les grades
  const getGrades = async (enterpriseId: string) => {
    try {
      const { data, error } = await supabase
        .from('grades')
        .select('*')
        .eq('enterprise_id', enterpriseId)
        .order('hierarchy', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching grades:', error)
      return []
    }
  }

  const createGrade = async (gradeData: any) => {
    try {
      const { data, error } = await supabase
        .from('grades')
        .insert(gradeData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating grade:', error)
      throw error
    }
  }

  // Fonctions pour les dotations
  const createDotation = async (enterpriseId: string, period: string) => {
    try {
      const { data, error } = await supabase
        .from('dotations')
        .insert({
          enterprise_id: enterpriseId,
          period,
          created_by: user?.username || 'unknown'
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating dotation:', error)
      throw error
    }
  }

  const getDotations = async (enterpriseId: string) => {
    try {
      const { data, error } = await supabase
        .from('dotations')
        .select(`
          *,
          dotation_lines (*),
          expenses (*),
          withdrawals (*)
        `)
        .eq('enterprise_id', enterpriseId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching dotations:', error)
      return []
    }
  }

  const saveDotationLines = async (dotationId: string, lines: any[]) => {
    try {
      // Supprimer les anciennes lignes
      await supabase
        .from('dotation_lines')
        .delete()
        .eq('dotation_id', dotationId)

      // Insérer les nouvelles lignes
      const { data, error } = await supabase
        .from('dotation_lines')
        .insert(
          lines.map(line => ({
            dotation_id: dotationId,
            employee_name: line.nom,
            grade: line.grade,
            run_amount: line.run,
            facture_amount: line.facture,
            vente_amount: line.vente,
            salary: line.salaire,
            bonus: line.prime
          }))
        )

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error saving dotation lines:', error)
      throw error
    }
  }

  const saveExpenses = async (dotationId: string, expenses: any[]) => {
    try {
      // Supprimer les anciennes dépenses
      await supabase
        .from('expenses')
        .delete()
        .eq('dotation_id', dotationId)

      // Insérer les nouvelles dépenses
      const { data, error } = await supabase
        .from('expenses')
        .insert(
          expenses.map(expense => ({
            dotation_id: dotationId,
            date: expense.date,
            description: expense.justificatif,
            amount: expense.montant
          }))
        )

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error saving expenses:', error)
      throw error
    }
  }

  const saveWithdrawals = async (dotationId: string, withdrawals: any[]) => {
    try {
      // Supprimer les anciens retraits
      await supabase
        .from('withdrawals')
        .delete()
        .eq('dotation_id', dotationId)

      // Insérer les nouveaux retraits
      const { data, error } = await supabase
        .from('withdrawals')
        .insert(
          withdrawals.map(withdrawal => ({
            dotation_id: dotationId,
            date: withdrawal.date,
            description: withdrawal.justificatif,
            amount: withdrawal.montant
          }))
        )

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error saving withdrawals:', error)
      throw error
    }
  }

  // Fonctions pour les simulations fiscales
  const saveTaxSimulation = async (enterpriseId: string, simulation: any) => {
    try {
      const { data, error } = await supabase
        .from('tax_simulations')
        .insert({
          enterprise_id: enterpriseId,
          base_amount: simulation.base,
          period: simulation.periode,
          tax_type: simulation.bareme,
          calculated_tax: simulation.taxOwed,
          effective_rate: simulation.effectiveRate,
          details: simulation.brackets,
          created_by: user?.username || 'unknown'
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error saving tax simulation:', error)
      throw error
    }
  }

  const getTaxBrackets = async (type: string) => {
    try {
      const { data, error } = await supabase
        .from('tax_brackets')
        .select('*')
        .eq('type', type)
        .order('min_amount', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching tax brackets:', error)
      return []
    }
  }

  // Fonctions pour les documents
  const uploadDocument = async (file: File, metadata: any) => {
    try {
      // Upload du fichier vers Supabase Storage
      const fileName = `${Date.now()}-${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Enregistrer les métadonnées en base
      const { data, error } = await supabase
        .from('documents')
        .insert({
          enterprise_id: metadata.enterpriseId,
          name: file.name,
          type: metadata.type,
          file_path: uploadData.path,
          file_size: file.size,
          mime_type: file.type,
          owner: metadata.owner,
          upload_date: metadata.date
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error uploading document:', error)
      throw error
    }
  }

  const getDocuments = async (enterpriseId: string) => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('enterprise_id', enterpriseId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching documents:', error)
      return []
    }
  }

  const deleteDocument = async (documentId: string) => {
    try {
      // Récupérer le document pour obtenir le chemin du fichier
      const { data: document } = await supabase
        .from('documents')
        .select('file_path')
        .eq('id', documentId)
        .single()

      if (document) {
        // Supprimer le fichier du storage
        await supabase.storage
          .from('documents')
          .remove([document.file_path])
      }

      // Supprimer l'enregistrement de la base
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting document:', error)
      throw error
    }
  }

  // Fonctions pour le blanchiment
  const saveBlanchimentOperations = async (enterpriseId: string, operations: any[]) => {
    try {
      const operationsToUpsert = operations
        .filter(op => !op.markedForDeletion)
        .map(op => ({
          id: op.id.startsWith('temp_') ? undefined : op.id,
          enterprise_id: enterpriseId,
          status: op.statut,
          date_received: op.dateRecu,
          date_returned: op.dateRendu || null,
          groupe: op.groupe,
          employee: op.employe,
          donneur: op.donneur,
          recep: op.recep,
          amount: op.somme,
          perc_entreprise: op.percEntreprise,
          perc_groupe: op.percGroupe
        }))

      const { data, error } = await supabase
        .from('blanchiment_operations')
        .upsert(operationsToUpsert)

      if (error) throw error

      // Supprimer les opérations marquées pour suppression
      const operationsToDelete = operations
        .filter(op => op.markedForDeletion && !op.id.startsWith('temp_'))
        .map(op => op.id)

      if (operationsToDelete.length > 0) {
        await supabase
          .from('blanchiment_operations')
          .delete()
          .in('id', operationsToDelete)
      }

      return data
    } catch (error) {
      console.error('Error saving blanchiment operations:', error)
      throw error
    }
  }

  const getBlanchimentOperations = async (enterpriseId: string) => {
    try {
      const { data, error } = await supabase
        .from('blanchiment_operations')
        .select('*')
        .eq('enterprise_id', enterpriseId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching blanchiment operations:', error)
      return []
    }
  }

  // Fonctions pour les archives
  const archiveReport = async (enterpriseId: string, reportData: any) => {
    try {
      const numero = `${reportData.type.toUpperCase()}-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
      
      const { data, error } = await supabase
        .from('archives')
        .insert({
          enterprise_id: enterpriseId,
          numero,
          date: new Date().toISOString().split('T')[0],
          amount: reportData.totalAmount,
          description: reportData.description,
          type: reportData.type,
          payload: reportData,
          created_by: user?.username || 'unknown'
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error archiving report:', error)
      throw error
    }
  }

  const getArchives = async (enterpriseId: string) => {
    try {
      const { data, error } = await supabase
        .from('archives')
        .select('*')
        .eq('enterprise_id', enterpriseId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching archives:', error)
      return []
    }
  }

  const updateArchiveStatus = async (archiveId: string, status: string) => {
    try {
      const { data, error } = await supabase
        .from('archives')
        .update({ status })
        .eq('id', archiveId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating archive status:', error)
      throw error
    }
  }

  const updateArchive = async (archiveId: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('archives')
        .update(updates)
        .eq('id', archiveId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating archive:', error)
      throw error
    }
  }

  const deleteArchive = async (archiveId: string) => {
    try {
      const { error } = await supabase
        .from('archives')
        .delete()
        .eq('id', archiveId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting archive:', error)
      throw error
    }
  }

  // Fonctions pour l'administration système
  const createTaxBracket = async (bracket: any) => {
    try {
      const { data, error } = await supabase
        .from('tax_brackets')
        .insert(bracket)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating tax bracket:', error)
      throw error
    }
  }

  const updateTaxBracket = async (bracketId: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('tax_brackets')
        .update(updates)
        .eq('id', bracketId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating tax bracket:', error)
      throw error
    }
  }

  const deleteTaxBracket = async (bracketId: string) => {
    try {
      const { error } = await supabase
        .from('tax_brackets')
        .delete()
        .eq('id', bracketId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting tax bracket:', error)
      throw error
    }
  }

  const updateEnterpriseBlanchimentStatus = async (enterpriseId: string, enabled: boolean) => {
    try {
      const { data, error } = await supabase
        .from('enterprises')
        .update({ 
          settings: { blanchiment_enabled: enabled },
          updated_at: new Date().toISOString()
        })
        .eq('id', enterpriseId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating blanchiment status:', error)
      throw error
    }
  }

  const getSystemUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('system_users')
        .select('*')
        .order('last_login', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching system users:', error)
      return []
    }
  }

  // Nouvelles fonctions pour les qualifications
  const getQualifications = async (enterpriseId: string) => {
    try {
      const { data, error } = await supabase
        .from('qualifications')
        .select('*')
        .eq('enterprise_id', enterpriseId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching qualifications:', error)
      return []
    }
  }

  const createQualification = async (qualificationData: any) => {
    try {
      const { data, error } = await supabase
        .from('qualifications')
        .insert(qualificationData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating qualification:', error)
      throw error
    }
  }

  const deleteQualification = async (qualificationId: string) => {
    try {
      const { error } = await supabase
        .from('qualifications')
        .delete()
        .eq('id', qualificationId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting qualification:', error)
      throw error
    }
  }

  const getEmployeeQualifications = async (enterpriseId: string) => {
    try {
      const { data, error } = await supabase
        .from('employee_qualifications')
        .select(`
          *,
          qualifications (*)
        `)
        .eq('enterprise_id', enterpriseId)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching employee qualifications:', error)
      return []
    }
  }

  const assignQualification = async (assignmentData: any) => {
    try {
      const { data, error } = await supabase
        .from('employee_qualifications')
        .insert(assignmentData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error assigning qualification:', error)
      throw error
    }
  }

  const revokeQualification = async (employeeId: string, qualificationId: string) => {
    try {
      const { error } = await supabase
        .from('employee_qualifications')
        .update({ status: 'revoked' })
        .eq('employee_id', employeeId)
        .eq('qualification_id', qualificationId)

      if (error) throw error
    } catch (error) {
      console.error('Error revoking qualification:', error)
      throw error
    }
  }

  // Fonctions pour la comptabilité
  const getTransactions = async (enterpriseId: string) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('enterprise_id', enterpriseId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching transactions:', error)
      return []
    }
  }

  const createTransaction = async (transactionData: any) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating transaction:', error)
      throw error
    }
  }

  const updateTransaction = async (transactionId: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', transactionId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating transaction:', error)
      throw error
    }
  }

  const deleteTransaction = async (transactionId: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting transaction:', error)
      throw error
    }
  }

  const getAccountingPeriods = async (enterpriseId: string) => {
    try {
      const { data, error } = await supabase
        .from('accounting_periods')
        .select('*')
        .eq('enterprise_id', enterpriseId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching accounting periods:', error)
      return []
    }
  }

  const createAccountingPeriod = async (periodData: any) => {
    try {
      const { data, error } = await supabase
        .from('accounting_periods')
        .insert(periodData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating accounting period:', error)
      throw error
    }
  }

  // Fonctions pour les périodes de paie
  const getPayrollPeriods = async (enterpriseId: string) => {
    try {
      const { data, error } = await supabase
        .from('payroll_periods')
        .select('*')
        .eq('enterprise_id', enterpriseId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching payroll periods:', error)
      return []
    }
  }

  const createPayrollPeriod = async (payrollData: any) => {
    try {
      const { data, error } = await supabase
        .from('payroll_periods')
        .insert(payrollData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating payroll period:', error)
      throw error
    }
  }

  // Fonctions pour les simulations fiscales
  const getTaxSimulations = async (enterpriseId: string) => {
    try {
      const { data, error } = await supabase
        .from('tax_simulations')
        .select('*')
        .eq('enterprise_id', enterpriseId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching tax simulations:', error)
      return []
    }
  }

  // Fonctions pour les lignes de dotation
  const getDotationLines = async (dotationId: string) => {
    try {
      const { data, error } = await supabase
        .from('dotation_lines')
        .select('*')
        .eq('dotation_id', dotationId)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching dotation lines:', error)
      return []
    }
  }

  const getDotationExpenses = async (dotationId: string) => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('dotation_id', dotationId)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching dotation expenses:', error)
      return []
    }
  }

  const getDotationWithdrawals = async (dotationId: string) => {
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('dotation_id', dotationId)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching dotation withdrawals:', error)
      return []
    }
  }

  const updateGrade = async (gradeId: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('grades')
        .update(updates)
        .eq('id', gradeId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating grade:', error)
      throw error
    }
  }

  const getEnterprise = async (enterpriseId: string) => {
    try {
      const { data, error } = await supabase
        .from('enterprises')
        .select('*')
        .eq('id', enterpriseId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching enterprise:', error)
      return null
    }
  }

  const updateEnterpriseSettings = async (enterpriseId: string, settings: any) => {
    try {
      const { data, error } = await supabase
        .from('enterprises')
        .update({ settings })
        .eq('id', enterpriseId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating enterprise settings:', error)
      throw error
    }
  }

  const getDocumentUrl = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 3600) // 1 heure

      if (error) throw error
      return data.signedUrl
    } catch (error) {
      console.error('Error getting document URL:', error)
      throw error
    }
  }

  return {
    isConnected,
    getAllEnterprises,
    createEnterprise,
    updateEnterprise,
    deleteEnterprise,
    getEmployees,
    createEmployee,
    getGrades,
    createGrade,
    createDotation,
    getDotations,
    saveDotationLines,
    saveExpenses,
    saveWithdrawals,
    saveTaxSimulation,
    getTaxBrackets,
    uploadDocument,
    getDocuments,
    deleteDocument,
    saveBlanchimentOperations,
    getBlanchimentOperations,
    archiveReport,
    getArchives,
    updateArchiveStatus,
    updateArchive,
    deleteArchive,
    createTaxBracket,
    updateTaxBracket,
    deleteTaxBracket,
    updateEnterpriseBlanchimentStatus,
    getSystemUsers,
    getQualifications,
    createQualification,
    deleteQualification,
    getEmployeeQualifications,
    assignQualification,
    revokeQualification,
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getAccountingPeriods,
    createAccountingPeriod,
    getPayrollPeriods,
    createPayrollPeriod,
    getTaxSimulations,
    getDotationLines,
    getDotationExpenses,
    getDotationWithdrawals,
    updateGrade,
    getEnterprise,
    updateEnterpriseSettings,
    getDocumentUrl
  }
}