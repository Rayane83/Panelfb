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
      // Récupérer les entreprises depuis Supabase
      const { data: enterprises, error } = await supabase
        .from('enterprises')
        .select('*')
        .or(`owner_discord_id.eq.${userData.id},guild_id.in.(${userData.guilds.map(g => g.id).join(',')})`)

      const userEnterprises = enterprises || []

      const updatedUser = { ...userData, enterprises: userEnterprises }
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

          if (configuredGuilds.length === 0) {
            alert('Vous n\'êtes membre d\'aucune guilde autorisée. Accès refusé.')
            window.history.replaceState({}, '', '/auth')
            setIsLoading(false)
            return
          }
          
          const processedGuilds = configuredGuilds.map(guild => ({
            id: guild.id,
            name: guild.name,
            icon: guild.icon,
            owner: guild.owner,
            permissions: guild.permissions,
            roles: [] // Les rôles seront récupérés par le bot
          }))
          
          // Déterminer le rôle le plus élevé en temps réel via le bot
          const highestRole = await DiscordAuth.refreshUserRoles(discordUser.id)
          
          // Vérifier si l'utilisateur a au moins un rôle autorisé
          if (highestRole.roleLevel < 1) {
            alert('Vous n\'avez pas les permissions nécessaires pour accéder à cette application.')
            window.history.replaceState({}, '', '/auth')
            setIsLoading(false)
            return
          }
          
          const userData: User = {
            id: discordUser.id,
            username: discordUser.username,
            discriminator: discordUser.discriminator,
            avatar: discordUser.avatar,
            email: discordUser.email,
            firstName: '',
            lastName: '',
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
    localStorage.removeItem('user_profile')
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

  const updateProfile = async (profileData: { firstName: string; lastName: string; avatar: string }) => {
    if (!user) return

    try {
      const updatedUser = {
        ...user,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        avatar: profileData.avatar
      }

      setUser(updatedUser)
      localStorage.setItem('discord_user', JSON.stringify(updatedUser))
      localStorage.setItem('user_profile', JSON.stringify(profileData))
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  const refreshRoles = async () => {
    if (!user) return

    try {
      // Récupérer les rôles en temps réel depuis Discord
      const roleData = await DiscordAuth.refreshUserRoles(user.id)
      
      const updatedUser = {
        ...user,
        role: roleData.role as UserRole,
        roleLevel: roleData.roleLevel,
        allGuildRoles: roleData.allGuildRoles
      }

      setUser(updatedUser)
      localStorage.setItem('discord_user', JSON.stringify(updatedUser))
    } catch (error) {
      console.error('Error refreshing roles:', error)
      throw error
    }
  }

  const hasPermission = (permission: string): boolean => {
    return user?.roleLevel ? user.roleLevel >= 3 : false
  }

  // Charger le profil sauvegardé au démarrage
  useEffect(() => {
    if (user) {
      const savedProfile = localStorage.getItem('user_profile')
      if (savedProfile) {
        try {
          const profileData = JSON.parse(savedProfile)
          const updatedUser = {
            ...user,
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            avatar: profileData.avatar || user.avatar
          }
          setUser(updatedUser)
        } catch (error) {
          console.error('Error loading saved profile:', error)
        }
      }
    }
  }, [user?.id])

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
        updateProfile,
        refreshRoles,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}