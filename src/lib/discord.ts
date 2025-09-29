const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID
const DISCORD_REDIRECT_URI = import.meta.env.VITE_DISCORD_REDIRECT_URI || `${window.location.origin}/auth/callback`
const DISCORD_API_BASE = 'https://discord.com/api/v10'
const DISCORD_CLIENT_SECRET = import.meta.env.VITE_DISCORD_CLIENT_SECRET
const DISCORD_BOT_TOKEN = import.meta.env.VITE_DISCORD_BOT_TOKEN

// ID du fondateur (superadmin par défaut)
const FOUNDER_DISCORD_ID = '462716512252329996'

// Guild IDs
const MAIN_GUILD_ID = import.meta.env.VITE_MAIN_GUILD_ID
const DOT_GUILD_ID = import.meta.env.VITE_DOT_GUILD_ID

export interface DiscordUser {
  id: string
  username: string
  discriminator: string
  avatar?: string
  email?: string
  verified?: boolean
}

export interface DiscordGuild {
  id: string
  name: string
  icon?: string
  owner: boolean
  permissions: string
  features: string[]
}

export interface DiscordMember {
  user: DiscordUser
  nick?: string
  roles: string[]
  joined_at: string
  premium_since?: string
  permissions?: string
}

export interface DiscordRole {
  id: string
  name: string
  color: number
  position: number
  permissions: string
}

export class DiscordAuth {
  static getAuthUrl(): string {
    if (!DISCORD_CLIENT_ID) {
      throw new Error('DISCORD_CLIENT_ID is not configured')
    }
    
    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      redirect_uri: DISCORD_REDIRECT_URI,
      response_type: 'code',
      scope: 'identify email guilds',
      prompt: 'none'
    })
    
    return `https://discord.com/oauth2/authorize?${params.toString()}`
  }

  static async exchangeCodeForToken(code: string): Promise<string> {
    if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) {
      throw new Error('Discord OAuth credentials not configured')
    }

    const response = await fetch(`${DISCORD_API_BASE}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: DISCORD_REDIRECT_URI,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Token exchange error:', errorData)
      throw new Error(`Failed to exchange code for token: ${response.status}`)
    }

    const data = await response.json()
    if (!data.access_token) {
      throw new Error('No access token received')
    }
    return data.access_token
  }

  static async getUser(token: string): Promise<DiscordUser> {
    const response = await fetch(`${DISCORD_API_BASE}/users/@me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch user')
    }

    return response.json()
  }

  static async getUserGuilds(token: string): Promise<DiscordGuild[]> {
    const response = await fetch(`${DISCORD_API_BASE}/users/@me/guilds`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch guilds')
    }

    return response.json()
  }

  static async getUserRolesInGuild(userId: string, guildId: string): Promise<string[]> {
    if (!DISCORD_BOT_TOKEN) {
      console.warn('Bot token not configured, cannot fetch user roles')
      return []
    }

    try {
      const response = await fetch(`${DISCORD_API_BASE}/guilds/${guildId}/members/${userId}`, {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        },
      })

      if (!response.ok) {
        console.warn(`Failed to fetch member roles for guild ${guildId}:`, response.status)
        return []
      }

      const member = await response.json()
      return member.roles || []
    } catch (error) {
      console.warn(`Error fetching member roles for guild ${guildId}:`, error)
      return []
    }
  }

  static async getGuildRoles(guildId: string): Promise<DiscordRole[]> {
    if (!DISCORD_BOT_TOKEN) {
      console.warn('Bot token not configured, cannot fetch guild roles')
      return []
    }

    try {
      const response = await fetch(`${DISCORD_API_BASE}/guilds/${guildId}/roles`, {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        },
      })

      if (!response.ok) {
        console.warn(`Failed to fetch roles for guild ${guildId}:`, response.status)
        return []
      }

      return response.json()
    } catch (error) {
      console.warn(`Error fetching roles for guild ${guildId}:`, error)
      return []
    }
  }
}

export function determineUserRoleFromDiscordData(
  userId: string, 
  userRoles: string[], 
  guildRoles: DiscordRole[], 
  isOwner: boolean,
  guildId: string
): {
  role: string
  roleLevel: number
  roleName: string
} {
  // Le fondateur est toujours superadmin
  if (userId === FOUNDER_DISCORD_ID) {
    return { role: 'superadmin', roleLevel: 6, roleName: 'Fondateur' }
  }

  // Si c'est le propriétaire de la guilde
  if (isOwner) {
    if (guildId === DOT_GUILD_ID) {
      return { role: 'dot', roleLevel: 4, roleName: 'DOT' }
    }
    return { role: 'patron', roleLevel: 3, roleName: 'Patron' }
  }

  // Créer un mapping des IDs de rôles vers les noms
  const roleIdToName = guildRoles.reduce((acc, role) => {
    acc[role.id] = role.name.toLowerCase()
    return acc
  }, {} as Record<string, string>)

  // Vérifier les rôles par priorité (du plus élevé au plus bas)
  const roleChecks = [
    { keywords: ['superadmin', 'super admin', 'super-admin', 'fondateur'], role: 'superadmin', level: 6, name: 'SuperAdmin' },
    { keywords: ['staff', 'admin', 'administrateur', 'superviseur'], role: 'staff', level: 5, name: 'Staff' },
    { keywords: ['dot', 'directeur', 'direction', 'fiscal'], role: 'dot', level: 4, name: 'DOT' },
    { keywords: ['patron', 'owner', 'propriétaire', 'ceo', 'boss'], role: 'patron', level: 3, name: 'Patron' },
    { keywords: ['co-patron', 'copatron', 'co patron', 'vice', 'adjoint'], role: 'co_patron', level: 2, name: 'Co-Patron' },
    { keywords: ['employee', 'employé', 'membre'], role: 'employee', level: 1, name: 'Employé' }
  ]

  // Parcourir les rôles de l'utilisateur
  for (const roleId of userRoles) {
    const roleName = roleIdToName[roleId] || ''
    
    // Vérifier chaque type de rôle
    for (const check of roleChecks) {
      if (check.keywords.some(keyword => roleName.includes(keyword))) {
        return { 
          role: check.role, 
          roleLevel: check.level, 
          roleName: check.name 
        }
      }
    }
  }

  // Si aucun rôle spécial trouvé, retourner employé
  return { role: 'employee', roleLevel: 1, roleName: 'Employé' }
}

export async function getHighestRoleFromAllGuilds(
  userId: string,
  guilds: DiscordGuild[]
): Promise<{
  role: string
  roleLevel: number
  roleName: string
  guildName: string
  allGuildRoles: any[]
}> {
  let highestRole = { 
    role: 'employee', 
    roleLevel: 1, 
    roleName: 'Employé',
    guildName: 'Aucune'
  }

  const allGuildRoles: any[] = []

  // Le fondateur est toujours superadmin
  if (userId === FOUNDER_DISCORD_ID) {
    return {
      role: 'superadmin',
      roleLevel: 6,
      roleName: 'Fondateur',
      guildName: 'Système',
      allGuildRoles: []
    }
  }
  
  // Filtrer seulement les guildes configurées
  const configuredGuilds = guilds.filter(guild => 
    guild.id === MAIN_GUILD_ID || guild.id === DOT_GUILD_ID
  )

  for (const guild of configuredGuilds) {
    try {
      // Récupérer les rôles de l'utilisateur dans cette guilde
      const userRoles = await DiscordAuth.getUserRolesInGuild(userId, guild.id)
      const guildRoles = await DiscordAuth.getGuildRoles(guild.id)
      
      const roleInfo = determineUserRoleFromDiscordData(
        userId, 
        userRoles, 
        guildRoles, 
        guild.owner, 
        guild.id
      )

      allGuildRoles.push({
        guildId: guild.id,
        guildName: guild.name,
        userRole: roleInfo,
        roles: userRoles
      })
      
      if (roleInfo.roleLevel > highestRole.roleLevel) {
        highestRole = {
          ...roleInfo,
          guildName: guild.name
        }
      }
    } catch (error) {
      console.warn(`Error processing guild ${guild.name}:`, error)
    }
  }
  
  return { ...highestRole, allGuildRoles }
}