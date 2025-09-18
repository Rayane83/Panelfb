import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { usePermissions } from '../hooks/usePermissions'
import { useAuth } from '../hooks/useAuth'
import { DashboardTab } from '../components/dashboard/DashboardTab'
import { DotationsTab } from '../components/dashboard/DotationsTab'
import { ImpotsTab } from '../components/dashboard/ImpotsTab'
import { BlanchimentTab } from '../components/dashboard/BlanchimentTab'
import { ArchivesTab } from '../components/dashboard/ArchivesTab'
import { DocumentsTab } from '../components/dashboard/DocumentsTab'
import { ComptabiliteTab } from '../components/dashboard/ComptabiliteTab'
import { SalairesTab } from '../components/dashboard/SalairesTab'
import { QualificationsTab } from '../components/dashboard/QualificationsTab'
import { ConfigStaffTab } from '../components/dashboard/ConfigStaffTab'
import { 
  BarChart3, 
  DollarSign, 
  Receipt, 
  Shuffle, 
  Archive, 
  FileText, 
  Calculator, 
  Users, 
  Award, 
  Settings 
} from 'lucide-react'

const TAB_CONFIGS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: BarChart3,
    permission: 'dashboard' as const,
    component: DashboardTab
  },
  {
    key: 'dotations',
    label: 'Dotations',
    icon: DollarSign,
    permission: 'dotations' as const,
    component: DotationsTab
  },
  {
    key: 'impots',
    label: 'Impôts',
    icon: Receipt,
    permission: 'impots' as const,
    component: ImpotsTab
  },
  {
    key: 'blanchiment',
    label: 'Blanchiment',
    icon: Shuffle,
    permission: 'blanchiment' as const,
    component: BlanchimentTab
  },
  {
    key: 'archives',
    label: 'Archives',
    icon: Archive,
    permission: 'archives' as const,
    component: ArchivesTab
  },
  {
    key: 'documents',
    label: 'Documents',
    icon: FileText,
    permission: 'documents' as const,
    component: DocumentsTab
  },
  {
    key: 'comptabilite',
    label: 'Comptabilité',
    icon: Calculator,
    permission: 'comptabilite' as const,
    component: ComptabiliteTab
  },
  {
    key: 'salaires',
    label: 'Salaires',
    icon: Users,
    permission: 'salaires' as const,
    component: SalairesTab
  },
  {
    key: 'qualifications',
    label: 'Qualifications',
    icon: Award,
    permission: 'qualifications' as const,
    component: QualificationsTab
  },
  {
    key: 'config_staff',
    label: 'Config Staff',
    icon: Settings,
    permission: 'config_staff' as const,
    component: ConfigStaffTab
  }
]

export function Dashboard() {
  const { hasPermission } = usePermissions()
  const { user } = useAuth()

  const availableTabs = TAB_CONFIGS.filter(tab => hasPermission(tab.permission))

  if (availableTabs.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-muted-foreground">Aucun accès disponible</h2>
          <p className="text-muted-foreground mt-2">
            Votre rôle ({user?.role}) n'a accès à aucune fonctionnalité.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Tabs defaultValue={availableTabs[0]?.key} className="space-y-6">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-flow-col auto-cols-fr min-w-max">
            {availableTabs.map((tab) => {
              const Icon = tab.icon
              return (
                <TabsTrigger 
                  key={tab.key} 
                  value={tab.key}
                  className="flex items-center space-x-2 min-w-0"
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>
        
        {availableTabs.map((tab) => {
          const Component = tab.component
          return (
            <TabsContent key={tab.key} value={tab.key}>
              <Component />
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}