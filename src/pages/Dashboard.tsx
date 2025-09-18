import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { usePermissions } from '../hooks/usePermissions'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { DashboardTab } from '../components/dashboard/DashboardTab'
import { DotationsTab } from '../components/dashboard/DotationsTab'
import { ImpotsTab } from '../components/dashboard/ImpotsTab'
import { DocumentsTab } from '../components/dashboard/DocumentsTab'
import { BlanchimentTab } from '../components/dashboard/BlanchimentTab'
import { ArchivesTab } from '../components/dashboard/ArchivesTab'
import { ComptabiliteTab } from '../components/dashboard/ComptabiliteTab'
import { SalairesTab } from '../components/dashboard/SalairesTab'
import { QualificationsTab } from '../components/dashboard/QualificationsTab'
import { ConfigStaffTab } from '../components/dashboard/ConfigStaffTab'
import { 
  LayoutDashboard, 
  FileText, 
  Calculator, 
  Receipt, 
  Shuffle, 
  Archive, 
  TrendingUp, 
  Users, 
  Award, 
  Settings 
} from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const { hasPermission } = usePermissions()
  const [activeTab, setActiveTab] = useState('dashboard')

  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      component: DashboardTab,
      permission: 'dashboard'
    },
    {
      id: 'dotations',
      label: 'Dotations',
      icon: FileText,
      component: DotationsTab,
      permission: 'dotations'
    },
    {
      id: 'impots',
      label: 'Impôts',
      icon: Calculator,
      component: ImpotsTab,
      permission: 'impots'
    },
    {
      id: 'documents',
      label: 'Factures/Diplômes',
      icon: Receipt,
      component: DocumentsTab,
      permission: 'documents'
    },
    {
      id: 'blanchiment',
      label: 'Blanchiment',
      icon: Shuffle,
      component: BlanchimentTab,
      permission: 'blanchiment'
    },
    {
      id: 'archives',
      label: 'Archives',
      icon: Archive,
      component: ArchivesTab,
      permission: 'archives'
    },
    {
      id: 'comptabilite',
      label: 'Comptabilité',
      icon: TrendingUp,
      component: ComptabiliteTab,
      permission: 'comptabilite'
    },
    {
      id: 'salaires',
      label: 'Salaires',
      icon: Users,
      component: SalairesTab,
      permission: 'salaires'
    },
    {
      id: 'qualifications',
      label: 'Qualifications',
      icon: Award,
      component: QualificationsTab,
      permission: 'qualifications'
    },
    {
      id: 'config',
      label: 'Config',
      icon: Settings,
      component: ConfigStaffTab,
      permission: 'config_staff'
    }
  ]

  const availableTabs = tabs.filter(tab => hasPermission(tab.permission))

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 mb-6">
          {availableTabs.map((tab) => {
            const Icon = tab.icon
            return (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="flex items-center space-x-2 text-xs lg:text-sm"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {availableTabs.map((tab) => {
          const Component = tab.component
          return (
            <TabsContent key={tab.id} value={tab.id} className="mt-0">
              <Component />
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}