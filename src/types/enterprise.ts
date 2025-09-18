export interface Enterprise {
  id: string
  name: string
  type: string
  description: string
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
  max: number
  rate: number
}

export interface BlanchimentConfig {
  enabled: boolean
  threshold: number
  maxAmount: number
  cooldownHours: number
}