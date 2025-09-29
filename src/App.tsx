import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './components/providers/AuthProvider'
import { ThemeProvider } from './hooks/useTheme'
import { useAuth } from './hooks/useAuth'
import { usePermissions } from './hooks/usePermissions'
import { Header } from './components/layout/Header'
import Dashboard from './pages/Dashboard'
import { AuthPage } from './pages/AuthPage'
import { CompanyConfigPage } from './pages/CompanyConfigPage'
import SuperAdminPage from './pages/SuperAdminPage'
import { HWIPAdminPage } from './pages/HWIPAdminPage'
import StaffPage from './pages/StaffPage'
import { AuthCallbackPage } from './pages/AuthCallbackPage'

const queryClient = new QueryClient()

function ProtectedRoute({ children, requiredRoute }: { children: React.ReactNode, requiredRoute?: string }) {
  const { isAuthenticated, isLoading } = useAuth()
  const { canAccessRoute } = usePermissions()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  if (requiredRoute && !canAccessRoute(requiredRoute)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Accès Refusé</h2>
          <p className="text-muted-foreground">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>
    </>
  )
}

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = window.location.pathname

  // Redirection après authentification vers la page demandée
  useEffect(() => {
    if (!isAuthenticated && location !== '/auth' && location !== '/auth/callback') {
      sessionStorage.setItem('intendedPath', location)
    }
  }, [isAuthenticated, location])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-lg font-medium text-muted-foreground">Initialisation du système...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route 
        path="/auth" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />} 
      />
      <Route 
        path="/auth/callback" 
        element={<AuthCallbackPage />} 
      />
      <Route 
        path="/" 
        element={
          <ProtectedRoute requiredRoute="/">
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/patron-config" 
        element={
          <ProtectedRoute requiredRoute="/patron-config">
            <CompanyConfigPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/superadmin" 
        element={
          <ProtectedRoute requiredRoute="/superadmin">
            <SuperAdminPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/hwip-admin" 
        element={
          <ProtectedRoute requiredRoute="/hwip-admin">
            <HWIPAdminPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/staff" 
        element={
          <ProtectedRoute requiredRoute="/staff">
            <StaffPage />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
              <AppRoutes />
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}