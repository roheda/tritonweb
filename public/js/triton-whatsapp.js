(function () {
  'use strict';

  var toggle = document.getElementById('triton-wa-toggle');
  var panel = document.getElementById('triton-wa-panel');
  var closeButton = document.getElementById('triton-wa-close');
  var form = document.getElementById('triton-wa-form');
  var submitButton = document.getElementById('triton-wa-submit');
  var feedback = document.getElementById('triton-wa-feedback');

  if (!toggle || !panel || !form) {
    return;
  }

  function openPanel() {
    panel.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
  }

  function closePanel() {
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', function () {
    panel.hidden ? openPanel() : closePanel();
  });

  if (closeButton) {
    closeButton.addEventListener('click', closePanel);
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !panel.hidden) {
      closePanel();
    }
  });

  function setFeedback(message, type) {
    feedback.textContent = message || '';
    feedback.className = 'triton-wa-feedback' + (type ? ' is-' + type : '');
  }

  function getValue(name) {
    var field = form.elements[name];
    return field ? String(field.value || '').trim() : '';
  }

  function buildWhatsAppMessage() {
    var lines = [
      'Hola, vi el sitio de Triton Desarrollos y quiero recibir información.',
      '',
      '*Nombre:* ' + getValue('nombre') + ' ' + getValue('apellido'),
      '*Teléfono:* ' + getValue('telefono'),
      '*Correo:* ' + (getValue('correo') || 'No proporcionado'),
      '*Ciudad:* ' + getValue('ciudad'),
      '*Interés:* ' + getValue('interes'),
      '*Mensaje:* ' + (getValue('mensaje') || 'Sin mensaje adicional')
    ];

    return lines.join('\n');
  }

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    setFeedback('', '');

    if (!form.checkValidity()) {
      form.reportValidity();
      setFeedback('Completa los campos obligatorios antes de continuar.', 'error');
      return;
    }

    var phoneDigits = getValue('telefono').replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      setFeedback('Escribe un teléfono de al menos 10 dígitos.', 'error');
      form.elements.telefono.focus();
      return;
    }

    var interest = getValue('interes');
    var leadType = interest === 'Información para brokers' ? '2' : '1';

    var data = new FormData(form);
    if (!data.get('pais')) {
      data.set('pais', 'México');
    }
    data.append('is_broker', leadType);
    data.append('tipo_lead', leadType);
    data.append('interest', interest);

    submitButton.disabled = true;
    submitButton.textContent = 'Registrando solicitud…';

    // Abrir una pestaña inmediatamente para evitar bloqueo de popups
    // después de esperar la respuesta del servidor.
    var whatsappWindow = window.open('about:blank', 'triton_whatsapp');

    try {
      var csrfMeta = document.querySelector('meta[name="csrf-token"]');
      var headers = {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json'
      };

      if (csrfMeta && csrfMeta.content) {
        headers['X-CSRF-TOKEN'] = csrfMeta.content;
      }

      var response = await fetch('/sendFormContact', {
        method: 'POST',
        body: data,
        headers: headers,
        credentials: 'same-origin'
      });

      var responseBody = null;
      try {
        responseBody = await response.json();
      } catch (jsonError) {
        responseBody = null;
      }

      var reportedStatus = responseBody && (responseBody.estatus || responseBody.status);
      var serverReportedError =
        reportedStatus === 'alert' ||
        reportedStatus === 'error' ||
        reportedStatus === false;

      if (!response.ok || serverReportedError) {
        var serverMessage =
          responseBody && (responseBody.mensaje || responseBody.message)
            ? (responseBody.mensaje || responseBody.message)
            : 'No fue posible registrar la solicitud. Inténtalo nuevamente.';

        throw new Error(serverMessage);
      }

      var whatsappNumber = '529999963195';
      var whatsappUrl =
        'https://wa.me/' +
        whatsappNumber +
        '?text=' +
        encodeURIComponent(buildWhatsAppMessage());

      setFeedback('Solicitud registrada. Abriendo WhatsApp…', 'success');

      if (whatsappWindow && !whatsappWindow.closed) {
        whatsappWindow.location.href = whatsappUrl;
      } else {
        window.location.href = whatsappUrl;
      }

      form.reset();
    } catch (error) {
      if (whatsappWindow && !whatsappWindow.closed) {
        whatsappWindow.close();
      }

      setFeedback(
        error && error.message
          ? error.message
          : 'No fue posible registrar la solicitud.',
        'error'
      );
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Registrar y continuar por WhatsApp';
    }
  });
})();