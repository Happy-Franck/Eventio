#!/bin/bash

# Script pour extraire les liens d'emails des logs Laravel

LOG_FILE="storage/logs/laravel.log"

if [ ! -f "$LOG_FILE" ]; then
    echo "❌ Fichier de log introuvable: $LOG_FILE"
    exit 1
fi

echo "📧 Extraction des emails depuis les logs..."
echo ""

# Dernier lien de vérification
echo "🔐 DERNIER LIEN DE VÉRIFICATION:"
grep -o "verify-email?token=[^&]*&email=[^ ]*" "$LOG_FILE" | tail -1 | sed 's/^/http:\/\/localhost:3010\//'
echo ""

# Dernier code OTP
echo "🔢 DERNIER CODE OTP:"
grep -oP "Your verification code is:\s*\K\d{6}" "$LOG_FILE" | tail -1
echo ""

# Dernier magic link
echo "✨ DERNIER MAGIC LINK:"
grep -o "magic-link?token=[^ ]*" "$LOG_FILE" | tail -1 | sed 's/^/http:\/\/localhost:3010\//'
echo ""

# Dernier lien de reset password
echo "🔑 DERNIER LIEN DE RESET PASSWORD:"
grep -o "reset-password?token=[^&]*&email=[^ ]*" "$LOG_FILE" | tail -1 | sed 's/^/http:\/\/localhost:3010\//'
echo ""

echo "💡 Astuce: Pour voir les 10 derniers emails:"
echo "   tail -100 $LOG_FILE | grep -A 20 'Subject:'"
