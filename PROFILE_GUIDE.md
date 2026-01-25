# Guide d'utilisation - Profil et Reset Password

## Fonctionnalités implémentées

### 1. Reset Password (Mot de passe oublié)

Le système de reset password est maintenant configuré pour envoyer un email avec un lien vers votre frontend.

**Configuration requise:**
- Dans `api/.env`, la variable `FRONTEND_URL` doit pointer vers votre frontend (déjà configuré: `http://localhost:3010`)
- Le lien de reset sera: `http://localhost:3010/reset-password?token={token}&email={email}`

**Flux:**
1. L'utilisateur va sur `/forgot-password`
2. Entre son email
3. Reçoit un email avec le lien de reset
4. Clique sur le lien qui l'amène à `/reset-password?token=xxx&email=xxx`
5. Entre son nouveau mot de passe
6. Le mot de passe est réinitialisé

**Note:** En développement, les emails sont loggés dans `api/storage/logs/laravel.log` (voir `MAIL_MAILER=log` dans `.env`)

### 2. Édition de profil

Nouvelle page `/profile` accessible depuis le dashboard.

**Fonctionnalités:**
- ✅ Modifier le nom
- ✅ Modifier l'email
- ✅ Changer le mot de passe (avec vérification de l'ancien)
- ✅ Supprimer le compte (avec confirmation par mot de passe)

**Endpoints API:**
- `GET /api/profile` - Récupérer le profil
- `PUT /api/profile` - Mettre à jour nom/email
- `PUT /api/profile/password` - Changer le mot de passe
- `DELETE /api/profile` - Supprimer le compte

### 3. Navigation

Le dashboard a maintenant un bouton "Profile Settings" dans la navbar pour accéder facilement au profil.

## Test du système

### Tester le reset password:

1. Allez sur `http://localhost:3010/forgot-password`
2. Entrez votre email
3. Vérifiez le log: `tail -f api/storage/logs/laravel.log`
4. Copiez le token du log
5. Allez sur `http://localhost:3010/reset-password?token={token}&email={votre_email}`
6. Entrez un nouveau mot de passe
7. Connectez-vous avec le nouveau mot de passe

### Tester l'édition de profil:

1. Connectez-vous
2. Cliquez sur "Profile Settings" dans le dashboard
3. Modifiez votre nom ou email
4. Changez votre mot de passe
5. Vérifiez que les changements sont sauvegardés

## Configuration OAuth (optionnel)

Pour que Google et Facebook OAuth fonctionnent, vous devez configurer dans `api/.env`:

```env
GOOGLE_CLIENT_ID=votre_client_id
GOOGLE_CLIENT_SECRET=votre_client_secret

FACEBOOK_CLIENT_ID=votre_app_id
FACEBOOK_CLIENT_SECRET=votre_app_secret
```

Voir les instructions dans la réponse précédente pour obtenir ces identifiants.

## Documentation

La documentation complète des endpoints est dans `api/API_ENDPOINTS.md`.
