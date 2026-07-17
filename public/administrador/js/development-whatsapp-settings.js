(function (window, document) {
  'use strict';

  var observer;
  var refreshTimer;
  var lastDialog = null;
  var lastDevelopmentId = null;

  function getScope(element) {
    if (!window.angular || !element) return null;

    var wrapped = window.angular.element(element);
    return (wrapped.scope && wrapped.scope()) ||
      (wrapped.isolateScope && wrapped.isolateScope()) ||
      null;
  }

  function isCommercialOperation(value) {
    return value === 'venta' || value === 'renta' || value === 'venta_renta';
  }

  function digitsOnly(value) {
    return String(value || '').replace(/\D+/g, '');
  }

  function setScopeValue(scope, key, value) {
    if (!scope || !scope.objectDesarrollo) return;

    scope.$applyAsync(function () {
      scope.objectDesarrollo[key] = value;
    });
  }

  function ensureDefaults(scope) {
    if (!scope || !scope.objectDesarrollo) return;

    if (scope.objectDesarrollo.whatsapp_activo === undefined || scope.objectDesarrollo.whatsapp_activo === null) {
      scope.objectDesarrollo.whatsapp_activo = 0;
    }

    if (scope.objectDesarrollo.whatsapp_numero === undefined || scope.objectDesarrollo.whatsapp_numero === null) {
      scope.objectDesarrollo.whatsapp_numero = '';
    }

    if (!scope.objectDesarrollo.whatsapp_mensaje) {
      scope.objectDesarrollo.whatsapp_mensaje = 'Hola, me interesa recibir información sobre {desarrollo}.';
    }
  }

  function createPanel() {
    var panel = document.createElement('div');
    panel.className = 'dev-field dev-field-full triton-whatsapp-admin-panel';
    panel.innerHTML = '' +
      '<div class="triton-wa-admin-card">' +
        '<div class="triton-wa-admin-heading">' +
          '<div>' +
            '<span class="triton-wa-admin-eyebrow">Contacto directo</span>' +
            '<h3>Botón de WhatsApp del desarrollo</h3>' +
            '<p>Se muestra junto a “Solicitar información” únicamente en desarrollos configurados como venta o renta.</p>' +
          '</div>' +
          '<label class="triton-wa-admin-toggle">' +
            '<input type="checkbox" data-wa-field="activo">' +
            '<span>Mostrar botón</span>' +
          '</label>' +
        '</div>' +
        '<div class="triton-wa-admin-grid">' +
          '<label>' +
            '<span>Número con clave de país</span>' +
            '<input type="tel" inputmode="numeric" maxlength="25" data-wa-field="numero" placeholder="Ej. 529994354586">' +
            '<small>Escribe únicamente números. Para México usa 52 + lada + número.</small>' +
          '</label>' +
          '<label class="triton-wa-admin-message">' +
            '<span>Mensaje predeterminado</span>' +
            '<textarea rows="4" maxlength="500" data-wa-field="mensaje" placeholder="Hola, me interesa recibir información sobre {desarrollo}."></textarea>' +
            '<small>Puedes usar <strong>{desarrollo}</strong> para insertar automáticamente el nombre del proyecto.</small>' +
          '</label>' +
        '</div>' +
        '<div class="triton-wa-admin-preview">' +
          '<span>Vista previa:</span>' +
          '<a href="#" target="_blank" rel="noopener noreferrer" data-wa-preview>Probar enlace de WhatsApp</a>' +
        '</div>' +
        '<p class="triton-wa-admin-warning" data-wa-warning>Selecciona Venta, Renta o Venta y renta para habilitar esta configuración.</p>' +
      '</div>';

    return panel;
  }

  function addStyles() {
    if (document.getElementById('triton-whatsapp-admin-styles')) return;

    var style = document.createElement('style');
    style.id = 'triton-whatsapp-admin-styles';
    style.textContent = '' +
      '.triton-whatsapp-admin-panel{grid-column:1/-1!important;margin-top:4px;}' +
      '.triton-wa-admin-card{padding:20px;border:1px solid #d8d5d5;border-left:4px solid #25D366;border-radius:4px;background:#f8fbf9;}' +
      '.triton-wa-admin-heading{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;margin-bottom:18px;}' +
      '.triton-wa-admin-heading h3{margin:3px 0 6px;color:#6E6969;font-size:18px;}' +
      '.triton-wa-admin-heading p{margin:0;color:#777;line-height:1.45;}' +
      '.triton-wa-admin-eyebrow{color:#159447;font-size:10px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;}' +
      '.triton-wa-admin-toggle{display:flex;align-items:center;gap:8px;white-space:nowrap;font-weight:700;color:#6E6969;cursor:pointer;}' +
      '.triton-wa-admin-toggle input{width:18px;height:18px;accent-color:#25D366;}' +
      '.triton-wa-admin-grid{display:grid;grid-template-columns:minmax(240px,.7fr) minmax(0,1.3fr);gap:18px;}' +
      '.triton-wa-admin-grid label>span{display:block;margin-bottom:7px;font-weight:600;color:#6E6969;}' +
      '.triton-wa-admin-grid input,.triton-wa-admin-grid textarea{width:100%;box-sizing:border-box;padding:10px 11px;border:1px solid #d8d5d5;border-radius:3px;background:#fff;}' +
      '.triton-wa-admin-grid textarea{resize:vertical;min-height:96px;}' +
      '.triton-wa-admin-grid small{display:block;margin-top:5px;color:#777;line-height:1.4;}' +
      '.triton-wa-admin-preview{display:flex;align-items:center;gap:10px;margin-top:16px;font-size:12px;color:#777;}' +
      '.triton-wa-admin-preview a{display:inline-flex;align-items:center;min-height:34px;padding:0 12px;border-radius:18px;background:#25D366;color:#fff;text-decoration:none;font-weight:700;}' +
      '.triton-wa-admin-preview a.is-disabled{pointer-events:none;opacity:.45;}' +
      '.triton-wa-admin-warning{display:none;margin:14px 0 0!important;padding:10px 12px;background:#fff4df;color:#7b5a19;border-radius:3px;}' +
      '.triton-wa-admin-card.is-disabled .triton-wa-admin-grid,.triton-wa-admin-card.is-disabled .triton-wa-admin-toggle,.triton-wa-admin-card.is-disabled .triton-wa-admin-preview{opacity:.5;pointer-events:none;}' +
      '.triton-wa-admin-card.is-disabled .triton-wa-admin-warning{display:block;}' +
      '@media(max-width:760px){.triton-wa-admin-heading{flex-direction:column}.triton-wa-admin-grid{grid-template-columns:1fr}.triton-wa-admin-preview{align-items:flex-start;flex-direction:column}}';
    document.head.appendChild(style);
  }

  function updatePreview(panel, scope) {
    var development = scope && scope.objectDesarrollo;
    var preview = panel.querySelector('[data-wa-preview]');
    var number = digitsOnly(development && development.whatsapp_numero);
    var message = String((development && development.whatsapp_mensaje) || '').trim();
    var name = String((development && development.nombre) || 'este desarrollo');

    if (!message) {
      message = 'Hola, me interesa recibir información sobre {desarrollo}.';
    }

    message = message.replace(/\{desarrollo\}/gi, name);

    if (number.length < 10) {
      preview.href = '#';
      preview.classList.add('is-disabled');
      return;
    }

    preview.href = 'https://wa.me/' + number + '?text=' + encodeURIComponent(message);
    preview.classList.remove('is-disabled');
  }

  function bindPanel(panel, scope) {
    var activeInput = panel.querySelector('[data-wa-field="activo"]');
    var numberInput = panel.querySelector('[data-wa-field="numero"]');
    var messageInput = panel.querySelector('[data-wa-field="mensaje"]');

    if (panel.getAttribute('data-bound') === '1') return;
    panel.setAttribute('data-bound', '1');

    activeInput.addEventListener('change', function () {
      setScopeValue(scope, 'whatsapp_activo', this.checked ? 1 : 0);
      window.setTimeout(function () { updatePreview(panel, scope); }, 0);
    });

    numberInput.addEventListener('input', function () {
      var clean = digitsOnly(this.value);
      if (this.value !== clean) this.value = clean;
      setScopeValue(scope, 'whatsapp_numero', clean);
      window.setTimeout(function () { updatePreview(panel, scope); }, 0);
    });

    messageInput.addEventListener('input', function () {
      setScopeValue(scope, 'whatsapp_mensaje', this.value);
      window.setTimeout(function () { updatePreview(panel, scope); }, 0);
    });
  }

  function syncPanel(panel, scope) {
    if (!scope || !scope.objectDesarrollo) return;

    ensureDefaults(scope);

    var development = scope.objectDesarrollo;
    var operation = String(development.tipo_operacion || '');
    var enabled = isCommercialOperation(operation);
    var card = panel.querySelector('.triton-wa-admin-card');
    var activeInput = panel.querySelector('[data-wa-field="activo"]');
    var numberInput = panel.querySelector('[data-wa-field="numero"]');
    var messageInput = panel.querySelector('[data-wa-field="mensaje"]');
    var currentId = development.id || 'new';

    card.classList.toggle('is-disabled', !enabled);
    activeInput.disabled = !enabled;
    numberInput.disabled = !enabled;
    messageInput.disabled = !enabled;

    if (lastDevelopmentId !== currentId || document.activeElement !== activeInput) {
      activeInput.checked = parseInt(development.whatsapp_activo, 10) === 1;
    }
    if (lastDevelopmentId !== currentId || document.activeElement !== numberInput) {
      numberInput.value = development.whatsapp_numero || '';
    }
    if (lastDevelopmentId !== currentId || document.activeElement !== messageInput) {
      messageInput.value = development.whatsapp_mensaje || '';
    }

    lastDevelopmentId = currentId;
    updatePreview(panel, scope);
  }

  function refresh() {
    var dialog = document.querySelector('md-dialog#desarrollo');

    if (!dialog) {
      lastDialog = null;
      lastDevelopmentId = null;
      return;
    }

    var scope = getScope(dialog);
    var commercialGrid = dialog.querySelector('.dev-grid-3');

    if (!scope || !commercialGrid) return;

    var panel = commercialGrid.querySelector('.triton-whatsapp-admin-panel');

    if (!panel) {
      panel = createPanel();
      commercialGrid.appendChild(panel);
    }

    if (lastDialog !== dialog) {
      lastDialog = dialog;
      lastDevelopmentId = null;
    }

    bindPanel(panel, scope);
    syncPanel(panel, scope);
  }

  function scheduleRefresh() {
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(refresh, 120);
  }

  function initialize() {
    addStyles();
    scheduleRefresh();

    if (window.MutationObserver) {
      observer = new window.MutationObserver(scheduleRefresh);
      observer.observe(document.body, { childList: true, subtree: true });
    }

    window.setInterval(refresh, 500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})(window, document);
