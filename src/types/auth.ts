export type UserRole = 'employee' | 'co_patron' | 'patron' | 'dot' | 'staff' | 'superadmin'

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
  allGuildRoles?: GuildRole[]
}

export interface Guild {
  id: string
  name: string
  icon?: string
  owner: boolean
  permissions: string
  roles: DiscordRole[]
}

export interface GuildRole {
  guildId: string
  guildName: string
  userRole: {
    role: UserRole
    roleLevel: number
    roleName: string
  }
  roles: string[]
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