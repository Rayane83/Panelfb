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
    // Simulation d'entreprises
    return [
      {
        id: '1',
        name: 'Tech Corp',
        guild_id: '1404608015230832742',
        type: 'SARL',
        description: 'Entreprise technologique',
        owner_discord_id: '462716512252329996',
        blanchiment_enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Service Plus',
        guild_id: '1404608015230832742',
        type: 'SAS',
        description: 'Services aux entreprises',
        owner_discord_id: '123456789',
        blanchiment_enabled: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  }

  const createEnterprise = async (enterpriseData: any) => {
    // Simulation de création d'entreprise
    const newEnterprise = {
      id: Date.now().toString(),
      ...enterpriseData,
      blanchiment_enabled: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    return newEnterprise
  }

  // Fonctions pour les employés
  const getEmployees = async (enterpriseId: string) => {
    // Simulation d'employés
    return [
      {
        id: '1',
        enterprise_id: enterpriseId,
        discord_id: '123456789',
        username: 'Jean Dupont',
        grade_id: '1',
        qualifications: ['Expert Comptabilité'],
        hire_date: '2024-01-15',
        status: 'Actif',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  }

  const createEmployee = async (employeeData: any) => {
    const { data, error } = await supabase
      .from('employees')
      .insert(employeeData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Fonctions pour les dotations
  const createDotation = async (enterpriseId: string, period: string) => {
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
  }

  const getDotations = async (enterpriseId: string) => {
    // Simulation de dotations
    return [
      {
        id: '1',
        enterprise_id: enterpriseId,
        period: '2024-01',
        total_ca: 50000,
        total_salaries: 15000,
        total_bonuses: 5000,
        status: 'Brouillon',
        created_by: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        dotation_lines: [],
        expenses: [],
        withdrawals: []
      }
    ]
  }

  const saveDotationLines = async (dotationId: string, lines: any[]) => {
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
  }

  const saveExpenses = async (dotationId: string, expenses: any[]) => {
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
  }

  const saveWithdrawals = async (dotationId: string, withdrawals: any[]) => {
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
  }

  // Fonctions pour les simulations fiscales
  const saveTaxSimulation = async (enterpriseId: string, simulation: any) => {
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
  }

  const getTaxBrackets = async (type: string) => {
    // Simulation de tranches fiscales
    return [
      { id: '1', type, min_amount: 0, max_amount: 42500, rate: 15, created_at: new Date().toISOString() },
      { id: '2', type, min_amount: 42500, max_amount: 250000, rate: 25, created_at: new Date().toISOString() },
      { id: '3', type, min_amount: 250000, max_amount: null, rate: 31, created_at: new Date().toISOString() }
    ]
  }

  // Fonctions pour les documents
  const uploadDocument = async (file: File, metadata: any) => {
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
  }

  const getDocuments = async (enterpriseId: string) => {
    // Simulation de documents
    return [
      {
        id: '1',
        enterprise_id: enterpriseId,
        name: 'Facture_Janvier_2024.pdf',
        type: 'facture',
        file_path: 'documents/facture1.pdf',
        file_size: 2048000,
        mime_type: 'application/pdf',
        owner: 'Jean Dupont',
        upload_date: '2024-01-15',
        created_at: new Date().toISOString()
      }
    ]
  }

  const deleteDocument = async (documentId: string) => {
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
  }

  // Fonctions pour le blanchiment
  const saveBlanchimentOperations = async (enterpriseId: string, operations: any[]) => {
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
  }

  const getBlanchimentOperations = async (enterpriseId: string) => {
    // Simulation d'opérations de blanchiment
    return [
      {
        id: '1',
        enterprise_id: enterpriseId,
        status: 'En cours',
        date_received: '2024-01-15',
        date_returned: null,
        duration_days: null,
        groupe: 'Groupe A',
        employee: 'Jean Dupont',
        donneur: 'Client X',
        recep: 'Destinataire Y',
        amount: 25000,
        perc_entreprise: 15,
        perc_groupe: 10,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  }

  // Fonctions pour les archives
  const archiveReport = async (enterpriseId: string, reportData: any) => {
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
  }

  const getArchives = async (enterpriseId: string) => {
    // Simulation d'archives
    return [
      {
        id: '1',
        enterprise_id: enterpriseId,
        numero: 'DOT-2024-001',
        date: '2024-01-15',
        amount: 25000,
        description: 'Rapport dotation Q1 2024',
        status: 'Validé',
        type: 'dotation',
        payload: { employees: 5, totalCA: 125000 },
        created_by: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  }

  const updateArchiveStatus = async (archiveId: string, status: string) => {
    const { data, error } = await supabase
      .from('archives')
      .update({ status })
      .eq('id', archiveId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  const updateArchive = async (archiveId: string, updates: any) => {
    const { data, error } = await supabase
      .from('archives')
      .update(updates)
      .eq('id', archiveId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  const deleteArchive = async (archiveId: string) => {
    const { error } = await supabase
      .from('archives')
      .delete()
      .eq('id', archiveId)

    if (error) throw error
  }

  // Fonctions pour l'administration système
  const createTaxBracket = async (bracket: any) => {
    const { data, error } = await supabase
      .from('tax_brackets')
      .insert(bracket)
      .select()
      .single()

    if (error) throw error
    return data
  }

  const updateTaxBracket = async (bracketId: string, updates: any) => {
    const { data, error } = await supabase
      .from('tax_brackets')
      .update(updates)
      .eq('id', bracketId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  const deleteTaxBracket = async (bracketId: string) => {
    const { error } = await supabase
      .from('tax_brackets')
      .delete()
      .eq('id', bracketId)

    if (error) throw error
  }

  const updateEnterpriseStatus = async (enterpriseId: string, status: string) => {
    const { data, error } = await supabase
      .from('enterprises')
      .update({ status })
      .eq('id', enterpriseId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  const getSystemUsers = async () => {
    // Cette fonction devrait récupérer les utilisateurs depuis une table users
    // Pour l'instant, on retourne des données mockées
    return [
      {
        id: '1',
        discord_id: '462716512252329996',
        username: 'Fondateur',
        role: 'superadmin',
        role_level: 7,
        last_login: new Date().toISOString(),
        active: true
      }
    ]
  }

  return {
    isConnected,
    getAllEnterprises,
    createEnterprise,
    getEmployees,
    createEmployee,
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
    updateEnterpriseStatus,
    getSystemUsers
  }
}