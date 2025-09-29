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