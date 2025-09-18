import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { AlertTriangle, Shield, Users, Building2 } from 'lucide-react'

export function ConfigStaffTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <AlertTriangle className="h-6 w-6 text-red-500" />
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-red-600">Configuration Staff</h2>
          <p className="text-muted-foreground">
            Cette section a été déplacée vers des pages dédiées
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Gestion Staff</span>
            </CardTitle>
            <CardDescription className="text-blue-700">
              Gestion du blanchiment et suivi des dotations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-800 mb-4">
              Activez/désactivez le blanchiment par entreprise et suivez le statut des dotations.
            </p>
            <Button asChild className="w-full">
              <a href="/staff">
                <Users className="mr-2 h-4 w-4" />
                Accéder à la Gestion Staff
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-purple-800 flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Administration SuperAdmin</span>
            </CardTitle>
            <CardDescription className="text-purple-700">
              Gestion complète des entreprises et grilles fiscales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-purple-800 mb-4">
              Créez des entreprises, configurez les secteurs et gérez les grilles d'imposition.
            </p>
            <Button asChild className="w-full" variant="outline">
              <a href="/superadmin">
                <Shield className="mr-2 h-4 w-4" />
                Accéder au SuperAdmin
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fonctionnalités Disponibles</CardTitle>
          <CardDescription>
            Aperçu des outils de gestion disponibles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Page Staff (/staff)</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Activation/désactivation du blanchiment</li>
                <li>• Suivi des dotations par entreprise</li>
                <li>• Alertes pour les retards</li>
                <li>• Recherche et filtrage</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Page SuperAdmin (/superadmin)</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Création d'entreprises</li>
                <li>• Gestion des secteurs</li>
                <li>• Configuration des grilles fiscales</li>
                <li>• Import Excel/CSV des barèmes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}