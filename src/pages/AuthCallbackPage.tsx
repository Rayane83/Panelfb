import { useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'

export function AuthCallbackPage() {
  const { isLoading } = useAuth()

  useEffect(() => {
    // Le traitement du callback est géré dans AuthProvider
    // Cette page sert juste d'interface de chargement
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Authentification en cours...</h2>
          <p className="text-slate-300">
            Traitement de votre connexion Discord
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-slate-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Récupération des rôles Discord</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-slate-400">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-700"></div>
            <span>Configuration des permissions</span>
          </div>
        </div>
      </div>
    </div>
  )
}