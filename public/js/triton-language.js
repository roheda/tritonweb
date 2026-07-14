(function (window, document) {
  'use strict';

  var STORAGE_KEY = 'triton_language_preference';
  var AUTO_SESSION_KEY = 'triton_language_auto_applied';
  var GOOGLE_COOKIE = 'googtrans';
  var SOURCE_LANGUAGE = 'es';
  var SUPPORTED = ['es', 'en'];
  var refreshTimers = [];
  var routeObserver = null;
  var observerTimer = null;

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
      // La preferencia también se conserva mediante la cookie de traducción.
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

    language = String(language).toLowerCase();

    // El sitio ofrece dos versiones: español e inglés.
    // Navegadores configurados en español permanecen en español;
    // cualquier otro idioma recibe la versión internacional en inglés.
    return language.indexOf('es') === 0 ? 'es' : 'en';
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

  function switcherMarkup(modifier) {
    return '' +
      '<div class="triton-language-switcher ' + modifier + ' notranslate" translate="no" role="group" aria-label="Seleccionar idioma">' +
        '<button type="button" data-triton-lang="es" aria-label="Ver sitio en español" aria-pressed="false">ES</button>' +
        '<button type="button" data-triton-lang="en" aria-label="View website in English" aria-pressed="false">EN</button>' +
      '</div>';
  }

  function injectLanguageInterface() {
    var desktopGroup = document.querySelector('.triton-navigation-group');
    var desktopCta = document.querySelector('.triton-header-cta');
    var mobileActions = document.querySelector('.triton-mobile-actions');
    var mobileToggle = document.querySelector('.triton-menu-toggle');
    var mobileFooter = document.querySelector('.triton-mobile-nav-footer');

    if (desktopGroup && !desktopGroup.querySelector('.triton-language-switcher--desktop')) {
      var desktopWrapper = document.createElement('div');
      desktopWrapper.innerHTML = switcherMarkup('triton-language-switcher--desktop');
      desktopGroup.insertBefore(desktopWrapper.firstChild, desktopCta || null);
    }

    if (mobileActions && !mobileActions.querySelector('.triton-language-switcher--header')) {
      var mobileHeaderWrapper = document.createElement('div');
      mobileHeaderWrapper.innerHTML = switcherMarkup('triton-language-switcher--header');
      mobileActions.insertBefore(mobileHeaderWrapper.firstChild, mobileToggle || mobileActions.firstChild);
    }

    if (mobileFooter && !mobileFooter.querySelector('.triton-language-switcher--mobile')) {
      var mobileFooterWrapper = document.createElement('div');
      mobileFooterWrapper.innerHTML = switcherMarkup('triton-language-switcher--mobile') +
        '<small class="triton-language-caption notranslate" translate="no">Español / English</small>';
      mobileFooter.insertBefore(mobileFooterWrapper.firstChild, mobileFooter.firstChild);
      mobileFooter.insertBefore(mobileFooterWrapper.firstChild, mobileFooter.children[1] || null);
    }

    if (!document.getElementById('google_translate_element')) {
      var translateElement = document.createElement('div');
      translateElement.id = 'google_translate_element';
      translateElement.className = 'notranslate';
      translateElement.setAttribute('translate', 'no');
      document.body.appendChild(translateElement);
    }
  }

  function updateLanguageUI(language) {
    injectLanguageInterface();

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
      [50, 350, 900, 1800, 3500, 6000].forEach(function (delay) {
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
    safeStorageSet(STORAGE_KEY, desired);

    if (desired === 'en') {
      var applied = safeSessionGet(AUTO_SESSION_KEY);
      writeTranslationCookie('en');

      if (cookieLanguage() !== 'en' && applied !== 'en') {
        safeSessionSet(AUTO_SESSION_KEY, 'en');
        window.location.reload();
        return;
      }
    } else {
      clearTranslationCookie();
    }

    updateLanguageUI(desired);
  }

  function bindLanguageButtons() {
    document.addEventListener('click', function (event) {
      var button = event.target.closest ? event.target.closest('[data-triton-lang]') : null;

      if (!button) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      selectLanguage(button.getAttribute('data-triton-lang'), true);
    });
  }

  function forceFullNavigationInEnglish() {
    document.addEventListener('click', function (event) {
      if (currentLanguage() !== 'en' || event.defaultPrevented || event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      var anchor = event.target.closest ? event.target.closest('a[href]') : null;

      if (!anchor || anchor.hasAttribute('download') || anchor.getAttribute('target') === '_blank' || anchor.closest('[data-triton-lang]')) {
        return;
      }

      var href = anchor.getAttribute('href');
      if (!href || href.charAt(0) === '#' || href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0 || href.indexOf('javascript:') === 0) {
        return;
      }

      var destination;

      try {
        destination = new window.URL(anchor.href, window.location.href);
      } catch (error) {
        return;
      }

      if (destination.origin !== window.location.origin) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      window.location.href = destination.href;
    }, true);
  }

  function observeAngularViews() {
    if (!window.MutationObserver || routeObserver) {
      return;
    }

    var view = document.querySelector('.principalSection');
    if (!view) {
      return;
    }

    routeObserver = new window.MutationObserver(function () {
      window.clearTimeout(observerTimer);
      observerTimer = window.setTimeout(refresh, 450);
    });

    routeObserver.observe(view, { childList: true });
  }

  function loadGoogleTranslate() {
    injectLanguageInterface();

    if (document.getElementById('triton-google-translate-script')) {
      return;
    }

    var script = document.createElement('script');
    script.id = 'triton-google-translate-script';
    script.async = true;
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.head.appendChild(script);
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
  forceFullNavigationInEnglish();

  function initialize() {
    injectLanguageInterface();
    autoDetectLanguage();
    observeAngularViews();
    loadGoogleTranslate();
    refresh();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})(window, document);
