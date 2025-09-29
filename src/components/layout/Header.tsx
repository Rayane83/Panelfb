import { useAuth } from '../../hooks/useAuth'
import { usePermissions } from '../../hooks/usePermissions'
import { Button } from '../ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Badge } from '../ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu'
import { 
  LogOut, 
  Settings, 
  Shield, 
  User, 
  Building,
  ChevronDown
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export function Header() {
  const { user, logout } = useAuth()
  const { hasPermission } = usePermissions()
  const location = useLocation()

  if (!user) return null

  const getAvatarUrl = () => {
    if (user.avatar) {
      return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
    }
    return `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png`
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin': return 'bg-red-500'
      case 'staff': return 'bg-purple-500'
      case 'dot': return 'bg-blue-500'
      case 'patron': return 'bg-orange-500'
      case 'co_patron': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'superadmin': return 'SuperAdmin'
      case 'staff': return 'Staff'
      case 'dot': return 'DOT'
      case 'patron': return 'Patron'
      case 'co_patron': return 'Co-Patron'
      case 'employee': return 'Employé'
      default: return role
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo et titre */}
        <Link to="/" className="flex items-center space-x-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur opacity-50"></div>
            <div className="relative p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Discord Enterprise
            </h1>
            <p className="text-xs text-muted-foreground">Management System</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <Button
            variant={location.pathname === '/' ? 'default' : 'ghost'}
            size="sm"
            asChild
          >
            <Link to="/">Dashboard</Link>
          </Button>
          
          {hasPermission('company_config') && (
            <Button
              variant={location.pathname === '/patron-config' ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to="/patron-config">
                <Building className="h-4 w-4 mr-2" />
                Configuration
              </Link>
            </Button>
          )}
          
          {hasPermission('config_staff') && (
            <Button
              variant={location.pathname === '/staff' ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to="/staff">
                <Settings className="h-4 w-4 mr-2" />
                Staff
              </Link>
            </Button>
          )}
          
          {hasPermission('superadmin') && (
            <Button
              variant={location.pathname === '/superadmin' ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to="/superadmin">
                <Shield className="h-4 w-4 mr-2" />
                SuperAdmin
              </Link>
            </Button>
          )}
        </nav>

        {/* Menu utilisateur */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-auto px-3">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={getAvatarUrl()} alt={user.username} />
                  <AvatarFallback>
                    {user.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium">{user.username}</p>
                  <Badge 
                    className={`text-xs text-white ${getRoleBadgeColor(user.role)}`}
                  >
                    {getRoleLabel(user.role)}
                  </Badge>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent className="w-56" align="end">
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                <p className="font-medium">{user.username}</p>
                <p className="text-xs text-muted-foreground">
                  Niveau {user.roleLevel} • {getRoleLabel(user.role)}
                </p>
                {user.currentGuild && (
                  <p className="text-xs text-muted-foreground">
                    {user.currentGuild.name}
                  </p>
                )}
              </div>
            </div>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem asChild>
              <Link to="/" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </DropdownMenuItem>
            
            {hasPermission('company_config') && (
              <DropdownMenuItem asChild>
                <Link to="/patron-config" className="cursor-pointer">
                  <Building className="mr-2 h-4 w-4" />
                  Configuration
                </Link>
              </DropdownMenuItem>
            )}
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}