import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { useAuth } from '../../hooks/useAuth'
import { useSupabase } from '../../hooks/useSupabase'
import { getCurrentWeek, formatDate, formatCurrency } from '../../lib/utils'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { useState, useEffect } from 'react'
import { 
  Server, 
  Calendar, 
  User, 
  Building, 
  Activity, 
  TrendingUp, 
  Users, 
  Shield,
  DollarSign,
  FileText,
  Archive,
  Shuffle
  Calculator
} from 'lucide-react'

interface EnterpriseStats {
  id: string
  name: string
  employeeCount: number
  totalCA: number
  totalSalaries: number
  totalBonuses: number
  documentsCount: number
  archivesCount: number
  blanchimentCount: number
  lastActivity: string
  maxEmployeeSalary: number
  maxBossSalary: number
  maxEmployeeBonus: number
  maxBossBonus: number
  taxRate: number
  wealthTax: number
  netProfit: number
}

export function DashboardTab() {
  const { user } = useAuth()
  const supabaseHooks = useSupabase()
  const [selectedEnterprise, setSelectedEnterprise] = useState<string>('')
  const [enterpriseStats, setEnterpriseStats] = useState<EnterpriseStats[]>([])
  const [currentStats, setCurrentStats] = useState<EnterpriseStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isStaffOrSuperAdmin = user?.role === 'superviseur' || user?.role === 'superadmin'

  useEffect(() => {
    loadEnterpriseStats()
  }, [user])

  useEffect(() => {
    if (enterpriseStats.length > 0) {
      if (isStaffOrSuperAdmin) {
        // Pour staff/superadmin, sélectionner la première entreprise par défaut
        if (!selectedEnterprise) {
          setSelectedEnterprise(enterpriseStats[0].id)
        }
        const selected = enterpriseStats.find(e => e.id === selectedEnterprise)
        setCurrentStats(selected || enterpriseStats[0])
      } else {
        // Pour les autres, prendre leur entreprise
        const userEnterprise = enterpriseStats.find(e => 
          user?.enterprises?.some(ue => ue.id === e.id)
        )
        setCurrentStats(userEnterprise || null)
      }
    }
  }, [enterpriseStats, selectedEnterprise, isStaffOrSuperAdmin, user])

  const loadEnterpriseStats = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      let enterprises: any[] = []

      if (isStaffOrSuperAdmin) {
        // Staff/SuperAdmin voient toutes les entreprises
        enterprises = await supabaseHooks.getAllEnterprises()
      } else {
        // Autres utilisateurs voient leurs entreprises
        enterprises = user.enterprises || []
      }

      const stats: EnterpriseStats[] = []

      for (const enterprise of enterprises) {
        // Récupérer les statistiques pour chaque entreprise
        const [
          employees,
          dotations,
          documents,
          archives,
          blanchimentOps
        ] = await Promise.all([
          supabaseHooks.getEmployees(enterprise.id),
          supabaseHooks.getDotations(enterprise.id),
          supabaseHooks.getDocuments(enterprise.id),
          supabaseHooks.getArchives(enterprise.id),
          supabaseHooks.getBlanchimentOperations(enterprise.id)
        ])

        const latestDotation = dotations[0]
        const totalCA = latestDotation?.total_ca || 0
        const totalSalaries = latestDotation?.total_salaries || 0
        const totalBonuses = latestDotation?.total_bonuses || 0

        stats.push({
          id: enterprise.id,
          name: enterprise.name,
          employeeCount: employees.length,
          totalCA,
          totalSalaries,
          totalBonuses,
          documentsCount: documents.length,
          archivesCount: archives.length,
          blanchimentCount: blanchimentOps.length,
          lastActivity: enterprise.updated_at,
          maxEmployeeSalary: 0,
          maxBossSalary: 0,
          maxEmployeeBonus: 0,
          maxBossBonus: 0,
          taxRate: 0,
          wealthTax: 0,
          netProfit: totalCA - totalSalaries - totalBonuses
        })
      }

      setEnterpriseStats(stats)
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getAvatarUrl = () => {
    if (user?.avatar) {
      return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
    }
    return `https://cdn.discordapp.com/embed/avatars/${parseInt(user?.discriminator || '0') % 5}.png`
  }

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
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#5865F2] to-[#4752C4] p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-4">
            <img
              src={getAvatarUrl()}
              alt={user?.username}
              className="w-16 h-16 rounded-full ring-4 ring-white/20"
            />
            <div>
              <h1 className="text-3xl font-bold">
                Bienvenue, {user?.username} !
              </h1>
              <p className="text-white/80 text-lg">
                {isStaffOrSuperAdmin ? 'Administration Système' : 'Tableau de bord Entreprise'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
              {user?.currentGuild?.name || 'Aucune guilde'}
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
              Niveau {user?.roleLevel || 0}
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
              {formatDate(new Date())}
            </Badge>
          </div>
        </div>
      </div>

      {/* Enterprise selector for staff/superadmin */}
      {isStaffOrSuperAdmin && enterpriseStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sélection d'Entreprise</CardTitle>
            <CardDescription>
              Choisissez l'entreprise à afficher dans le tableau de bord
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {enterpriseStats.map((enterprise) => (
                <Button
                  key={enterprise.id}
                  variant={selectedEnterprise === enterprise.id ? "default" : "outline"}
                  className="justify-start h-auto p-4"
                  onClick={() => setSelectedEnterprise(enterprise.id)}
                >
                  <div className="text-left">
                    <p className="font-medium">{enterprise.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {enterprise.employeeCount} employés
                    </p>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enterprise stats */}
      {currentStats && (
        <>
          {/* Résumé fiscal */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5 text-primary" />
                <span>Résumé Fiscal et Salarial</span>
              </CardTitle>
              <CardDescription>
                Calculs basés sur les grilles configurées par SuperAdmin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {/* Limites salariales */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground">LIMITES SALARIALES</h4>
                  <div className="grid gap-3">
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">Salaire Maximum employé</span>
                      <span className="font-bold">{formatCurrency(currentStats.maxEmployeeSalary)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">Prime Maximum employé</span>
                      <span className="font-bold">{formatCurrency(currentStats.maxEmployeeBonus)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">Salaire Maximum patron</span>
                      <span className="font-bold">{formatCurrency(currentStats.maxBossSalary)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">Prime Maximum patron</span>
                      <span className="font-bold">{formatCurrency(currentStats.maxBossBonus)}</span>
                    </div>
                  </div>
                </div>

                {/* Calculs fiscaux */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground">CALCULS FISCAUX</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">CA Brut</th>
                          <th className="text-left p-2">Dépense Déductibles</th>
                          <th className="text-left p-2">Bénéfice</th>
                          <th className="text-left p-2">Taux d'imposition</th>
                          <th className="text-left p-2">Montant des impôts</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-2">{formatCurrency(currentStats.totalCA)}</td>
                          <td className="p-2">{formatCurrency(0)}</td>
                          <td className="p-2">{formatCurrency(currentStats.netProfit)}</td>
                          <td className="p-2">{currentStats.taxRate}%</td>
                          <td className="p-2">{formatCurrency(currentStats.netProfit * (currentStats.taxRate / 100))}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Bénéfice après Impôt</th>
                          <th className="text-left p-2">Montant total des primes</th>
                          <th className="text-left p-2">Bénéfice après primes</th>
                          <th className="text-left p-2">Impôt sur la richesse</th>
                          <th className="text-left p-2">Relevé du compte bancaire</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-2">{formatCurrency(currentStats.netProfit * (1 - currentStats.taxRate / 100))}</td>
                          <td className="p-2">{formatCurrency(currentStats.totalBonuses)}</td>
                          <td className="p-2">{formatCurrency(currentStats.netProfit * (1 - currentStats.taxRate / 100) - currentStats.totalBonuses)}</td>
                          <td className="p-2">{currentStats.wealthTax}%</td>
                          <td className="p-2">{formatCurrency(currentStats.netProfit * (1 - currentStats.taxRate / 100) - currentStats.totalBonuses - currentStats.totalSalaries)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="card-hover border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{formatCurrency(currentStats.totalCA)}</div>
                    <p className="text-sm text-muted-foreground">CA Total</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Chiffre d'affaires</p>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{currentStats.employeeCount}</div>
                    <p className="text-sm text-muted-foreground">Employés</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Effectif actuel</p>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 shadow-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{formatCurrency(currentStats.totalSalaries)}</div>
                    <p className="text-sm text-muted-foreground">Salaires</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Masse salariale</p>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 shadow-lg">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{formatCurrency(currentStats.totalBonuses)}</div>
                    <p className="text-sm text-muted-foreground">Primes</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Total primes</p>
              </CardContent>
            </Card>
          </div>

          {/* Additional stats */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span>Documents</span>
                </CardTitle>
                <CardDescription>
                  Factures et diplômes stockés
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{currentStats.documentsCount}</div>
                <p className="text-sm text-muted-foreground">Fichiers uploadés</p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Archive className="h-5 w-5 text-primary" />
                  <span>Archives</span>
                </CardTitle>
                <CardDescription>
                  Rapports archivés
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{currentStats.archivesCount}</div>
                <p className="text-sm text-muted-foreground">Éléments archivés</p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shuffle className="h-5 w-5 text-primary" />
                  <span>Blanchiment</span>
                </CardTitle>
                <CardDescription>
                  Opérations de blanchiment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{currentStats.blanchimentCount}</div>
                <p className="text-sm text-muted-foreground">Opérations enregistrées</p>
              </CardContent>
            </Card>
          </div>

          {/* Enterprise info */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5 text-primary" />
                <span>Informations Entreprise</span>
              </CardTitle>
              <CardDescription>
                Détails de l'entreprise sélectionnée
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">Nom:</span>
                    <Badge variant="outline" className="font-mono">
                      {currentStats.name}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">Employés:</span>
                    <span className="text-sm font-bold">{currentStats.employeeCount}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">Dernière activité:</span>
                    <span className="text-sm">{formatDate(new Date(currentStats.lastActivity))}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">Semaine ISO:</span>
                    <Badge variant="outline">{getCurrentWeek()}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* No enterprise message */}
      {!currentStats && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Aucune entreprise trouvée
            </h3>
            <p className="text-sm text-muted-foreground">
              {isStaffOrSuperAdmin 
                ? 'Aucune entreprise n\'est encore enregistrée dans le système.'
                : 'Vous n\'êtes associé à aucune entreprise pour le moment.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}