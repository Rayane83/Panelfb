export interface Enterprise {
  id: string
  name: string
  type: string
  description?: string
  guildId: string
  ownerId: string
  settings: EnterpriseSettings
  employees: Employee[]
  createdAt: Date
  updatedAt: Date
}

export interface EnterpriseSettings {
  salaryConfig: SalaryConfig
  taxConfig: TaxConfig
  blanchimentConfig: BlanchimentConfig
  grades: Grade[]
}

export interface SalaryConfig {
  basePercentage: number
  bonusBase: number
  calculationMode: 'RUN' | 'FACTURE' | 'VENTE' | 'CA_TOTAL'
  parameters: SalaryParameter[]
}

export interface SalaryParameter {
  id: string
  name: string
  type: 'RUN' | 'FACTURE' | 'VENTE' | 'CA_TOTAL' | 'GRADE' | 'HEURE_SERVICE'
  active: boolean
  cumulative: boolean
  tiers: SalaryTier[]
}

export interface SalaryTier {
  min: number
  max: number
  percentage: number
}

export interface Grade {
  id: string
  name: string
  discordRoleId: string
  caPercentage: number
  hourlyRate: number
  hierarchy: number
}

export interface Employee {
  id: string
  discordId: string
  username: string
  gradeId: string
  qualifications: string[]
  hireDate: Date
  salary?: number
}

export interface TaxConfig {
  brackets: TaxBracket[]
  defaultRate: number
}

export interface TaxBracket {
  min: number
  max: number | null
  rate: number
}

export interface BlanchimentConfig {
  enabled: boolean
  threshold: number
  maxAmount: number
  cooldownHours: number
  percEntreprise: number
  percGroupe: number
}

export interface DotationReport {
  id: string
  enterpriseId: string
  period: string
  employees: DotationEmployee[]
  expenses: Expense[]
  withdrawals: Withdrawal[]
  totalCA: number
  totalSalaries: number
  totalBonuses: number
  status: 'Brouillon' | 'Validé' | 'Payé'
  createdBy: string
  createdAt: Date
}

export interface DotationEmployee {
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

export interface Expense {
  id: string
  date: string
  justificatif: string
  montant: number
  category?: string
}

export interface Withdrawal {
  id: string
  date: string
  justificatif: string
  montant: number
}

export interface TaxSimulation {
  id: string
  enterpriseId: string
  baseAmount: number
  period: string
  taxType: string
  calculatedTax: number
  effectiveRate: number
  brackets: TaxBracketCalculation[]
  createdBy: string
  createdAt: Date
}

export interface TaxBracketCalculation {
  bracket: TaxBracket
  taxOnBracket: number
}

export interface BlanchimentOperation {
  id: string
  enterpriseId: string
  statut: 'En cours' | 'Terminé' | 'Annulé'
  dateRecu: string
  dateRendu?: string
  duree: number
  groupe?: string
  employe?: string
  donneur?: string
  recep?: string
  somme: number
  percEntreprise: number
  percGroupe: number
  isTemporary?: boolean
  markedForDeletion?: boolean
}

export interface Document {
  id: string
  enterpriseId: string
  name: string
  type: 'facture' | 'diplome'
  filePath: string
  fileSize: number
  mimeType: string
  owner: string
  uploadDate: Date
  tags?: string[]
  preview?: string
}

export interface Archive {
  id: string
  enterpriseId: string
  numero: string
  date: string
  amount: number
  description: string
  status: 'En attente' | 'Validé' | 'Refusé'
  type: string
  payload: any
  createdBy: string
  createdAt: Date
}