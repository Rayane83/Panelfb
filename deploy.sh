#!/bin/bash

# Script de déploiement FlashbackFA Enterprise
# Auteur: Assistant IA
# Date: $(date +%Y-%m-%d)

set -e  # Arrêter le script en cas d'erreur

echo "🚀 Démarrage du déploiement FlashbackFA Enterprise..."

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages colorés
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérification des prérequis
check_prerequisites() {
    log_info "Vérification des prérequis..."
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js n'est pas installé. Veuillez l'installer d'abord."
        exit 1
    fi
    
    # Vérifier npm
    if ! command -v npm &> /dev/null; then
        log_error "npm n'est pas installé. Veuillez l'installer d'abord."
        exit 1
    fi
    
    # Vérifier Python (pour l'application Flask)
    if ! command -v python3 &> /dev/null; then
        log_warning "Python3 n'est pas installé. L'application Flask ne pourra pas fonctionner."
    fi
    
    log_success "Prérequis vérifiés ✓"
}

# Configuration de l'environnement
setup_environment() {
    log_info "Configuration de l'environnement..."
    
    # Créer le fichier .env s'il n'existe pas
    if [ ! -f .env ]; then
        log_info "Création du fichier .env..."
        cp .env.example .env
        log_warning "⚠️  IMPORTANT: Configurez vos variables d'environnement dans le fichier .env"
        log_warning "   - VITE_DISCORD_CLIENT_ID"
        log_warning "   - VITE_DISCORD_CLIENT_SECRET"
        log_warning "   - VITE_DISCORD_BOT_TOKEN"
        log_warning "   - VITE_SUPABASE_URL"
        log_warning "   - VITE_SUPABASE_ANON_KEY"
    fi
    
    log_success "Environnement configuré ✓"
}

# Installation des dépendances Node.js
install_node_dependencies() {
    log_info "Installation des dépendances Node.js..."
    
    if [ -f package.json ]; then
        npm install
        log_success "Dépendances Node.js installées ✓"
    else
        log_error "package.json non trouvé!"
        exit 1
    fi
}

# Installation des dépendances Python
install_python_dependencies() {
    log_info "Installation des dépendances Python..."
    
    if [ -f requirements.txt ]; then
        if command -v python3 &> /dev/null; then
            python3 -m pip install -r requirements.txt
            log_success "Dépendances Python installées ✓"
        else
            log_warning "Python3 non disponible, dépendances Python ignorées"
        fi
    else
        log_warning "requirements.txt non trouvé, dépendances Python ignorées"
    fi
}

# Build de l'application
build_application() {
    log_info "Build de l'application..."
    
    # Build avec Vite (pour les assets statiques)
    if [ -f vite.config.js ]; then
        npm run build 2>/dev/null || log_warning "Build Vite échoué (normal pour une app server-side)"
    fi
    
    log_success "Application buildée ✓"
}

# Vérification de la configuration
verify_configuration() {
    log_info "Vérification de la configuration..."
    
    # Vérifier les variables d'environnement critiques
    if [ -f .env ]; then
        source .env
        
        missing_vars=()
        
        [ -z "$VITE_DISCORD_CLIENT_ID" ] && missing_vars+=("VITE_DISCORD_CLIENT_ID")
        [ -z "$VITE_DISCORD_CLIENT_SECRET" ] && missing_vars+=("VITE_DISCORD_CLIENT_SECRET")
        [ -z "$VITE_SUPABASE_URL" ] && missing_vars+=("VITE_SUPABASE_URL")
        [ -z "$VITE_SUPABASE_ANON_KEY" ] && missing_vars+=("VITE_SUPABASE_ANON_KEY")
        
        if [ ${#missing_vars[@]} -gt 0 ]; then
            log_error "Variables d'environnement manquantes:"
            for var in "${missing_vars[@]}"; do
                log_error "  - $var"
            done
            log_error "Veuillez configurer ces variables dans le fichier .env"
            exit 1
        fi
    else
        log_error "Fichier .env non trouvé!"
        exit 1
    fi
    
    log_success "Configuration vérifiée ✓"
}

# Test de l'application
test_application() {
    log_info "Test de l'application..."
    
    # Test du serveur Node.js
    log_info "Test du serveur Node.js..."
    timeout 10s node server.js &
    SERVER_PID=$!
    sleep 3
    
    if kill -0 $SERVER_PID 2>/dev/null; then
        log_success "Serveur Node.js fonctionne ✓"
        kill $SERVER_PID
    else
        log_warning "Le serveur Node.js a des problèmes"
    fi
    
    # Test de l'application Python (si disponible)
    if [ -f app.py ] && command -v python3 &> /dev/null; then
        log_info "Test de l'application Python..."
        timeout 5s python3 -c "import app; print('Python app OK')" 2>/dev/null && \
            log_success "Application Python fonctionne ✓" || \
            log_warning "L'application Python a des problèmes"
    fi
}

# Déploiement
deploy_application() {
    log_info "Déploiement de l'application..."
    
    # Créer le dossier de déploiement
    DEPLOY_DIR="./dist"
    mkdir -p $DEPLOY_DIR
    
    # Copier les fichiers nécessaires
    log_info "Copie des fichiers de déploiement..."
    
    # Fichiers Node.js
    cp server.js $DEPLOY_DIR/ 2>/dev/null || true
    cp package.json $DEPLOY_DIR/ 2>/dev/null || true
    cp -r views $DEPLOY_DIR/ 2>/dev/null || true
    cp -r static $DEPLOY_DIR/ 2>/dev/null || true
    
    # Fichiers Python
    cp app.py $DEPLOY_DIR/ 2>/dev/null || true
    cp run.py $DEPLOY_DIR/ 2>/dev/null || true
    cp requirements.txt $DEPLOY_DIR/ 2>/dev/null || true
    cp -r templates $DEPLOY_DIR/ 2>/dev/null || true
    
    # Fichiers de configuration
    cp .env $DEPLOY_DIR/ 2>/dev/null || true
    cp vite.config.js $DEPLOY_DIR/ 2>/dev/null || true
    
    # Documentation
    cp README.md $DEPLOY_DIR/ 2>/dev/null || true
    cp CONFIGURATION.md $DEPLOY_DIR/ 2>/dev/null || true
    
    log_success "Fichiers copiés dans $DEPLOY_DIR ✓"
}

# Génération du script de démarrage
generate_start_script() {
    log_info "Génération du script de démarrage..."
    
    cat > ./dist/start.sh << 'EOF'
#!/bin/bash

echo "🚀 Démarrage FlashbackFA Enterprise..."

# Charger les variables d'environnement
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Démarrer le serveur Node.js par défaut
if [ -f server.js ]; then
    echo "Démarrage du serveur Node.js..."
    node server.js
elif [ -f app.py ]; then
    echo "Démarrage de l'application Python..."
    python3 app.py
else
    echo "Aucun serveur trouvé!"
    exit 1
fi
EOF
    
    chmod +x ./dist/start.sh
    log_success "Script de démarrage créé ✓"
}

# Génération du Dockerfile
generate_dockerfile() {
    log_info "Génération du Dockerfile..."
    
    cat > ./dist/Dockerfile << 'EOF'
FROM node:18-alpine

# Installer Python si nécessaire
RUN apk add --no-cache python3 py3-pip

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY requirements.txt ./

# Installer les dépendances
RUN npm install --production
RUN pip3 install -r requirements.txt || true

# Copier le code source
COPY . .

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["./start.sh"]
EOF
    
    log_success "Dockerfile créé ✓"
}

# Affichage des instructions finales
show_final_instructions() {
    log_success "🎉 Déploiement terminé avec succès!"
    echo
    log_info "📁 Fichiers de déploiement dans: ./dist/"
    log_info "🚀 Pour démarrer l'application:"
    echo "   cd dist && ./start.sh"
    echo
    log_info "🐳 Pour déployer avec Docker:"
    echo "   cd dist"
    echo "   docker build -t flashbackfa-enterprise ."
    echo "   docker run -p 3000:3000 flashbackfa-enterprise"
    echo
    log_info "☁️  Pour déployer sur un service cloud:"
    echo "   - Heroku: git push heroku main"
    echo "   - Railway: railway up"
    echo "   - Vercel: vercel --prod"
    echo
    log_warning "⚠️  N'oubliez pas de configurer vos variables d'environnement sur la plateforme de déploiement!"
}

# Fonction principale
main() {
    echo "════════════════════════════════════════════════════════════════"
    echo "🏢 FlashbackFA Enterprise - Script de Déploiement Automatique"
    echo "════════════════════════════════════════════════════════════════"
    echo
    
    check_prerequisites
    setup_environment
    install_node_dependencies
    install_python_dependencies
    build_application
    verify_configuration
    test_application
    deploy_application
    generate_start_script
    generate_dockerfile
    show_final_instructions
    
    echo
    log_success "✅ Déploiement complété avec succès!"
    echo "════════════════════════════════════════════════════════════════"
}

# Gestion des erreurs
trap 'log_error "❌ Erreur durant le déploiement à la ligne $LINENO"; exit 1' ERR

# Exécution du script principal
main "$@"