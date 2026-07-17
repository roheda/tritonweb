-- Ejecutar una sola vez en la base de datos de Triton antes de editar desarrollos desde el administrador.

ALTER TABLE desarrollos
    ADD COLUMN whatsapp_activo TINYINT(1) NOT NULL DEFAULT 0 AFTER mapa_boton_url,
    ADD COLUMN whatsapp_numero VARCHAR(25) NULL AFTER whatsapp_activo,
    ADD COLUMN whatsapp_mensaje VARCHAR(500) NULL AFTER whatsapp_numero;

-- Configuración inicial solicitada para las plazas en renta.
UPDATE desarrollos
SET
    whatsapp_activo = 1,
    whatsapp_numero = '529994354586',
    whatsapp_mensaje = 'Hola, me interesa recibir información sobre {desarrollo}.'
WHERE slug IN ('plaza-faro', 'plaza-las-vias');
