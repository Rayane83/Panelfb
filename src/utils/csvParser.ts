// Utilitaires pour parser et traiter les données collées depuis Excel/CSV

export interface ParsedRow {
  [key: string]: string | number
}

export function parseCSVData(text: string, expectedColumns: string[]): ParsedRow[] {
  if (!text.trim()) return []

  const lines = text.trim().split('\n')
  const results: ParsedRow[] = []

  for (const line of lines) {
    // Détecter le séparateur (tab, virgule, point-virgule)
    const separators = ['\t', ';', ',']
    let separator = '\t'
    let maxParts = 0

    for (const sep of separators) {
      const parts = line.split(sep)
      if (parts.length > maxParts) {
        maxParts = parts.length
        separator = sep
      }
    }

    const parts = line.split(separator).map(p => p.trim())
    
    if (parts.length >= expectedColumns.length) {
      const row: ParsedRow = {}
      
      expectedColumns.forEach((col, index) => {
        if (index < parts.length) {
          const value = parts[index]
          
          // Essayer de convertir en nombre si c'est numérique
          if (col !== 'nom' && col !== 'grade' && col !== 'justificatif' && col !== 'description') {
            const numValue = parseFloat(value.replace(',', '.'))
            row[col] = isNaN(numValue) ? 0 : numValue
          } else {
            row[col] = value
          }
        }
      })
      
      results.push(row)
    }
  }

  return results
}

export function parseDotationData(text: string): any[] {
  const expectedColumns = ['nom', 'run', 'facture', 'vente']
  const parsed = parseCSVData(text, expectedColumns)
  
  return parsed.map(row => ({
    nom: row.nom as string,
    grade: 'Junior', // Grade par défaut
    run: row.run as number,
    facture: row.facture as number,
    vente: row.vente as number,
    caTotal: (row.run as number) + (row.facture as number) + (row.vente as number),
    salaire: calculateSalary((row.run as number) + (row.facture as number) + (row.vente as number), 'Junior'),
    prime: calculatePrime((row.run as number) + (row.facture as number) + (row.vente as number), 'Junior')
  }))
}

export function parseExpenseData(text: string): any[] {
  const expectedColumns = ['date', 'justificatif', 'montant']
  const parsed = parseCSVData(text, expectedColumns)
  
  return parsed.map(row => ({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    date: formatDateForInput(row.date as string),
    justificatif: row.justificatif as string,
    montant: row.montant as number
  }))
}

export function parseBlanchimentData(text: string): any[] {
  const expectedColumns = ['statut', 'dateRecu', 'dateRendu', 'groupe', 'employe', 'donneur', 'recep', 'somme']
  const parsed = parseCSVData(text, expectedColumns)
  
  return parsed.map(row => ({
    id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    statut: row.statut as string || 'En cours',
    dateRecu: formatDateForInput(row.dateRecu as string),
    dateRendu: formatDateForInput(row.dateRendu as string),
    duree: calculateDuration(row.dateRecu as string, row.dateRendu as string),
    groupe: row.groupe as string,
    employe: row.employe as string,
    donneur: row.donneur as string,
    recep: row.recep as string,
    somme: row.somme as number,
    percEntreprise: 15, // Valeur par défaut
    percGroupe: 10, // Valeur par défaut
    isTemporary: true
  }))
}

function calculateSalary(caTotal: number, grade: string): number {
  const baseRates = { 'Junior': 2500, 'Senior': 3500, 'Manager': 4500, 'Director': 6000 }
  return baseRates[grade as keyof typeof baseRates] || 2500
}

function calculatePrime(caTotal: number, grade: string): number {
  const primeRates = { 'Junior': 0.05, 'Senior': 0.08, 'Manager': 0.12, 'Director': 0.15 }
  return Math.round(caTotal * (primeRates[grade as keyof typeof primeRates] || 0.05))
}

function formatDateForInput(dateStr: string): string {
  if (!dateStr) return ''
  
  // Essayer différents formats de date
  const formats = [
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // DD/MM/YYYY
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // DD-MM-YYYY
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // YYYY-MM-DD
  ]
  
  for (const format of formats) {
    const match = dateStr.match(format)
    if (match) {
      if (format === formats[2]) {
        // YYYY-MM-DD format
        return dateStr
      } else {
        // DD/MM/YYYY ou DD-MM-YYYY format
        const [, day, month, year] = match
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      }
    }
  }
  
  return ''
}

function calculateDuration(dateRecu: string, dateRendu: string): number {
  if (!dateRecu || !dateRendu) return 0
  
  const recu = new Date(formatDateForInput(dateRecu))
  const rendu = new Date(formatDateForInput(dateRendu))
  
  if (isNaN(recu.getTime()) || isNaN(rendu.getTime())) return 0
  
  const diffTime = rendu.getTime() - recu.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return Math.max(0, diffDays)
}

// Fonction pour exporter en CSV
export function exportToCSV(data: any[], filename: string): void {
  if (data.length === 0) return

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(';'),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        if (typeof value === 'string' && value.includes(';')) {
          return `"${value}"`
        }
        return value
      }).join(';')
    )
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

// Fonction pour exporter en Excel (format CSV compatible Excel)
export function exportToExcel(data: any[], filename: string): void {
  exportToCSV(data, filename.replace('.xlsx', '.csv'))
}