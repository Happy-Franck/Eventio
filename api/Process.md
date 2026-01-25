composer create-project laravel/laravel api

git init
git add 
git commit -m "siuuu"
git branch -M main
git remote add origin https://github.com/Happy-Franck/Eventio.git
git push -u origin main

sudo /opt/lampp/lampp start
sudo apt install php-mysql
sudo apt install -y php php-cli php-common php-mbstring php-xml php-bcmath php-tokenizer php-json php-curl php-zip php-gd php-mysql php-sqlite3 php-intl php-pdo php-fileinfo php-opcache php-dom php-simplexml php-iconv php-memcached php-redis unzip curl git

.env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=eventio
DB_USERNAME=root
DB_PASSWORD=

sanctum
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate

socialite
composer require laravel/socialite
 + modifs services
php artisan make:migration add_oauth_fields_to_users_table --table=users
php artisan migrate

npm create nuxt@latest
