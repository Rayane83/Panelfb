import { ReactNode, useState, useEffect } from 'react'
import { AuthContext } from '../hooks/useAuth'
import { User, UserRole } from '../types/auth'
import { DiscordAuth, getHighestRoleFromAllGuilds } from '../lib/discord'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const initAuth = async () => {
      console.log('🔄 Initializing authentication...')
      
      try {
        const savedUser = localStorage.getItem('discord_user')
        if (savedUser) {
          console.log('👤 Found saved user data')
          const userData = JSON.parse(savedUser)
          setUser(userData)
          console.log('✅ User restored from localStorage')
        } else {
          console.log('📝 No saved user data found')
        }
      } catch (error) {
        console.error('💥 Error parsing saved user data:', error)
        localStorage.removeItem('discord_user')
      } finally {
        setIsLoading(false)
        console.log('✅ Auth initialization complete')
      }
    }

    initAuth()
  }, [])

  useEffect(() => {
    // Gérer le callback OAuth
    const handleOAuthCallback = async () => {
      const currentUrl = window.location.href
      const pathname = window.location.pathname
      
      console.log('🌐 Current URL:', currentUrl)
      console.log('📍 Pathname:', pathname)
      
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const error = urlParams.get('error')
      
      if (error) {
        console.error('❌ OAuth error:', error, urlParams.get('error_description'))
        alert(`Erreur d'authentification Discord: ${error}`)
        setIsLoading(false)
        window.history.replaceState({}, '', '/auth')
        return
      }
      
      if (code && pathname === '/auth/callback') {
        console.log('🔄 Processing OAuth callback...')
        console.log('🔑 Authorization code received:', code.substring(0, 10) + '...')
        
        setIsLoading(true)
        
        try {
          // Échanger le code contre un token
          console.log('🔄 Step 1: Exchanging code for token...')
          const token = await DiscordAuth.exchangeCodeForToken(code)
          console.log('✅ Step 1 complete: Token received')
          
          // Récupérer les informations utilisateur
          console.log('🔄 Step 2: Fetching user data...')
          const discordUser = await DiscordAuth.getUser(token)
          console.log('✅ Step 2 complete: User data received')
          console.log('👤 Discord user:', { id: discordUser.id, username: discordUser.username })
          
          console.log('🔄 Step 3: Fetching user guilds...')
          const guilds = await DiscordAuth.getUserGuilds(token)
          console.log('✅ Step 3 complete: Guilds received')
          console.log('🏰 User guilds:', guilds.map(g => ({ id: g.id, name: g.name })))
          
          // Filtrer et traiter seulement les guildes configurées
          const mainGuildId = '1404608015230832742'
          const dotGuildId = '1404609091372056606'
          
          const configuredGuilds = guilds.filter(guild => 
            guild.id === mainGuildId || guild.id === dotGuildId
          )
          
          console.log('🎯 Configured guilds found:', configuredGuilds.length)
          
          const processedGuilds = configuredGuilds.map(guild => ({
            id: guild.id,
            name: guild.name,
            icon: guild.icon,
            owner: guild.owner,
            permissions: guild.permissions,
            roles: [] // Les rôles seront récupérés par le bot
          }))
          
          // Déterminer le rôle le plus élevé parmi toutes les guildes configurées
          console.log('🔄 Step 4: Determining user role...')
          const highestRole = await getHighestRoleFromAllGuilds(discordUser.id, configuredGuilds)
          console.log('✅ Step 4 complete: Role determined')
          console.log('🎯 Highest role:', highestRole)
          
          const userData: User = {
            id: discordUser.id,
            username: discordUser.username,
            discriminator: discordUser.discriminator,
            avatar: discordUser.avatar,
            email: discordUser.email,
            guilds: processedGuilds,
            currentGuild: processedGuilds[0],
            role: highestRole.role as UserRole,
            roleLevel: highestRole.roleLevel,
            allGuildRoles: highestRole.allGuildRoles
          }
          
          console.log('💾 Saving user data...')
          setUser(userData)
          localStorage.setItem('discord_user', JSON.stringify(userData))
          console.log('✅ User data saved successfully')
          
          // Rediriger vers la page demandée ou le dashboard
          const intendedPath = sessionStorage.getItem('intendedPath') || '/'
          sessionStorage.removeItem('intendedPath')
          console.log('🔄 Redirecting to:', intendedPath)
          window.history.replaceState({}, '', intendedPath)
          
          console.log('🎉 Authentication successful!')
          
        } catch (error) {
          console.error('💥 OAuth callback error:', error)
          const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
          alert(`Erreur d'authentification Discord: ${errorMessage}`)
          window.history.replaceState({}, '', '/auth')
        } finally {
          setIsLoading(false)
        }
      }
    }
    
    handleOAuthCallback()
  }, [])

  const login = async () => {
    console.log('🔄 Initiating Discord login...')
    setIsLoading(true)
    
    try {
      // Sauvegarder la page actuelle pour redirection après connexion
      if (window.location.pathname !== '/auth') {
        sessionStorage.setItem('intendedPath', window.location.pathname)
      }
      
      // Rediriger vers Discord OAuth
      const authUrl = DiscordAuth.getAuthUrl()
      console.log('🔗 Redirecting to Discord OAuth:', authUrl)
      window.location.href = authUrl
    } catch (error) {
      console.error('💥 Login error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      alert(`Erreur lors de la connexion Discord: ${errorMessage}`)
      setIsLoading(false)
    }
  }

  const logout = () => {
    console.log('🔄 Logging out...')
    localStorage.removeItem('discord_user')
    sessionStorage.removeItem('intendedPath')
    setUser(null)
    console.log('✅ Logout complete')
    
    // Rediriger vers la page d'auth
    window.history.pushState({}, '', '/auth')
    window.location.reload()
  }

  const switchGuild = (guildId: string) => {
    if (user) {
      console.log('🔄 Switching guild to:', guildId)
      const guild = user.guilds.find(g => g.id === guildId)
      if (guild) {
        const updatedUser = { ...user, currentGuild: guild }
        setUser(updatedUser)
        localStorage.setItem('discord_user', JSON.stringify(updatedUser))
        console.log('✅ Guild switched to:', guild.name)
      }
    }
  }

  const hasPermission = (permission: string): boolean => {
    const hasAccess = user?.roleLevel ? user.roleLevel >= 1 : false
    console.log(`🔐 Permission check for "${permission}":`, hasAccess, `(Level: ${user?.roleLevel || 0})`)
    return hasAccess
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