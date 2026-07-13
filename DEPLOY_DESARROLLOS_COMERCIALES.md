# Fichas comerciales de desarrollos

Esta rama convierte las páginas de desarrollos en fichas claras para compradores y brokers.

## Qué cambia

- Distingue **venta**, **renta** y **venta/renta**.
- Identifica producto: casas, townhouses, departamentos, locales, oficinas, etc.
- Muestra ubicación, etapa, estado comercial, precio o renta y disponibilidad.
- Integra brochure, información comercial y esquema de pago o contratación.
- Cuenta automáticamente las unidades con estatus `2` como disponibles.
- Adapta los estados de unidades:
  - Venta: disponible, apartada, vendida.
  - Renta: disponible, en negociación, rentada.
- El SVG queda como plano interactivo opcional.
- Mejora el editor del administrador y el listado interno de proyectos.

## Orden de despliegue sin Terminal

### 1. Respaldo

Desde phpMyAdmin, exportar las tablas:

- `desarrollos`
- `unidades`
- `amenidades`

También descargar una copia de los archivos que se reemplazarán en cPanel.

### 2. Base de datos

En phpMyAdmin seleccionar la base de datos e importar:

`database/sql/2026_07_desarrollos_comerciales.sql`

Este archivo agrega los campos nuevos y clasifica los seis proyectos existentes sin modificar imágenes, brochures, galerías ni unidades.

### 3. Código

Después de importar el SQL, desplegar el código de esta rama.

No subir el código antes del SQL, porque el backend nuevo consulta las columnas comerciales.

### 4. Captura en administrador

Revisar cada proyecto y completar:

- descripción breve;
- venta o renta;
- tipo de producto;
- estado comercial;
- precio o texto de precio;
- ubicación;
- información comercial;
- esquema de compra o contratación;
- brochure;
- SEO.

### 5. Unidades y disponibilidad

El sitio considera `estatus = 2` como disponible.

Para venta:

- `0`: vendida;
- `1`: apartada;
- `2`: disponible.

Para renta:

- `0`: rentada;
- `1`: en negociación;
- `2`: disponible.

## Datos precargados

- **Residente:** residencial, venta, departamentos, próximamente.
- **Kantera:** residencial, venta, casas, consultar disponibilidad.
- **Dzityá 7:** residencial, venta, townhouses, 100% vendido.
- **Plaza Las Vías:** comercial, renta, locales, en operación.
- **Plaza Faro:** comercial, renta, locales, en operación.
- **Arenna:** residencial, venta, casas y townhouses, disponible.

Los precios y disponibilidades definitivas deben confirmarse y capturarse desde el administrador.
