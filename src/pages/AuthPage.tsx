import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { LogIn, Shield, Users, Sparkles, Zap, Globe } from 'lucide-react'
import { Badge } from '../components/ui/badge'

export function AuthPage() {
  const { login, isLoading } = useAuth()
  
  // Vérifier la configuration Discord
  const isDiscordConfigured = import.meta.env.VITE_DISCORD_CLIENT_ID && import.meta.env.VITE_DISCORD_CLIENT_SECRET

  const handleLogin = async () => {
    await login()
  }

  const features = [
    {
      icon: Users,
      title: "Gestion d'équipe",
      description: "Gérez vos employés et leurs rôles"
    },
    {
      icon: Shield,
      title: "Sécurité avancée",
      description: "Authentification Discord sécurisée"
    },
    {
      icon: Zap,
      title: "Performance",
      description: "Interface rapide et réactive"
    },
    {
      icon: Globe,
      title: "Multi-entreprises",
      description: "Gérez plusieurs entreprises"
    }
  ]

  const roleHierarchy = [
    { name: 'Fondateur', level: 7, color: 'from-red-500 to-pink-500', description: 'Accès complet système' },
    { name: 'Staff', level: 6, color: 'from-purple-500 to-indigo-500', description: 'Administration générale' },
    { name: 'DOT', level: 5, color: 'from-blue-500 to-cyan-500', description: 'Direction fiscale' },
    { name: 'Patron', level: 4, color: 'from-orange-500 to-red-500', description: 'Propriétaire entreprise' },
    { name: 'Co-Patron', level: 3, color: 'from-yellow-500 to-orange-500', description: 'Co-direction' },
    { name: 'Manager', level: 2, color: 'from-green-500 to-emerald-500', description: 'Gestion équipe' },
    { name: 'Employé', level: 1, color: 'from-gray-400 to-gray-500', description: 'Accès de base' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%239C92AC%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      {/* Animated background elements */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          
          {/* Left side - Branding and features */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <div className="flex justify-center lg:justify-start">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                  <div className="relative p-4 bg-white/10 rounded-full backdrop-blur border border-white/20">
                    <img 
                      src="/logo.png" 
                      alt="FlashbackFA Logo" 
                      className="h-16 w-16 object-contain"
                      onError={(e) => {
                        // Fallback si l'image ne charge pas
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        target.nextElementSibling?.classList.remove('hidden')
                      }}
                    />
                    <Shield className="h-16 w-16 text-white hidden" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                  FlashbackFA
                  <span className="block text-gradient-discord">Entreprise</span>
                </h1>
                <p className="text-xl text-slate-300 max-w-lg mx-auto lg:mx-0">
                  Automatisation des fiches d'impôts, export DOT, blanchiment et gestion salariale
                </p>
              </div>
            </div>

            {/* Features grid */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div key={index} className="glass rounded-xl p-4 card-hover">
                    <Icon className="h-8 w-8 text-purple-400 mb-2" />
                    <h3 className="font-semibold text-white text-sm">{feature.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">{feature.description}</p>
                  </div>
                )
              })}
            </div>

            {/* Role hierarchy preview */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-400" />
                Hiérarchie des rôles
              </h3>
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {roleHierarchy.slice(0, 4).map((role, index) => (
                  <div key={index} className={`px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${role.color} shadow-lg`}>
                    {role.name}
                  </div>
                ))}
                <div className="px-3 py-1 rounded-full text-xs font-medium text-slate-400 bg-slate-800 border border-slate-700">
                  +3 autres
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Login form */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md">
              <Card className="glass border-white/20 shadow-2xl">
                <CardHeader className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="p-3 bg-gradient-to-r from-[#5865F2] to-[#4752C4] rounded-full shadow-lg">
                      <Shield className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <CardTitle className="text-2xl font-bold text-white">
                      Authentification
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      Connectez-vous avec votre compte Discord pour accéder au système
                    </CardDescription>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Benefits */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-sm text-slate-300">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Accès basé sur vos rôles Discord réels</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-slate-300">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>Bot Discord pour récupération des rôles</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-slate-300">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span>Synchronisation automatique</span>
                    </div>
                  </div>

                  {/* Role badges */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-300">
                      Niveaux d'accès disponibles:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {roleHierarchy.slice(0, 6).map((role, index) => (
                        <Badge 
                          key={index} 
                          className={`justify-center bg-gradient-to-r ${role.color} text-white border-0 shadow-sm`}
                        >
                          {role.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Login button */}
                  <Button 
                    onClick={handleLogin} 
                    className="w-full h-12 bg-gradient-to-r from-[#5865F2] to-[#4752C4] hover:from-[#4752C4] hover:to-[#3c4399] text-white font-semibold shadow-lg btn-glow"
                    disabled={isLoading}
                    size="lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Connexion en cours...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <LogIn className="h-5 w-5" />
                        <span>Se connecter avec Discord</span>
                      </div>
                    )}
                  </Button>
                  
                  {!isDiscordConfigured && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg backdrop-blur">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <p className="text-sm text-red-400 font-medium">Configuration requise</p>
                      </div>
                      <p className="text-xs text-red-300 mt-1">
                        CLIENT_ID, CLIENT_SECRET et BOT_TOKEN Discord requis pour fonctionner.
                      </p>
                    </div>
                  )}

                  {/* Security notice */}
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center space-x-2 text-xs text-slate-400">
                      <Shield className="h-3 w-3" />
                      <span>Connexion sécurisée SSL/TLS</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Vous serez redirigé vers Discord pour autoriser l'application
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Footer */}
              <div className="text-center mt-6">
                <p className="text-slate-400 text-sm">
                  FlashbackFA Enterprise Management System
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  Version 2.0 • Powered by React & Discord API
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}