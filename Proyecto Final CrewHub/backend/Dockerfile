FROM php:8.4-fpm-alpine
# Instalamos extensiones necesarias
RUN apk add --no-cache \
    autoconf g++ make openssl-dev icu-dev zlib-dev libzip-dev linux-headers

RUN pecl install mongodb \
    && docker-php-ext-enable mongodb \
    && docker-php-ext-install pdo_mysql zip intl

RUN docker-php-ext-install pdo pdo_mysql pcntl

# Composer y Caddy
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
COPY --from=caddy:latest /usr/bin/caddy /usr/bin/caddy

WORKDIR /var/www/html

# Copiamos solo el contenido de nuestra carpeta src
COPY src/ ./

RUN chown -R www-data:www-data storage bootstrap/cache

EXPOSE 80

CMD php-fpm -D && caddy run --config /etc/caddy/Caddyfile --adapter caddyfile