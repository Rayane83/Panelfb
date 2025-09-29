import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { LogIn, Shield, Users, Sparkles, Zap, Globe, CheckCircle } from 'lucide-react'
import { Badge } from '../components/ui/badge'

export function AuthPage() {
  const { login, isLoading } = useAuth()

  const handleLogin = async () => {
    console.log('🚀 Login button clicked')
    await login()
  }

  const features = [
    {
      icon: Users,
      title: "Gestion d'équipe",
      description: "Gérez vos employés et leurs rôles Discord"
    },
    {
      icon: Shield,
      title: "Sécurité OAuth",
      description: "Authentification Discord sécurisée"
    },
    {
      icon: Zap,
      title: "Interface moderne",
      description: "React 18 avec TypeScript et Tailwind"
    },
    {
      icon: Globe,
      title: "Multi-entreprises",
      description: "Architecture scalable et modulaire"
    }
  ]

  const roleHierarchy = [
    { name: 'Superadmin', level: 6, color: 'from-red-500 to-pink-500', description: 'Accès complet système' },
    { name: 'Staff', level: 5, color: 'from-purple-500 to-indigo-500', description: 'Administration générale' },
    { name: 'DOT', level: 4, color: 'from-blue-500 to-cyan-500', description: 'Direction fiscale' },
    { name: 'Patron', level: 3, color: 'from-orange-500 to-red-500', description: 'Propriétaire entreprise' },
    { name: 'Co-Patron', level: 2, color: 'from-yellow-500 to-orange-500', description: 'Co-direction' },
    { name: 'Employé', level: 1, color: 'from-gray-400 to-gray-500', description: 'Accès personnel' }
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
                    <Shield className="h-16 w-16 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Discord
                  <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Enterprise
                  </span>
                </h1>
                <p className="text-xl text-slate-300 max-w-lg mx-auto lg:mx-0">
                  Système complet de gestion d'entreprises avec authentification Discord OAuth
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
                Hiérarchie des rôles (6 niveaux)
              </h3>
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {roleHierarchy.map((role, index) => (
                  <div key={index} className={`px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${role.color} shadow-lg`}>
                    Niv.{role.level} {role.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Technical stack */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Stack Technique</h3>
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start text-xs">
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">React 18</Badge>
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">TypeScript</Badge>
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Vite</Badge>
                <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">Tailwind CSS</Badge>
                <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">Supabase</Badge>
                <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30">Discord OAuth</Badge>
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
                      Authentification Sécurisée
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      Connectez-vous avec Discord OAuth pour accéder au système
                    </CardDescription>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Benefits */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-sm text-slate-300">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Rôles Discord automatiquement mappés</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-slate-300">
                      <CheckCircle className="w-4 h-4 text-blue-400" />
                      <span>Interface moderne et responsive</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-slate-300">
                      <CheckCircle className="w-4 h-4 text-purple-400" />
                      <span>Gestion multi-entreprises</span>
                    </div>
                  </div>

                  {/* Role badges */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-300">
                      Niveaux d'accès disponibles:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {roleHierarchy.map((role, index) => (
                        <Badge 
                          key={index} 
                          className={`justify-center bg-gradient-to-r ${role.color} text-white border-0 shadow-sm text-xs`}
                        >
                          Niv.{role.level} {role.name}
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

                  {/* Security notice */}
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center space-x-2 text-xs text-slate-400">
                      <Shield className="h-3 w-3" />
                      <span>Connexion sécurisée SSL/TLS</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Authentification Discord OAuth 2.0 sécurisée
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Footer */}
              <div className="text-center mt-6">
                <p className="text-slate-400 text-sm">
                  Discord Enterprise Management System
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  Version 2.0 • React + TypeScript • Discord OAuth
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}