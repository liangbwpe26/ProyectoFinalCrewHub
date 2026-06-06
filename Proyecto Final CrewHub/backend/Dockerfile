FROM php:8.4-fpm

# Descargamos el instalador oficial de extensiones de PHP para Docker
ADD https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/

# Instalamos las extensiones sin tener que lidiar con dependencias de Alpine/Debian
RUN chmod +x /usr/local/bin/install-php-extensions && \
    install-php-extensions mongodb pdo_mysql zip intl pcntl

# Copiamos Composer y Caddy
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
COPY --from=caddy:latest /usr/bin/caddy /usr/bin/caddy

WORKDIR /var/www/html

# Copiamos el contenido
COPY src/ ./

RUN chown -R www-data:www-data storage bootstrap/cache

# Evitamos que la compilación se detenga si no hay conexión a BD en este paso
RUN php artisan storage:link || true

RUN echo "upload_max_filesize = 100M" >> /usr/local/etc/php/conf.d/uploads.ini
RUN echo "post_max_size = 100M" >> /usr/local/etc/php/conf.d/uploads.ini

EXPOSE 80

CMD php-fpm -D && caddy run --config /etc/caddy/Caddyfile --adapter caddyfile