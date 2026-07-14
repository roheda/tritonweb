#!/bin/bash
set -euo pipefail

DEPLOYPATH="/home/tritondesarrollo/public_html"
BACKUP_ROOT="/home/tritondesarrollo/backups"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_PATH="$BACKUP_ROOT/tritonweb-$TIMESTAMP"

FILES_TO_BACKUP=(
  "app/Desarrollo.php"
  "app/Http/Controllers/DesarrollosController.php"
  "routes/web.php"
  "public/administrador/js/services/desarrollosService.js"
  "public/administrador/partials/desarrollos.html"
  "public/administrador/partials/popups/desarrollo.html"
  "public/js/controllers/detalledesarrollocontroller.js"
  "public/partials/desarrollo.html"
  "public/partials/detalleDesarrollo.html"
)

echo "==> Creando respaldo en $BACKUP_PATH"
/bin/mkdir -p "$BACKUP_PATH"

for relative_path in "${FILES_TO_BACKUP[@]}"; do
  source_file="$DEPLOYPATH/$relative_path"
  backup_file="$BACKUP_PATH/$relative_path"

  if [ -e "$source_file" ]; then
    /bin/mkdir -p "$(dirname "$backup_file")"
    /bin/cp -a "$source_file" "$backup_file"
  fi
done

if ! command -v rsync >/dev/null 2>&1; then
  echo "ERROR: rsync no está disponible en el servidor." >&2
  exit 1
fi

# Apache necesita poder atravesar public_html y leer .htaccess.
# No preservamos permisos del clon porque pueden ser más restrictivos.
/bin/chmod 755 "$DEPLOYPATH"

echo "==> Desplegando archivos a $DEPLOYPATH"
/usr/bin/rsync -rlt \
  --no-perms \
  --no-owner \
  --no-group \
  --omit-dir-times \
  --exclude='.git/' \
  --exclude='.github/' \
  --exclude='.env' \
  --exclude='.env.*' \
  --exclude='.cpanel.yml' \
  --exclude='.well-known.zip' \
  --exclude='vendor/' \
  --exclude='node_modules/' \
  --exclude='storage/logs/' \
  --exclude='storage/framework/cache/' \
  --exclude='storage/framework/sessions/' \
  --exclude='storage/framework/views/' \
  --exclude='bootstrap/cache/' \
  --exclude='public/files/' \
  --exclude='public/uploads/' \
  --exclude='database/sql/' \
  --exclude='DEPLOY*.md' \
  ./ "$DEPLOYPATH/"

# Permisos web seguros después del despliegue.
/bin/chmod 755 "$DEPLOYPATH"
if [ -f "$DEPLOYPATH/.htaccess" ]; then
  /bin/chmod 644 "$DEPLOYPATH/.htaccess"
fi
if [ -d "$DEPLOYPATH/public" ]; then
  /bin/chmod 755 "$DEPLOYPATH/public"
fi
if [ -f "$DEPLOYPATH/public/.htaccess" ]; then
  /bin/chmod 644 "$DEPLOYPATH/public/.htaccess"
fi

echo "==> Despliegue completado"
echo "==> Respaldo: $BACKUP_PATH"
