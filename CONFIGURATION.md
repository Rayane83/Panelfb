# 🔧 Guide de Configuration Discord Enterprise

## 📋 Checklist de Configuration

### ✅ 1. Discord Developer Portal

1. **Créer une application Discord** :
   - Allez sur https://discord.com/developers/applications
   - Cliquez sur "New Application"
   - Donnez un nom à votre application

2. **Configuration OAuth2** :
   - Onglet "OAuth2" → "General"
   - **Client ID** : Copiez votre Client ID
   - **Client Secret** : Copiez votre Client Secret
   - **Redirects** : Ajoutez `https://monumental-gaufre-97d575.netlify.app/auth/callback`

3. **Configuration Bot** :
   - Onglet "Bot"
   - Cliquez sur "Add Bot" si pas encore fait
   - **Token** : Copiez le token du bot (gardez-le secret !)
   - **Permissions requises** :
     - ✅ Read Messages/View Channels
     - ✅ Manage Roles
     - ✅ View Server Members

### ✅ 2. Variables d'Environnement

Configurez ces variables dans votre fichier `.env` :

```env
VITE_DISCORD_CLIENT_ID=votre_client_id_ici
VITE_DISCORD_CLIENT_SECRET=votre_client_secret_ici
VITE_DISCORD_BOT_TOKEN=votre_bot_token_ici
VITE_DISCORD_REDIRECT_URI=https://monumental-gaufre-97d575.netlify.app/auth/callback
VITE_APP_URL=https://monumental-gaufre-97d575.netlify.app
```

### ✅ 3. Configuration des Rôles Discord

1. **Activez le mode développeur** dans Discord :
   - Paramètres utilisateur → Avancé → Mode développeur ✅

2. **Récupérez les IDs des rôles** :
   - Dans votre serveur Discord
   - Clic droit sur chaque rôle → "Copier l'ID"

3. **Modifiez le fichier `src/lib/discord.ts`** :
   ```typescript
   export const ROLE_MAPPING = {
     'ID_ROLE_SUPERADMIN': 'superadmin',    // Ex: '987654321098765432'
     'ID_ROLE_STAFF': 'staff',              // Ex: '987654321098765433'
     'ID_ROLE_DOT': 'dot',                  // Ex: '987654321098765434'
     'ID_ROLE_PATRON': 'patron',            // Ex: '987654321098765435'
     'ID_ROLE_CO_PATRON': 'co_patron',      // Ex: '987654321098765436'
     'ID_ROLE_EMPLOYEE': 'employee'         // Ex: '987654321098765437'
   }
   ```

### ✅ 4. Inviter le Bot dans vos Serveurs

1. **Générer le lien d'invitation** :
   - Discord Developer Portal → OAuth2 → URL Generator
   - **Scopes** : `bot`
   - **Permissions** : `Manage Roles`, `Read Messages/View Channels`, `View Server Members`

2. **Inviter le bot** dans tous vos serveurs d'entreprise

### ✅ 5. Test de Configuration

1. **Vérifiez que toutes les variables sont définies**
2. **Testez l'authentification** sur l'application
3. **Vérifiez que les rôles sont correctement détectés**

## 🚨 Problèmes Courants

### "Corps de formulaire non valide"
- ❌ Variables d'environnement manquantes
- ❌ URL de redirection incorrecte
- ❌ Scopes OAuth mal configurés

### "Impossible de récupérer les rôles"
- ❌ Bot token manquant
- ❌ Bot pas invité dans le serveur
- ❌ Permissions insuffisantes du bot

### "Accès refusé"
- ❌ IDs de rôles incorrects dans ROLE_MAPPING
- ❌ Utilisateur n'a pas les bons rôles Discord

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez cette checklist
2. Consultez les logs de l'application
3. Vérifiez la configuration Discord Developer Portal