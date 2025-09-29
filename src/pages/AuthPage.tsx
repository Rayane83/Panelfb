import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Server, LogIn, Shield, Users } from 'lucide-react'
import { Badge } from '../components/ui/badge'

export function AuthPage() {
  const { login, isLoading } = useAuth()

  const handleLogin = async () => {
    await login()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-white/10 rounded-full backdrop-blur">
              <Server className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">Discord Enterprise</h1>
          <p className="text-slate-300">
            Système de gestion d'entreprise intégré Discord
          </p>
        </div>

        <Card className="backdrop-blur bg-white/95 border-white/20">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <Shield className="h-5 w-5 text-[#5865F2]" />
              <span>Authentification Discord</span>
            </CardTitle>
            <CardDescription>
              Connectez-vous avec votre compte Discord pour accéder au système
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Accès basé sur les rôles Discord</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Authentification sécurisée</span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Niveaux d'accès disponibles:
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-gray-100 text-gray-800">Employé</Badge>
                <Badge className="bg-orange-100 text-orange-800">Co-Patron</Badge>
                <Badge className="bg-red-100 text-red-800">Patron</Badge>
                <Badge className="bg-blue-100 text-blue-800">DOT</Badge>
                <Badge className="bg-purple-100 text-purple-800">Staff</Badge>
                <Badge className="bg-indigo-100 text-indigo-800">SuperAdmin</Badge>
              </div>
            </div>

            <Button 
              onClick={handleLogin} 
              className="w-full"
              variant="discord"
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Connexion en cours...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <LogIn className="h-5 w-5" />
                  <span>Se connecter avec Discord</span>
                </div>
              )}
            </Button>

            <div className="text-xs text-muted-foreground text-center space-y-1">
              <p>Version démo - Les connexions simulent l'OAuth Discord</p>
              <p>Cliquez pour alterner entre les différents rôles utilisateur</p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-slate-400 text-sm">
            Discord Enterprise Management System v1.0
          </p>
        </div>
      </div>
    </div>
  )
}