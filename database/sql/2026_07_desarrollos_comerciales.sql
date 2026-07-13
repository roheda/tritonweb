-- Triton Web: información comercial clara para compradores y brokers
-- Importar en phpMyAdmin antes de desplegar el código de esta rama.
-- Este archivo está pensado para una primera instalación: las columnas no deben existir previamente.

SET NAMES utf8mb4;
START TRANSACTION;

ALTER TABLE `desarrollos`
  MODIFY COLUMN `descripcion` TEXT NULL,
  ADD COLUMN `descripcion_corta` VARCHAR(350) NULL AFTER `descripcion`,
  ADD COLUMN `tipo_desarrollo` VARCHAR(30) NULL AFTER `descripcion_corta`,
  ADD COLUMN `tipo_operacion` VARCHAR(20) NULL AFTER `tipo_desarrollo`,
  ADD COLUMN `tipo_producto` VARCHAR(100) NULL AFTER `tipo_operacion`,
  ADD COLUMN `estado_comercial` VARCHAR(40) NULL AFTER `tipo_producto`,
  ADD COLUMN `precio_desde` DECIMAL(14,2) NULL AFTER `estado_comercial`,
  ADD COLUMN `precio_texto` VARCHAR(255) NULL AFTER `precio_desde`,
  ADD COLUMN `mostrar_precio` TINYINT NOT NULL DEFAULT 1 AFTER `precio_texto`,
  ADD COLUMN `etapa` VARCHAR(100) NULL AFTER `mostrar_precio`,
  ADD COLUMN `zona` VARCHAR(150) NULL AFTER `ubicacion`,
  ADD COLUMN `ciudad` VARCHAR(100) NULL AFTER `zona`,
  ADD COLUMN `direccion` VARCHAR(255) NULL AFTER `ciudad`,
  ADD COLUMN `mapa_url` TEXT NULL AFTER `direccion`,
  ADD COLUMN `informacion_comercial` TEXT NULL AFTER `mapa_url`,
  ADD COLUMN `esquema_pago` TEXT NULL AFTER `informacion_comercial`,
  ADD COLUMN `disponibilidad_texto` VARCHAR(255) NULL AFTER `esquema_pago`,
  ADD COLUMN `meta_title` VARCHAR(255) NULL AFTER `disponibilidad_texto`,
  ADD COLUMN `meta_description` VARCHAR(320) NULL AFTER `meta_title`,
  ADD COLUMN `imagen_social` VARCHAR(255) NULL AFTER `meta_description`;

UPDATE `desarrollos`
SET `descripcion_corta` = COALESCE(`descripcion_corta`, `descripcion`),
    `ciudad` = COALESCE(`ciudad`, 'Mérida')
WHERE 1 = 1;

UPDATE `desarrollos`
SET `tipo_desarrollo` = 'residencial',
    `tipo_operacion` = 'venta',
    `tipo_producto` = 'Departamentos',
    `estado_comercial` = 'proximamente',
    `zona` = 'Montecristo',
    `ciudad` = 'Mérida',
    `etapa` = 'Próximamente',
    `mostrar_precio` = 0,
    `disponibilidad_texto` = 'Próximamente',
    `precio_texto` = 'Solicita información de lanzamiento'
WHERE `slug` = 'residente';

UPDATE `desarrollos`
SET `tipo_desarrollo` = 'residencial',
    `tipo_operacion` = 'venta',
    `tipo_producto` = 'Casas',
    `estado_comercial` = 'consultar',
    `zona` = 'Dzityá',
    `ciudad` = 'Mérida',
    `precio_texto` = 'Consulta disponibilidad y precio',
    `disponibilidad_texto` = 'Disponibilidad sujeta a confirmación'
WHERE `slug` = 'kantera';

UPDATE `desarrollos`
SET `tipo_desarrollo` = 'residencial',
    `tipo_operacion` = 'venta',
    `tipo_producto` = 'Townhouses',
    `estado_comercial` = 'vendido',
    `zona` = 'Dzityá',
    `ciudad` = 'Mérida',
    `etapa` = 'Entregado',
    `mostrar_precio` = 0,
    `disponibilidad_texto` = '100% vendido',
    `precio_texto` = '100% vendido'
WHERE `slug` = 'dzitya-7';

UPDATE `desarrollos`
SET `tipo_desarrollo` = 'comercial',
    `tipo_operacion` = 'renta',
    `tipo_producto` = 'Locales comerciales',
    `estado_comercial` = 'operando',
    `ciudad` = 'Mérida',
    `etapa` = 'En operación',
    `precio_texto` = 'Cotiza renta mensual y disponibilidad',
    `disponibilidad_texto` = 'Locales en renta sujetos a disponibilidad'
WHERE `slug` = 'plaza-las-vias';

UPDATE `desarrollos`
SET `tipo_desarrollo` = 'comercial',
    `tipo_operacion` = 'renta',
    `tipo_producto` = 'Locales comerciales',
    `estado_comercial` = 'operando',
    `zona` = 'Ciudad Caucel',
    `ciudad` = 'Mérida',
    `etapa` = 'En operación',
    `precio_texto` = 'Cotiza renta mensual y disponibilidad',
    `disponibilidad_texto` = 'Locales en renta sujetos a disponibilidad'
WHERE `slug` = 'plaza-faro';

UPDATE `desarrollos`
SET `tipo_desarrollo` = 'residencial',
    `tipo_operacion` = 'venta',
    `tipo_producto` = 'Casas y townhouses',
    `estado_comercial` = 'disponible',
    `zona` = 'Dzityá',
    `ciudad` = 'Mérida',
    `precio_texto` = 'Consulta precios y disponibilidad',
    `disponibilidad_texto` = 'Unidades disponibles sujetas a confirmación'
WHERE `slug` = 'arenna';

COMMIT;
