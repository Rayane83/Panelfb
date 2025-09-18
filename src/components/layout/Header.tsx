import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme.tsx'
import { Button } from '../ui/button'
import { getCurrentWeek } from '../../lib/utils'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { LogOut, User, Settings, Server, ChevronDown, Bell, Search, Moon, Sun, Camera, Save, Shield } from 'lucide-react'
import { useState, useRef } from 'react'

export function Header() {
  const { user, logout, isAuthenticated, updateProfile, refreshRoles } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showProfileEdit, setShowProfileEdit] = useState(false)
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    avatar: user?.avatar || ''
  })
  const [isRefreshingRoles, setIsRefreshingRoles] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    if (profileData.avatar && profileData.avatar.startsWith('data:')) {
      return profileData.avatar
    }
    if (user?.avatar) {
      return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
    }
    return `https://cdn.discordapp.com/embed/avatars/${parseInt(user?.discriminator || '0') % 5}.png`
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB max
        alert('La taille de l\'image ne doit pas dépasser 5MB')
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setProfileData(prev => ({ ...prev, avatar: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async () => {
    try {
      await updateProfile(profileData)
      setShowProfileEdit(false)
      alert('Profil mis à jour avec succès !')
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error)
      alert('Erreur lors de la mise à jour du profil')
    }
  }

  const handleRefreshRoles = async () => {
    try {
      setIsRefreshingRoles(true)
      await refreshRoles()
      alert('Rôles mis à jour avec succès !')
    } catch (error) {
      console.error('Erreur lors de la mise à jour des rôles:', error)
      alert('Erreur lors de la mise à jour des rôles')
    } finally {
      setIsRefreshingRoles(false)
    }
  }

  const getDisplayName = () => {
    if (profileData.firstName || profileData.lastName) {
      return `${profileData.firstName} ${profileData.lastName}`.trim()
    }
    return user?.username || 'Utilisateur'
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
            {/* Theme toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className="hidden sm:flex"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

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
                  alt={getDisplayName()}
                  className="w-8 h-8 rounded-full ring-2 ring-primary/20"
                />
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium">{getDisplayName()}</p>
                  <p className="text-xs text-muted-foreground">#{user?.discriminator}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-background border rounded-lg shadow-lg z-50">
                  <div className="p-4 border-b">
                    <div className="flex items-center space-x-3">
                      <img
                        src={getAvatarUrl()}
                        alt={getDisplayName()}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{getDisplayName()}</p>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                        <Badge className={`mt-1 bg-gradient-to-r ${roleColors[user?.role || 'employee']} text-white border-0 text-xs`}>
                          {roleLabels[user?.role || 'employee']} • Niveau {user?.roleLevel}
                        </Badge>
                        
                        {/* Affichage des rôles par guilde */}
                        {user?.allGuildRoles && user.allGuildRoles.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <p className="text-xs text-muted-foreground font-medium">Rôles Discord:</p>
                            {user.allGuildRoles.map((guildRole, index) => (
                              <div key={index} className="text-xs">
                                <span className="font-medium">{guildRole.guildName}:</span>
                                <span className="ml-1 text-muted-foreground">
                                  {guildRole.userRole.roleName} (IDs: {guildRole.roles.slice(0, 2).join(', ')}{guildRole.roles.length > 2 ? '...' : ''})
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start" 
                      size="sm"
                      onClick={() => {
                        setShowProfileEdit(true)
                        setShowUserMenu(false)
                      }}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Mon Profil
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start" 
                      size="sm"
                      onClick={handleRefreshRoles}
                      disabled={isRefreshingRoles}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      {isRefreshingRoles ? 'Actualisation...' : 'Actualiser les rôles'}
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start" 
                      size="sm"
                      onClick={toggleTheme}
                    >
                      {theme === 'dark' ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                      Mode {theme === 'dark' ? 'Clair' : 'Sombre'}
                    </Button>
                    {(user?.role === 'superviseur' || user?.role === 'superadmin') && (
                      <Button variant="ghost" className="w-full justify-start" size="sm" asChild>
                        <a href="/staff">
                          <Shield className="h-4 w-4 mr-2" />
                          Gestion Staff
                        </a>
                      </Button>
                    )}
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

      {/* Profile Edit Modal */}
      {showProfileEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Modifier mon profil</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowProfileEdit(false)}
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-6">
                {/* Avatar */}
                <div className="text-center space-y-4">
                  <div className="relative inline-block">
                    <img
                      src={getAvatarUrl()}
                      alt="Avatar"
                      className="w-24 h-24 rounded-full mx-auto"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute bottom-0 right-0 rounded-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    Cliquez sur l'icône pour changer votre photo
                  </p>
                </div>

                {/* Name fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="Votre prénom"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Votre nom"
                    />
                  </div>
                </div>

                {/* Theme toggle */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                    <div>
                      <p className="font-medium">Mode sombre</p>
                      <p className="text-sm text-muted-foreground">
                        Basculer entre les thèmes clair et sombre
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={toggleTheme}
                  />
                </div>

                {/* Discord info */}
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-2">Informations Discord</p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>Username: {user?.username}#{user?.discriminator}</p>
                    <p>Email: {user?.email}</p>
                    <p>Rôle: {roleLabels[user?.role || 'employee']}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <Button 
                    onClick={handleSaveProfile} 
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowProfileEdit(false)}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}