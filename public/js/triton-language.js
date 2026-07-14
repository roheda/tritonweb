(function (window, document) {
  'use strict';

  var STORAGE_KEY = 'triton_language_preference';
  var AUTO_SESSION_KEY = 'triton_language_auto_applied';
  var GOOGLE_COOKIE = 'googtrans';
  var SOURCE_LANGUAGE = 'es';
  var SUPPORTED = ['es', 'en'];
  var refreshTimers = [];

  function normalizeLanguage(value) {
    value = String(value || '').toLowerCase();
    return value.indexOf('en') === 0 ? 'en' : 'es';
  }

  function safeStorageGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function safeStorageSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      // El selector también funciona mediante cookie cuando localStorage no está disponible.
    }
  }

  function safeSessionGet(key) {
    try {
      return window.sessionStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function safeSessionSet(key, value) {
    try {
      window.sessionStorage.setItem(key, value);
    } catch (error) {
      // No es indispensable para el funcionamiento del selector.
    }
  }

  function getCookie(name) {
    var prefix = name + '=';
    var cookies = document.cookie ? document.cookie.split(';') : [];

    for (var i = 0; i < cookies.length; i += 1) {
      var cookie = cookies[i].trim();
      if (cookie.indexOf(prefix) === 0) {
        return decodeURIComponent(cookie.substring(prefix.length));
      }
    }

    return '';
  }

  function cookieLanguage() {
    var value = getCookie(GOOGLE_COOKIE);
    return value.indexOf('/es/en') !== -1 ? 'en' : 'es';
  }

  function browserLanguage() {
    var language = (window.navigator.languages && window.navigator.languages[0]) ||
      window.navigator.language ||
      window.navigator.userLanguage ||
      'es';

    return normalizeLanguage(language);
  }

  function currentLanguage() {
    var stored = safeStorageGet(STORAGE_KEY);
    if (SUPPORTED.indexOf(stored) !== -1) {
      return stored;
    }

    return cookieLanguage();
  }

  function rootDomain() {
    var hostname = window.location.hostname;

    if (!hostname || hostname === 'localhost' || /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
      return '';
    }

    var parts = hostname.split('.');
    if (parts.length < 2) {
      return '';
    }

    return '.' + parts.slice(-2).join('.');
  }

  function writeTranslationCookie(language) {
    var secure = window.location.protocol === 'https:' ? ';Secure' : '';
    var value = language === 'en' ? '/es/en' : '/es/es';
    var domain = rootDomain();

    document.cookie = GOOGLE_COOKIE + '=' + encodeURIComponent(value) + ';path=/;SameSite=Lax' + secure;

    if (domain) {
      document.cookie = GOOGLE_COOKIE + '=' + encodeURIComponent(value) + ';path=/;domain=' + domain + ';SameSite=Lax' + secure;
    }
  }

  function clearTranslationCookie() {
    var domain = rootDomain();
    var expires = 'Thu, 01 Jan 1970 00:00:00 GMT';

    document.cookie = GOOGLE_COOKIE + '=;path=/;expires=' + expires;
    document.cookie = GOOGLE_COOKIE + '=;path=/;domain=' + window.location.hostname + ';expires=' + expires;

    if (domain) {
      document.cookie = GOOGLE_COOKIE + '=;path=/;domain=' + domain + ';expires=' + expires;
    }
  }

  function updateLanguageUI(language) {
    var buttons = document.querySelectorAll('[data-triton-lang]');

    Array.prototype.forEach.call(buttons, function (button) {
      var isActive = button.getAttribute('data-triton-lang') === language;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    document.documentElement.setAttribute('lang', language === 'en' ? 'en' : 'es-MX');
    document.documentElement.classList.toggle('triton-lang-en', language === 'en');
    document.documentElement.classList.toggle('triton-lang-es', language === 'es');
  }

  function dispatchChange(element) {
    var event;

    if (typeof window.Event === 'function') {
      event = new window.Event('change', { bubbles: true });
    } else {
      event = document.createEvent('HTMLEvents');
      event.initEvent('change', true, true);
    }

    element.dispatchEvent(event);
  }

  function applyGoogleTranslation() {
    if (currentLanguage() !== 'en') {
      return;
    }

    var combo = document.querySelector('.goog-te-combo');
    if (!combo) {
      return;
    }

    combo.value = 'en';
    dispatchChange(combo);
  }

  function clearRefreshTimers() {
    while (refreshTimers.length) {
      window.clearTimeout(refreshTimers.pop());
    }
  }

  function refresh() {
    var language = currentLanguage();
    updateLanguageUI(language);
    clearRefreshTimers();

    if (language === 'en') {
      [50, 350, 900, 1800].forEach(function (delay) {
        refreshTimers.push(window.setTimeout(applyGoogleTranslation, delay));
      });
    }
  }

  function selectLanguage(language, manual) {
    language = normalizeLanguage(language);

    if (manual) {
      safeStorageSet(STORAGE_KEY, language);
    }

    if (language === 'en') {
      writeTranslationCookie('en');
    } else {
      clearTranslationCookie();
    }

    updateLanguageUI(language);
    window.location.reload();
  }

  function autoDetectLanguage() {
    var stored = safeStorageGet(STORAGE_KEY);

    if (SUPPORTED.indexOf(stored) !== -1) {
      updateLanguageUI(stored);
      return;
    }

    var desired = browserLanguage();
    var applied = safeSessionGet(AUTO_SESSION_KEY);

    if (desired === 'en' && cookieLanguage() !== 'en' && applied !== 'en') {
      safeSessionSet(AUTO_SESSION_KEY, 'en');
      writeTranslationCookie('en');
      window.location.reload();
      return;
    }

    updateLanguageUI(desired === 'en' ? 'en' : 'es');
  }

  function bindLanguageButtons() {
    document.addEventListener('click', function (event) {
      var button = event.target.closest ? event.target.closest('[data-triton-lang]') : null;

      if (!button) {
        return;
      }

      event.preventDefault();
      selectLanguage(button.getAttribute('data-triton-lang'), true);
    });
  }

  window.googleTranslateElementInit = function () {
    if (!window.google || !window.google.translate) {
      return;
    }

    new window.google.translate.TranslateElement({
      pageLanguage: SOURCE_LANGUAGE,
      includedLanguages: 'en',
      autoDisplay: false,
      multilanguagePage: true
    }, 'google_translate_element');

    refresh();
  };

  window.TritonLanguage = {
    current: currentLanguage,
    refresh: refresh,
    select: function (language) {
      selectLanguage(language, true);
    }
  };

  bindLanguageButtons();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      autoDetectLanguage();
      refresh();
    });
  } else {
    autoDetectLanguage();
    refresh();
  }
})(window, document);
