import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Types générés depuis la base de données
export interface Database {
  public: {
    Tables: {
      enterprises: {
        Row: {
          id: string
          guild_id: string
          name: string
          type: string
          description: string | null
          owner_discord_id: string
          settings: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          guild_id: string
          name: string
          type?: string
          description?: string | null
          owner_discord_id: string
          settings?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          guild_id?: string
          name?: string
          type?: string
          description?: string | null
          owner_discord_id?: string
          settings?: any
          created_at?: string
          updated_at?: string
        }
      }
      dotations: {
        Row: {
          id: string
          enterprise_id: string
          period: string
          total_ca: number
          total_salaries: number
          total_bonuses: number
          status: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          enterprise_id: string
          period: string
          total_ca?: number
          total_salaries?: number
          total_bonuses?: number
          status?: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          enterprise_id?: string
          period?: string
          total_ca?: number
          total_salaries?: number
          total_bonuses?: number
          status?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      dotation_lines: {
        Row: {
          id: string
          dotation_id: string
          employee_name: string
          grade: string | null
          run_amount: number
          facture_amount: number
          vente_amount: number
          ca_total: number
          salary: number
          bonus: number
          created_at: string
        }
        Insert: {
          id?: string
          dotation_id: string
          employee_name: string
          grade?: string | null
          run_amount?: number
          facture_amount?: number
          vente_amount?: number
          salary?: number
          bonus?: number
          created_at?: string
        }
        Update: {
          id?: string
          dotation_id?: string
          employee_name?: string
          grade?: string | null
          run_amount?: number
          facture_amount?: number
          vente_amount?: number
          salary?: number
          bonus?: number
          created_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          dotation_id: string
          date: string
          description: string
          amount: number
          category: string
          created_at: string
        }
        Insert: {
          id?: string
          dotation_id: string
          date: string
          description: string
          amount: number
          category?: string
          created_at?: string
        }
        Update: {
          id?: string
          dotation_id?: string
          date?: string
          description?: string
          amount?: number
          category?: string
          created_at?: string
        }
      }
      withdrawals: {
        Row: {
          id: string
          dotation_id: string
          date: string
          description: string
          amount: number
          created_at: string
        }
        Insert: {
          id?: string
          dotation_id: string
          date: string
          description: string
          amount: number
          created_at?: string
        }
        Update: {
          id?: string
          dotation_id?: string
          date?: string
          description?: string
          amount?: number
          created_at?: string
        }
      }
      tax_simulations: {
        Row: {
          id: string
          enterprise_id: string
          base_amount: number
          period: string
          tax_type: string
          calculated_tax: number
          effective_rate: number
          details: any
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          enterprise_id: string
          base_amount: number
          period: string
          tax_type: string
          calculated_tax: number
          effective_rate: number
          details?: any
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          enterprise_id?: string
          base_amount?: number
          period?: string
          tax_type?: string
          calculated_tax?: number
          effective_rate?: number
          details?: any
          created_by?: string
          created_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          enterprise_id: string
          name: string
          type: 'facture' | 'diplome'
          file_path: string
          file_size: number
          mime_type: string
          owner: string
          upload_date: string
          created_at: string
        }
        Insert: {
          id?: string
          enterprise_id: string
          name: string
          type: 'facture' | 'diplome'
          file_path: string
          file_size: number
          mime_type: string
          owner: string
          upload_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          enterprise_id?: string
          name?: string
          type?: 'facture' | 'diplome'
          file_path?: string
          file_size?: number
          mime_type?: string
          owner?: string
          upload_date?: string
          created_at?: string
        }
      }
      blanchiment_operations: {
        Row: {
          id: string
          enterprise_id: string
          status: 'En cours' | 'Terminé' | 'Annulé'
          date_received: string
          date_returned: string | null
          duration_days: number | null
          groupe: string | null
          employee: string | null
          donneur: string | null
          recep: string | null
          amount: number
          perc_entreprise: number
          perc_groupe: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          enterprise_id: string
          status?: 'En cours' | 'Terminé' | 'Annulé'
          date_received: string
          date_returned?: string | null
          groupe?: string | null
          employee?: string | null
          donneur?: string | null
          recep?: string | null
          amount: number
          perc_entreprise?: number
          perc_groupe?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          enterprise_id?: string
          status?: 'En cours' | 'Terminé' | 'Annulé'
          date_received?: string
          date_returned?: string | null
          groupe?: string | null
          employee?: string | null
          donneur?: string | null
          recep?: string | null
          amount?: number
          perc_entreprise?: number
          perc_groupe?: number
          created_at?: string
          updated_at?: string
        }
      }
      archives: {
        Row: {
          id: string
          enterprise_id: string
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
        }
        Insert: {
          id?: string
          enterprise_id: string
          numero: string
          date: string
          amount: number
          description: string
          status?: 'En attente' | 'Validé' | 'Refusé'
          type: string
          payload?: any
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          enterprise_id?: string
          numero?: string
          date?: string
          amount?: number
          description?: string
          status?: 'En attente' | 'Validé' | 'Refusé'
          type?: string
          payload?: any
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      tax_brackets: {
        Row: {
          id: string
          type: string
          min_amount: number
          max_amount: number | null
          rate: number
          created_at: string
        }
        Insert: {
          id?: string
          type: string
          min_amount: number
          max_amount?: number | null
          rate: number
          created_at?: string
        }
        Update: {
          id?: string
          type?: string
          min_amount?: number
          max_amount?: number | null
          rate?: number
          created_at?: string
        }
      }
    }
  }
}