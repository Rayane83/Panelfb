import { useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'

export function AuthCallbackPage() {
  const { isLoading, isAuthenticated } = useAuth()

  useEffect(() => {
    // Rediriger vers le dashboard une fois authentifié
    if (isAuthenticated) {
      const intendedPath = sessionStorage.getItem('intendedPath') || '/'
      sessionStorage.removeItem('intendedPath')
      window.location.href = intendedPath
    }
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
          <p className="text-slate-400 text-sm">
            Redirection automatique vers le tableau de bord...
          </p>
        </div>
      </div>
    </div>
  )
}