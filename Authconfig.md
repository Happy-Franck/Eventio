Les erreurs que vous rencontrez sont normales - elles indiquent que les identifiants OAuth pour Google et Facebook ne sont pas configurés. Vérifions vos fichiers de configuration :

Read file(s)

.env

.env.example

.env.local
Parfait, je vois le problème. Les variables GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, FACEBOOK_CLIENT_ID et FACEBOOK_CLIENT_SECRET sont vides dans votre fichier .env.

Pour résoudre ces erreurs, vous devez :

1. Pour Google OAuth
Allez sur Google Cloud Console
Créez un nouveau projet ou sélectionnez-en un existant
Activez l'API "Google+ API" ou "Google Identity"
Allez dans "Identifiants" → "Créer des identifiants" → "ID client OAuth 2.0"
Configurez l'écran de consentement OAuth
Ajoutez ces URI de redirection autorisées :
http://localhost:8000/api/auth/google/callback
Copiez le Client ID et le Client Secret
2. Pour Facebook OAuth
Allez sur Facebook Developers
Créez une nouvelle application
Ajoutez le produit "Facebook Login"
Dans les paramètres de Facebook Login, ajoutez ces URI de redirection OAuth valides :
http://localhost:8000/api/auth/facebook/callback
Copiez l'App ID et l'App Secret
3. Mettez à jour votre fichier .env
Une fois que vous avez vos identifiants, mettez à jour 
.env
 :

GOOGLE_CLIENT_ID=votre_google_client_id_ici
GOOGLE_CLIENT_SECRET=votre_google_client_secret_ici

FACEBOOK_CLIENT_ID=votre_facebook_app_id_ici
FACEBOOK_CLIENT_SECRET=votre_facebook_app_secret_ici
4. Redémarrez votre serveur Laravel
Après avoir modifié le .env, redémarrez votre serveur :

php artisan config:clear
php artisan cache:clear
Les erreurs que vous voyez sont normales car l'application essaie de se connecter à Google/Facebook sans les identifiants nécessaires. Une fois configurés, l'authentification OAuth fonctionnera correctement.




