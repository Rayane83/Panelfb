import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/button'
import { getCurrentWeek } from '../../lib/utils'
import { Badge } from '../ui/badge'
import { LogOut, User, Settings, Server } from 'lucide-react'

export function Header() {
  const { user, logout, isAuthenticated } = useAuth()

  if (!isAuthenticated) return null

  const roleColors = {
    employee: 'bg-gray-500',
    co_patron: 'bg-orange-500',
    patron: 'bg-red-500',
    dot: 'bg-blue-500',
    staff: 'bg-purple-500',
    superadmin: 'bg-indigo-600'
  }

  const roleLabels = {
    employee: 'Employé',
    co_patron: 'Co-Patron',
    patron: 'Patron',
    dot: 'DOT',
    staff: 'Staff',
    superadmin: 'SuperAdmin'
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Server className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold">Discord Enterprise</h1>
            </div>
            <Badge variant="outline" className="hidden sm:inline-flex">
              {getCurrentWeek()} • {user?.currentGuild?.name || 'No Guild'}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="font-medium hidden sm:inline">{user?.username}</span>
              <Badge className={`${roleColors[user?.role || 'employee']} text-white`}>
                {roleLabels[user?.role || 'employee']}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={logout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}