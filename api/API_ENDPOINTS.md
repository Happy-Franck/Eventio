# API Endpoints Documentation

Base URL: `http://localhost:8000/api`

## Authentication Endpoints

### 1. Register
**POST** `/auth/register`

Crée un nouveau compte utilisateur.

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

**Response (201):**
```json
{
  "access_token": "1|xxxxxxxxxxxxx",
  "token_type": "Bearer",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2026-01-26T10:00:00.000000Z",
    "updated_at": "2026-01-26T10:00:00.000000Z"
  }
}
```

---

### 2. Login
**POST** `/auth/login`

Authentifie un utilisateur existant.

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "access_token": "2|xxxxxxxxxxxxx",
  "token_type": "Bearer",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2026-01-26T10:00:00.000000Z",
    "updated_at": "2026-01-26T10:00:00.000000Z"
  }
}
```

**Error Response (401):**
```json
{
  "message": "Invalid credentials"
}
```

---

### 3. Logout
**POST** `/logout`

Déconnecte l'utilisateur actuel (révoque le token).

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

### 4. Forgot Password
**POST** `/auth/forgot-password`

Envoie un lien de réinitialisation de mot de passe par email.

**Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "message": "Password reset link sent to your email"
}
```

**Error Response (400):**
```json
{
  "message": "Unable to send reset link"
}
```

---

### 5. Reset Password
**POST** `/auth/reset-password`

Réinitialise le mot de passe avec le token reçu par email.

**Body:**
```json
{
  "token": "reset_token_from_email",
  "email": "john@example.com",
  "password": "newpassword123",
  "password_confirmation": "newpassword123"
}
```

**Response (200):**
```json
{
  "message": "Password has been reset successfully"
}
```

**Error Response (400):**
```json
{
  "message": "Unable to reset password"
}
```

---

### 6. Get Current User
**GET** `/user`

Récupère les informations de l'utilisateur authentifié.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "email_verified_at": null,
  "created_at": "2026-01-26T10:00:00.000000Z",
  "updated_at": "2026-01-26T10:00:00.000000Z"
}
```

---

## OAuth Endpoints

### 7. OAuth Redirect
**GET** `/auth/{provider}`

Redirige vers le provider OAuth (google, facebook).

**Example:**
- `GET /auth/google`
- `GET /auth/facebook`

---

### 8. OAuth Callback
**GET** `/auth/{provider}/callback`

Gère le callback OAuth et crée/connecte l'utilisateur.

**Response (200):**
```json
{
  "access_token": "3|xxxxxxxxxxxxx",
  "token_type": "Bearer",
  "user": {
    "id": 2,
    "name": "John Doe",
    "email": "john@example.com",
    "provider": "google",
    "provider_id": "123456789",
    "created_at": "2026-01-26T10:00:00.000000Z",
    "updated_at": "2026-01-26T10:00:00.000000Z"
  }
}
```

---

## Profile Management Endpoints

### 9. Get Profile
**GET** `/profile`

Récupère le profil de l'utilisateur authentifié.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "email_verified_at": null,
  "created_at": "2026-01-26T10:00:00.000000Z",
  "updated_at": "2026-01-26T10:00:00.000000Z"
}
```

---

### 10. Update Profile
**PUT** `/profile`

Met à jour les informations du profil.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Body:**
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com"
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "name": "John Smith",
    "email": "johnsmith@example.com",
    "email_verified_at": null,
    "created_at": "2026-01-26T10:00:00.000000Z",
    "updated_at": "2026-01-26T10:00:00.000000Z"
  }
}
```

---

### 11. Update Password
**PUT** `/profile/password`

Change le mot de passe de l'utilisateur.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Body:**
```json
{
  "current_password": "oldpassword123",
  "password": "newpassword123",
  "password_confirmation": "newpassword123"
}
```

**Response (200):**
```json
{
  "message": "Password updated successfully"
}
```

**Error Response (422):**
```json
{
  "message": "Current password is incorrect"
}
```

---

### 12. Delete Account
**DELETE** `/profile`

Supprime le compte utilisateur.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Body:**
```json
{
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Account deleted successfully"
}
```

**Error Response (422):**
```json
{
  "message": "Password is incorrect"
}
```

---

## Notes d'utilisation

### Authentication
Pour les routes protégées, inclure le header:
```
Authorization: Bearer {access_token}
```

### CORS
Le frontend sur `http://localhost:3010` est autorisé.

### Validation Errors
Format des erreurs de validation (422):
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password must be at least 8 characters."]
  }
}
```
