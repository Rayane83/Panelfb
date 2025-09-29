export type UserRole = 'employee' | 'co_patron' | 'patron' | 'dot' | 'superviseur' | 'superadmin'

export interface User {
  id: string
  username: string
  discriminator: string
  avatar?: string
  email?: string
  guilds: Guild[]
  currentGuild?: Guild
  role: UserRole
  roleLevel: number
  enterprises: Enterprise[]
  allGuildRoles?: { guildId: string; guildName: string; roles: string[]; userRole: any }[]
}

export interface Enterprise {
  id: string
  guild_id: string
  name: string
  type: string
  description?: string
  owner_discord_id: string
  settings: any
  created_at: string
  updated_at: string
}

export interface Guild {
  id: string
  name: string
  icon?: string
  owner: boolean
  permissions: string
  roles: DiscordRole[]
}

export interface DiscordRole {
  id: string
  name: string
  color: number
  position: number
  permissions: string
}

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: () => Promise<void>
  logout: () => void
  switchGuild: (guildId: string) => void
  hasPermission: (permission: string) => boolean
}