-- Ejecutar una sola vez en phpMyAdmin antes de desplegar el código correspondiente.
ALTER TABLE `desarrollos`
  ADD COLUMN `mapa_boton_url` TEXT NULL AFTER `mapa_url`;
