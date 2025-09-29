# FlashbackFA Enterprise Management System

## 🎯 **Objectif Principal**

Système d'**automatisation** pour :
- ✅ **Remplissage automatique des fiches d'impôts**
- ✅ **Export des données vers le DOT**
- ✅ **Gestion des fiches de blanchiment**
- ✅ **Calcul et gestion des salaires d'entreprises**

## Configuration Discord OAuth

### 1. Configuration Discord Developer Portal

1. Allez sur https://discord.com/developers/applications
2. Créez une nouvelle application ou sélectionnez une existante
3. **Créez un Bot** - Dans l'onglet "Bot" :
   - Cliquez sur "Add Bot"
   - Copiez le **Bot Token** (gardez-le secret !)
   - Activez les **Privileged Gateway Intents** : Server Members Intent
4. **Pour OAuth2** - Dans l'onglet "OAuth2" :
   - **Redirect URIs** : Ajoutez exactement `https://flashbackfa-entreprise.fr/auth/callback`
   - **Scopes** : Sélectionnez `identify`, `email`, `guilds`
5. **Invitez le bot** dans vos serveurs avec les permissions :
   - Read Messages/View Channels
   - View Server Members

### 2. Variables d'environnement

**OBLIGATOIRES** - Configurez ces variables :

```env
VITE_DISCORD_CLIENT_ID=votre_client_id_discord
VITE_DISCORD_CLIENT_SECRET=votre_client_secret_discord
VITE_DISCORD_BOT_TOKEN=votre_bot_token_discord
VITE_DISCORD_REDIRECT_URI=https://flashbackfa-entreprise.fr/auth/callback
VITE_APP_URL=https://flashbackfa-entreprise.fr
VITE_MAIN_GUILD_ID=id_de_votre_guilde_principale
VITE_DOT_GUILD_ID=id_de_votre_guilde_dot
```

### 3. Système de rôles basé sur les vrais rôles Discord

L'application utilise un **bot Discord** pour récupérer les vrais rôles :
- **Fondateur** (ID: 462716512252329996) → SuperAdmin automatique + seul à pouvoir promouvoir Superviseurs
- **Rôles contenant "superviseur", "admin"** → Superviseur (permissions SuperAdmin)
- **Rôles contenant "dot", "directeur"** → DOT
- **Rôles contenant "patron", "owner"** → Patron
- **Rôles contenant "co-patron", "vice"** → Co-Patron
- **Propriétaire de guilde** → Patron (guilde principale) ou DOT (guilde DOT)
- **Autres membres** → Employé

### 4. Avantages du nouveau système

✅ **Plus de F5 nécessaire** - Navigation fluide sans rechargement
✅ **Vrais rôles Discord** - Récupération via bot Discord
✅ **Fondateur privilégié** - SuperAdmin automatique
✅ **Logo FlashbackFA** - Branding personnalisé
✅ **Interface moderne** - Design professionnel

## Déploiement

L'application est déployée sur : https://flashbackfa-entreprise.fr

## Fonctionnalités

### Authentification
- ✅ Authentification Discord OAuth
- ✅ Bot Discord pour récupération des rôles réels
- ✅ Fondateur avec privilèges SuperAdmin
- ✅ Support multi-guildes
- ✅ Dashboard multi-onglets
- ✅ Gestion des entreprises
- ✅ Calcul de salaires
- ✅ Gestion fiscale
- ✅ Administration système