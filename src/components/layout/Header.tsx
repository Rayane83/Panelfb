import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/button'
import { getCurrentWeek } from '../../lib/utils'
import { Badge } from '../ui/badge'
import { LogOut, User, Settings, Server, ChevronDown, Bell, Search } from 'lucide-react'
import { useState } from 'react'

export function Header() {
  const { user, logout, isAuthenticated } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  if (!isAuthenticated) return null

  const roleColors = {
    employee: 'from-gray-400 to-gray-500',
    co_patron: 'from-yellow-500 to-orange-500',
    patron: 'from-orange-500 to-red-500',
    dot: 'from-blue-500 to-cyan-500',
    superviseur: 'from-purple-500 to-indigo-500',
    superadmin: 'from-red-500 to-pink-500'
  }

  const roleLabels = {
    employee: 'Employé',
    co_patron: 'Co-Patron',
    patron: 'Patron',
    dot: 'DOT',
    superviseur: 'Superviseur',
    superadmin: 'SuperAdmin'
  }

  const getAvatarUrl = () => {
    if (user?.avatar) {
      return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
    }
    return `https://cdn.discordapp.com/embed/avatars/${parseInt(user?.discriminator || '0') % 5}.png`
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left side - Logo and navigation */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur opacity-50"></div>
                <div className="relative p-2 bg-gradient-to-r from-[#5865F2] to-[#4752C4] rounded-lg shadow-lg">
                  <Server className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-[#5865F2] to-[#4752C4] bg-clip-text text-transparent flex items-center space-x-2">
                  <img 
                    src="/logo.png" 
                    alt="FlashbackFA" 
                    className="h-6 w-6 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                  <span>FlashbackFA Enterprise</span>
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Management System
                </p>
              </div>
            </div>
            
            {/* Quick info */}
            <div className="hidden md:flex items-center space-x-4">
              <Badge variant="outline" className="bg-muted/50">
                <Server className="h-3 w-3 mr-1" />
                {getCurrentWeek()}
              </Badge>
              <Badge variant="outline" className="bg-muted/50">
                {user?.currentGuild?.name || 'No Guild'}
              </Badge>
            </div>
          </div>
          
          {/* Right side - User menu and actions */}
          <div className="flex items-center space-x-4">
            {/* Search button */}
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Search className="h-4 w-4" />
            </Button>
            
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-[10px] text-white font-bold">3</span>
              </div>
            </Button>
            
            {/* User menu */}
            <div className="relative">
              <Button
                variant="ghost"
                className="flex items-center space-x-3 h-10 px-3 hover:bg-muted/50"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <img
                  src={getAvatarUrl()}
                  alt={user?.username}
                  className="w-8 h-8 rounded-full ring-2 ring-primary/20"
                />
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium">{user?.username}</p>
                  <p className="text-xs text-muted-foreground">#{user?.discriminator}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-background border rounded-lg shadow-lg z-50">
                  <div className="p-4 border-b">
                    <div className="flex items-center space-x-3">
                      <img
                        src={getAvatarUrl()}
                        alt={user?.username}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{user?.username}#{user?.discriminator}</p>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                        <Badge className={`mt-1 bg-gradient-to-r ${roleColors[user?.role || 'employee']} text-white border-0 text-xs`}>
                          {roleLabels[user?.role || 'employee']} • Niveau {user?.roleLevel}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      Mon Profil
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Paramètres
                    </Button>
                  </div>
                  
                  <div className="p-2 border-t">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" 
                      size="sm"
                      onClick={() => {
                        setShowUserMenu(false)
                        logout()
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Se déconnecter
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Click outside to close menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  )
}