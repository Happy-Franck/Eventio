# Documentation API Eventio

## Configuration

### Technologies utilisées
- **Laravel 12** - Framework PHP
- **Laravel Sanctum** - Authentification API avec tokens
- **Laravel Socialite** - Authentification OAuth (Google, Facebook)
- **MySQL** - Base de données

### Variables d'environnement (.env)

```env
# Application
APP_URL=http://localhost

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=eventio
DB_USERNAME=root
DB_PASSWORD=

# OAuth Google
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost/api/auth/google/callback

# OAuth Facebook
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret
FACEBOOK_REDIRECT_URI=http://localhost/api/auth/facebook/callback
```

## Structure de la base de données

### Table `users`
| Champ | Type | Description |
|-------|------|-------------|
| id | bigint | ID unique |
| name | string | Nom de l'utilisateur |
| email | string | Email (unique) |
| password | string (nullable) | Mot de passe hashé |
| provider | string (nullable) | Provider OAuth (google, facebook) |
| provider_id | string (nullable) | ID du provider OAuth |
| email_verified_at | timestamp | Date de vérification email |
| created_at | timestamp | Date de création |
| updated_at | timestamp | Date de modification |

### Table `personal_access_tokens`
Gérée automatiquement par Sanctum pour les tokens d'authentification.

---

## Endpoints API

Base URL: `http://localhost/api`

### 1. Inscription (Register)

**Endpoint:** `POST /api/register`

**Body (JSON):**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

**Réponse (201):**
```json
{
  "access_token": "1|abcdef123456...",
  "token_type": "Bearer",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2026-01-25T22:00:00.000000Z",
    "updated_at": "2026-01-25T22:00:00.000000Z"
  }
}
```

**Erreurs possibles:**
- `422` - Validation échouée (email déjà utilisé, mot de passe trop court, etc.)

---

### 2. Connexion (Login)

**Endpoint:** `POST /api/login`

**Body (JSON):**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Réponse (200):**
```json
{
  "access_token": "2|xyz789...",
  "token_type": "Bearer",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Erreurs possibles:**
- `401` - Identifiants invalides
- `422` - Validation échouée

---

### 3. Déconnexion (Logout)

**Endpoint:** `POST /api/logout`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Réponse (200):**
```json
{
  "message": "Logged out successfully"
}
```

**Erreurs possibles:**
- `401` - Token invalide ou expiré

---

### 4. Obtenir l'utilisateur connecté

**Endpoint:** `GET /api/user`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Réponse (200):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "provider": null,
  "provider_id": null,
  "email_verified_at": null,
  "created_at": "2026-01-25T22:00:00.000000Z",
  "updated_at": "2026-01-25T22:00:00.000000Z"
}
```

**Erreurs possibles:**
- `401` - Non authentifié

---

### 5. Authentification OAuth - Redirection

**Endpoint:** `GET /api/auth/{provider}`

**Providers disponibles:** `google`, `facebook`

**Exemple:** `GET /api/auth/google`

**Comportement:**
- Redirige l'utilisateur vers la page de connexion du provider OAuth
- L'utilisateur autorise l'application
- Le provider redirige vers le callback

---

### 6. Authentification OAuth - Callback

**Endpoint:** `GET /api/auth/{provider}/callback`

**Exemple:** `GET /api/auth/google/callback?code=...&state=...`

**Réponse (200):**
```json
{
  "access_token": "3|oauth123...",
  "token_type": "Bearer",
  "user": {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@gmail.com",
    "provider": "google",
    "provider_id": "1234567890"
  }
}
```

**Erreurs possibles:**
- `500` - Échec de l'authentification OAuth

---

## Utilisation des tokens

Tous les endpoints protégés nécessitent un token Bearer dans le header:

```
Authorization: Bearer {access_token}
```

### Exemple avec cURL:
```bash
curl -X GET http://localhost/api/user \
  -H "Authorization: Bearer 1|abcdef123456..." \
  -H "Accept: application/json"
```

### Exemple avec JavaScript (Fetch):
```javascript
fetch('http://localhost/api/user', {
  headers: {
    'Authorization': 'Bearer 1|abcdef123456...',
    'Accept': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

---

## Configuration OAuth

### Google OAuth

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un nouveau projet ou sélectionner un projet existant
3. Activer l'API "Google+ API"
4. Créer des identifiants OAuth 2.0:
   - Type: Application Web
   - URI de redirection autorisée: `http://localhost/api/auth/google/callback`
5. Copier le Client ID et Client Secret dans `.env`

### Facebook OAuth

1. Aller sur [Facebook Developers](https://developers.facebook.com/)
2. Créer une nouvelle application
3. Ajouter le produit "Facebook Login"
4. Configurer les paramètres:
   - URI de redirection OAuth valides: `http://localhost/api/auth/facebook/callback`
5. Copier l'ID de l'app et la clé secrète dans `.env`

---

## Sécurité

### Bonnes pratiques implémentées:

1. **Hachage des mots de passe** - Utilisation de bcrypt via Laravel
2. **Tokens Sanctum** - Tokens sécurisés pour l'authentification API
3. **Validation des données** - Validation stricte des inputs
4. **Protection CSRF** - Gérée automatiquement par Laravel
5. **Middleware auth:sanctum** - Protection des routes sensibles

### Recommandations:

- Utiliser HTTPS en production
- Configurer CORS correctement
- Implémenter un rate limiting
- Ajouter la vérification d'email
- Implémenter un système de refresh tokens

---

## Tests avec Postman

### Collection Postman

1. **Register**
   - Method: POST
   - URL: `http://localhost/api/register`
   - Body: raw JSON

2. **Login**
   - Method: POST
   - URL: `http://localhost/api/login`
   - Body: raw JSON

3. **Get User**
   - Method: GET
   - URL: `http://localhost/api/user`
   - Headers: `Authorization: Bearer {{token}}`

4. **Logout**
   - Method: POST
   - URL: `http://localhost/api/logout`
   - Headers: `Authorization: Bearer {{token}}`

---

## Commandes utiles

```bash
# Lancer les migrations
php artisan migrate

# Créer un nouveau contrôleur
php artisan make:controller NomController

# Créer un nouveau modèle avec migration
php artisan make:model NomModel -m

# Vider le cache
php artisan cache:clear
php artisan config:clear

# Lancer le serveur de développement
php artisan serve
```

---

## Prochaines étapes

- [ ] Créer les modèles Events, Tickets, Categories
- [ ] Implémenter la gestion des événements (CRUD)
- [ ] Ajouter la gestion des tickets
- [ ] Implémenter les paiements
- [ ] Ajouter la recherche et les filtres
- [ ] Créer un système de notifications
- [ ] Implémenter les rôles et permissions
