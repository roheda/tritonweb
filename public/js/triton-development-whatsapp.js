(function (window, document) {
  'use strict';

  var observer;
  var refreshTimer;

  function digitsOnly(value) {
    return String(value || '').replace(/\D+/g, '');
  }

  function getScope(element) {
    if (!window.angular || !element) return null;

    var wrapped = window.angular.element(element);
    return (wrapped.scope && wrapped.scope()) ||
      (wrapped.isolateScope && wrapped.isolateScope()) ||
      null;
  }

  function isEligible(development) {
    var operation = String(development.tipo_operacion || '').toLowerCase();
    var active = parseInt(development.whatsapp_activo, 10) === 1;
    var number = digitsOnly(development.whatsapp_numero);

    return active &&
      number.length >= 10 &&
      (operation === 'venta' || operation === 'renta' || operation === 'venta_renta');
  }

  function buildMessage(development) {
    var message = String(development.whatsapp_mensaje || '').trim();

    if (!message) {
      message = 'Hola, me interesa recibir información sobre {desarrollo}.';
    }

    return message.replace(/\{desarrollo\}/gi, development.nombre || 'este desarrollo');
  }

  function buildUrl(development) {
    return 'https://wa.me/' + digitsOnly(development.whatsapp_numero) +
      '?text=' + encodeURIComponent(buildMessage(development));
  }

  function removeButtons(root) {
    Array.prototype.forEach.call(
      (root || document).querySelectorAll('[data-triton-development-whatsapp]'),
      function (button) {
        if (button.parentNode) button.parentNode.removeChild(button);
      }
    );
  }

  function createButton(url, developmentName) {
    var button = document.createElement('a');
    button.className = 'tp-btn triton-development-whatsapp-button';
    button.href = url;
    button.target = '_blank';
    button.rel = 'noopener noreferrer';
    button.setAttribute('data-triton-development-whatsapp', '1');
    button.setAttribute('aria-label', 'Solicitar información de ' + developmentName + ' por WhatsApp');
    button.innerHTML = '' +
      '<svg aria-hidden="true" viewBox="0 0 32 32" focusable="false">' +
        '<path fill="currentColor" d="M16.04 3A12.9 12.9 0 0 0 5.1 22.75L3 29l6.45-2.05A12.95 12.95 0 1 0 16.04 3Zm0 23.55c-2.08 0-4.12-.56-5.9-1.62l-.42-.25-3.83 1.22 1.25-3.72-.27-.43a10.57 10.57 0 1 1 9.17 4.8Zm5.8-7.91c-.32-.16-1.88-.93-2.17-1.03-.29-.11-.5-.16-.71.16-.21.31-.82 1.03-1 1.24-.19.21-.37.24-.69.08-.32-.16-1.34-.49-2.55-1.58a9.53 9.53 0 0 1-1.77-2.2c-.18-.32-.02-.49.14-.65.14-.14.32-.37.47-.55.16-.19.21-.32.32-.53.1-.21.05-.39-.03-.55-.08-.16-.71-1.71-.98-2.35-.25-.61-.52-.53-.71-.54h-.61c-.21 0-.55.08-.84.39-.29.32-1.11 1.09-1.11 2.65s1.14 3.07 1.3 3.28c.16.21 2.24 3.42 5.43 4.8.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.88-.77 2.14-1.51.27-.74.27-1.38.19-1.51-.08-.13-.29-.21-.61-.37Z"/>' +
      '</svg>' +
      '<span>WhatsApp</span>';

    return button;
  }

  function refresh() {
    var root = document.querySelector('.detalleDesarrollo');

    if (!root) return;

    var scope = getScope(root);
    var development = scope && scope.desarrollo;

    if (!development || !development.nombre) {
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(refresh, 180);
      return;
    }

    if (!isEligible(development)) {
      removeButtons(root);
      return;
    }

    var url = buildUrl(development);
    var actionGroups = root.querySelectorAll('.tp-actions');

    Array.prototype.forEach.call(actionGroups, function (group) {
      var contactButton = group.querySelector('a[href="/contacto"]');
      var existing = group.querySelector('[data-triton-development-whatsapp]');

      if (!contactButton || String(contactButton.textContent || '').toLowerCase().indexOf('solicitar') === -1) {
        return;
      }

      if (existing) {
        existing.href = url;
        existing.setAttribute('aria-label', 'Solicitar información de ' + development.nombre + ' por WhatsApp');
        return;
      }

      group.insertBefore(createButton(url, development.nombre), contactButton.nextSibling);
    });
  }

  function scheduleRefresh() {
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(refresh, 100);
  }

  function addStyles() {
    if (document.getElementById('triton-development-whatsapp-styles')) return;

    var style = document.createElement('style');
    style.id = 'triton-development-whatsapp-styles';
    style.textContent = '' +
      '.triton-development-whatsapp-button{' +
        'display:inline-flex!important;align-items:center;justify-content:center;gap:9px;' +
        'background:#25D366!important;border-color:#25D366!important;color:#fff!important;' +
        'box-shadow:0 8px 22px rgba(37,211,102,.22);' +
      '}' +
      '.triton-development-whatsapp-button:hover,.triton-development-whatsapp-button:focus-visible{' +
        'background:#1fb858!important;border-color:#1fb858!important;color:#fff!important;' +
      '}' +
      '.triton-development-whatsapp-button svg{width:20px;height:20px;flex:0 0 auto;}' +
      '@media(max-width:680px){.triton-development-whatsapp-button{width:100%;}}';
    document.head.appendChild(style);
  }

  function initialize() {
    addStyles();
    scheduleRefresh();

    if (window.MutationObserver) {
      observer = new window.MutationObserver(scheduleRefresh);
      observer.observe(document.body, { childList: true, subtree: true });
    }

    window.addEventListener('popstate', scheduleRefresh);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})(window, document);
