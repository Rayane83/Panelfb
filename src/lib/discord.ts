// Configuration Discord OAuth avec valeurs par défaut
const DISCORD_CLIENT_ID = '1402231031804723210'
const DISCORD_CLIENT_SECRET = 'LgKUe7k1mwTnj1qlodKcYKnoRPVB6QoG'
const DISCORD_BOT_TOKEN = import.meta.env.VITE_DISCORD_BOT_TOKEN
const DISCORD_REDIRECT_URI = 'https://flashbackfa-entreprise.fr/auth/callback'
const DISCORD_API_BASE = 'https://discord.com/api/v10'

// ID du fondateur (superadmin par défaut)
const FOUNDER_DISCORD_ID = '462716512252329996'

// Guild IDs
const MAIN_GUILD_ID = '1404608015230832742'
const DOT_GUILD_ID = '1404609091372056606'

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
    console.log('🔗 Generating Discord OAuth URL...')
    
    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      redirect_uri: DISCORD_REDIRECT_URI,
      response_type: 'code',
      scope: 'identify email guilds',
      prompt: 'none'
    })
    
    const authUrl = `https://discord.com/oauth2/authorize?${params.toString()}`
    console.log('✅ Auth URL generated:', authUrl)
    
    return authUrl
  }

  static async exchangeCodeForToken(code: string): Promise<string> {
    console.log('🔄 Exchanging code for token...')
    console.log('📋 Config:', {
      client_id: DISCORD_CLIENT_ID,
      redirect_uri: DISCORD_REDIRECT_URI,
      code_preview: code.substring(0, 10) + '...'
    })

    try {
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

      console.log('📡 Token exchange response:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Token exchange failed:', errorText)
        throw new Error(`Échec de l'échange du code: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('✅ Token received successfully')
      
      if (!data.access_token) {
        console.error('❌ No access token in response:', data)
        throw new Error('Aucun token d\'accès reçu')
      }
      
      return data.access_token
    } catch (error) {
      console.error('💥 Token exchange error:', error)
      throw error
    }
  }

  static async getUser(token: string): Promise<DiscordUser> {
    console.log('👤 Fetching user data...')
    
    const response = await fetch(`${DISCORD_API_BASE}/users/@me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Failed to fetch user:', errorText)
      throw new Error(`Impossible de récupérer l'utilisateur: ${response.status}`)
    }

    const user = await response.json()
    console.log('✅ User data received:', { id: user.id, username: user.username })
    
    return user
  }

  static async getUserGuilds(token: string): Promise<DiscordGuild[]> {
    console.log('🏰 Fetching user guilds...')
    
    const response = await fetch(`${DISCORD_API_BASE}/users/@me/guilds`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Failed to fetch guilds:', errorText)
      throw new Error(`Impossible de récupérer les serveurs: ${response.status}`)
    }

    const guilds = await response.json()
    console.log('✅ Guilds received:', guilds.length, 'guilds')
    
    return guilds
  }

  static async getUserRolesInGuild(userId: string, guildId: string): Promise<string[]> {
    if (!DISCORD_BOT_TOKEN) {
      console.warn('⚠️ Bot token not configured, cannot fetch user roles')
      return []
    }

    try {
      console.log(`🔍 Fetching roles for user ${userId} in guild ${guildId}`)
      
      const response = await fetch(`${DISCORD_API_BASE}/guilds/${guildId}/members/${userId}`, {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        },
      })

      if (!response.ok) {
        console.warn(`⚠️ Failed to fetch member roles for guild ${guildId}:`, response.status)
        return []
      }

      const member = await response.json()
      console.log(`✅ Roles found for guild ${guildId}:`, member.roles?.length || 0)
      
      return member.roles || []
    } catch (error) {
      console.warn(`💥 Error fetching member roles for guild ${guildId}:`, error)
      return []
    }
  }

  static async getGuildRoles(guildId: string): Promise<DiscordRole[]> {
    if (!DISCORD_BOT_TOKEN) {
      console.warn('⚠️ Bot token not configured, cannot fetch guild roles')
      return []
    }

    try {
      console.log(`🎭 Fetching roles for guild ${guildId}`)
      
      const response = await fetch(`${DISCORD_API_BASE}/guilds/${guildId}/roles`, {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        },
      })

      if (!response.ok) {
        console.warn(`⚠️ Failed to fetch roles for guild ${guildId}:`, response.status)
        return []
      }

      const roles = await response.json()
      console.log(`✅ Guild roles found for ${guildId}:`, roles.length)
      
      return roles
    } catch (error) {
      console.warn(`💥 Error fetching roles for guild ${guildId}:`, error)
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
  console.log('🎯 Determining user role...', { userId, isOwner, guildId, rolesCount: userRoles.length })
  
  // Le fondateur est toujours superadmin
  if (userId === FOUNDER_DISCORD_ID) {
    console.log('👑 Founder detected - SuperAdmin access granted')
    return { role: 'superadmin', roleLevel: 6, roleName: 'Fondateur' }
  }

  // Si c'est le propriétaire de la guilde
  if (isOwner) {
    if (guildId === DOT_GUILD_ID) {
      console.log('🏛️ Guild owner in DOT guild - DOT role assigned')
      return { role: 'dot', roleLevel: 4, roleName: 'DOT' }
    }
    console.log('👨‍💼 Guild owner - Patron role assigned')
    return { role: 'patron', roleLevel: 3, roleName: 'Patron' }
  }

  // Créer un mapping des IDs de rôles vers les noms
  const roleIdToName = guildRoles.reduce((acc, role) => {
    acc[role.id] = role.name.toLowerCase()
    return acc
  }, {} as Record<string, string>)

  console.log('🔍 Checking user roles against role hierarchy...')

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
        console.log(`✅ Role match found: ${roleName} -> ${check.name} (Level ${check.level})`)
        return { 
          role: check.role, 
          roleLevel: check.level, 
          roleName: check.name 
        }
      }
    }
  }

  // Si aucun rôle spécial trouvé, retourner employé
  console.log('📝 No special role found - Default employee role assigned')
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
  console.log('🏆 Determining highest role across all guilds...')
  
  let highestRole = { 
    role: 'employee', 
    roleLevel: 1, 
    roleName: 'Employé',
    guildName: 'Aucune'
  }

  const allGuildRoles: any[] = []

  // Le fondateur est toujours superadmin
  if (userId === FOUNDER_DISCORD_ID) {
    console.log('👑 Founder detected - Maximum privileges granted')
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

  console.log(`🔍 Processing ${configuredGuilds.length} configured guilds...`)

  for (const guild of configuredGuilds) {
    try {
      console.log(`🏰 Processing guild: ${guild.name} (${guild.id})`)
      
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
        console.log(`📈 New highest role found: ${roleInfo.roleName} (Level ${roleInfo.roleLevel}) in ${guild.name}`)
        highestRole = {
          ...roleInfo,
          guildName: guild.name
        }
      }
    } catch (error) {
      console.warn(`⚠️ Error processing guild ${guild.name}:`, error)
    }
  }
  
  console.log(`🎯 Final role determined: ${highestRole.roleName} (Level ${highestRole.roleLevel})`)
  return { ...highestRole, allGuildRoles }
}