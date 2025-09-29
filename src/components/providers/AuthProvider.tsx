import { ReactNode, useState, useEffect } from 'react'
import { AuthContext } from '../../hooks/useAuth'
import { User, UserRole } from '../../types/auth'

interface AuthProviderProps {
  children: ReactNode
}

// Mock Discord user data for demonstration
const MOCK_USERS: Record<string, User> = {
  employee: {
    id: '1',
    username: 'Employee',
    discriminator: '0001',
    avatar: null,
    email: 'employee@company.com',
    guilds: [{
      id: '123456789',
      name: 'Test Enterprise',
      icon: null,
      owner: false,
      permissions: '0',
      roles: [{ id: '1', name: 'Employee', color: 0x999999, position: 1, permissions: '0' }]
    }],
    role: 'employee',
    roleLevel: 1
  },
  patron: {
    id: '2',
    username: 'Patron',
    discriminator: '0002',
    avatar: null,
    email: 'patron@company.com',
    guilds: [{
      id: '123456789',
      name: 'Test Enterprise',
      icon: null,
      owner: true,
      permissions: '8',
      roles: [{ id: '2', name: 'Patron', color: 0xFF5733, position: 5, permissions: '8' }]
    }],
    role: 'patron',
    roleLevel: 3
  },
  superadmin: {
    id: '3',
    username: 'SuperAdmin',
    discriminator: '0003',
    avatar: null,
    email: 'admin@system.com',
    guilds: [{
      id: '123456789',
      name: 'System Administration',
      icon: null,
      owner: true,
      permissions: '8',
      roles: [{ id: '3', name: 'SuperAdmin', color: 0x7289DA, position: 10, permissions: '8' }]
    }],
    role: 'superadmin',
    roleLevel: 6
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading and auto-login for demo
    const timer = setTimeout(() => {
      const savedUser = localStorage.getItem('demo_user')
      if (savedUser && MOCK_USERS[savedUser]) {
        setUser(MOCK_USERS[savedUser])
      }
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const login = async () => {
    setIsLoading(true)
    // Simulate Discord OAuth flow
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // For demo, cycle through different user types
    const userTypes = Object.keys(MOCK_USERS)
    const currentType = localStorage.getItem('demo_user')
    const currentIndex = userTypes.indexOf(currentType || '')
    const nextIndex = (currentIndex + 1) % userTypes.length
    const nextUser = userTypes[nextIndex]
    
    localStorage.setItem('demo_user', nextUser)
    setUser(MOCK_USERS[nextUser])
    setIsLoading(false)
  }

  const logout = () => {
    localStorage.removeItem('demo_user')
    setUser(null)
  }

  const switchGuild = (guildId: string) => {
    if (user) {
      const guild = user.guilds.find(g => g.id === guildId)
      if (guild) {
        setUser({ ...user, currentGuild: guild })
      }
    }
  }

  const hasPermission = (permission: string): boolean => {
    // Simplified permission check
    return user?.roleLevel ? user.roleLevel >= 3 : false
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        switchGuild,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}