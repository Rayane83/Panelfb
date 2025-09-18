import { ReactNode, useState, useEffect } from 'react'
import { AuthContext } from '../../hooks/useAuth'
import { User, UserRole } from '../../types/auth'
import { DiscordAuth, getHighestRoleFromAllGuilds } from '../../lib/discord'
import { supabase } from '../../lib/supabase'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const initAuth = async () => {
      try {
        const savedUser = localStorage.getItem('discord_user')
        if (savedUser) {
          const userData = JSON.parse(savedUser)
          // Vérifier si l'utilisateur existe toujours et récupérer ses entreprises
          await refreshUserData(userData)
        }
      } catch (error) {
        console.error('Error parsing saved user data:', error)
        localStorage.removeItem('discord_user')
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const refreshUserData = async (userData: User) => {
    try {
      // Simulation d'entreprises pour l'utilisateur
      const mockEnterprises = [
        {
          id: '1',
          guild_id: userData.guilds[0]?.id || 'unknown',
          name: 'Mon Entreprise',
          type: 'SARL',
          description: 'Entreprise de test',
          owner_discord_id: userData.id,
          settings: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]

      const updatedUser = { ...userData, enterprises: mockEnterprises }
      setUser(updatedUser)
      localStorage.setItem('discord_user', JSON.stringify(updatedUser))
    } catch (error) {
      console.error('Error refreshing user data:', error)
      setUser(userData)
    }
  }
  useEffect(() => {
    // Gérer le callback OAuth
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const error = urlParams.get('error')
      
      if (error) {
        console.error('OAuth error:', error)
        setIsLoading(false)
        window.history.replaceState({}, '', '/auth')
        return
      }
      
      if (code && window.location.pathname === '/auth/callback') {
        setIsLoading(true)
        try {
          // Échanger le code contre un token
          const token = await DiscordAuth.exchangeCodeForToken(code)
          
          // Récupérer les informations utilisateur
          const discordUser = await DiscordAuth.getUser(token)
          const guilds = await DiscordAuth.getUserGuilds(token)
          
          // Filtrer et traiter seulement les guildes configurées
          const configuredGuilds = guilds.filter(guild => 
            guild.id === import.meta.env.VITE_MAIN_GUILD_ID || 
            guild.id === import.meta.env.VITE_DOT_GUILD_ID
          )
          
          const processedGuilds = configuredGuilds.map(guild => ({
            id: guild.id,
            name: guild.name,
            icon: guild.icon,
            owner: guild.owner,
            permissions: guild.permissions,
            roles: [] // Les rôles seront récupérés par le bot
          }))
          
          // Déterminer le rôle le plus élevé parmi toutes les guildes configurées
          const highestRole = await getHighestRoleFromAllGuilds(discordUser.id, configuredGuilds)
          
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
            enterprises: [],
            allGuildRoles: highestRole.allGuildRoles
          }
          
          // Créer/mettre à jour l'utilisateur et récupérer ses entreprises
          await refreshUserData(userData)
          
          // Rediriger vers le dashboard ou la page demandée
          const intendedPath = sessionStorage.getItem('intendedPath') || '/'
          sessionStorage.removeItem('intendedPath')
          window.history.replaceState({}, '', intendedPath)
          window.location.reload() // Force le rechargement pour appliquer les changements
          
        } catch (error) {
          console.error('OAuth callback error:', error)
          alert('Erreur d\'authentification Discord. Veuillez réessayer.')
          window.history.replaceState({}, '', '/auth')
        } finally {
          setIsLoading(false)
        }
      }
    }
    
    handleOAuthCallback()
  }, [])

  const login = async () => {
    setIsLoading(true)
    
    try {
      // Rediriger vers Discord OAuth
      const authUrl = DiscordAuth.getAuthUrl()
      window.location.href = authUrl
    } catch (error) {
      console.error('Login error:', error)
      alert('Erreur lors de la connexion Discord: ' + (error as Error).message)
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('discord_user')
    setUser(null)
    // Rediriger vers la page d'auth sans rechargement
    window.history.pushState({}, '', '/auth')
    window.location.reload()
  }

  const switchGuild = (guildId: string) => {
    if (user) {
      const guild = user.guilds.find(g => g.id === guildId)
      if (guild) {
        const updatedUser = { ...user, currentGuild: guild }
        setUser(updatedUser)
        localStorage.setItem('discord_user', JSON.stringify(updatedUser))
      }
    }
  }

  const hasPermission = (permission: string): boolean => {
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