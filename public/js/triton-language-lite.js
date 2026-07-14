(function (window, document) {
  'use strict';

  var STORAGE_KEY = 'triton_language_preference';
  var AUTO_SESSION_KEY = 'triton_language_auto_applied';
  var COOKIE_NAME = 'googtrans';
  var refreshTimers = [];
  var observer = null;
  var observerTimer = null;

  function storageGet(key) {
    try { return window.localStorage.getItem(key); } catch (error) { return null; }
  }

  function storageSet(key, value) {
    try { window.localStorage.setItem(key, value); } catch (error) {}
  }

  function sessionGet(key) {
    try { return window.sessionStorage.getItem(key); } catch (error) { return null; }
  }

  function sessionSet(key, value) {
    try { window.sessionStorage.setItem(key, value); } catch (error) {}
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

  function rootDomain() {
    var hostname = window.location.hostname;
    var parts;

    if (!hostname || hostname === 'localhost' || /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
      return '';
    }

    parts = hostname.split('.');
    return parts.length >= 2 ? '.' + parts.slice(-2).join('.') : '';
  }

  function writeCookie(language) {
    var secure = window.location.protocol === 'https:' ? ';Secure' : '';
    var value = language === 'en' ? '/es/en' : '/es/es';
    var domain = rootDomain();

    document.cookie = COOKIE_NAME + '=' + encodeURIComponent(value) + ';path=/;SameSite=Lax' + secure;

    if (domain) {
      document.cookie = COOKIE_NAME + '=' + encodeURIComponent(value) + ';path=/;domain=' + domain + ';SameSite=Lax' + secure;
    }
  }

  function clearCookie() {
    var expires = 'Thu, 01 Jan 1970 00:00:00 GMT';
    var domain = rootDomain();

    document.cookie = COOKIE_NAME + '=;path=/;expires=' + expires;
    document.cookie = COOKIE_NAME + '=;path=/;domain=' + window.location.hostname + ';expires=' + expires;

    if (domain) {
      document.cookie = COOKIE_NAME + '=;path=/;domain=' + domain + ';expires=' + expires;
    }
  }

  function browserLanguage() {
    var language = (window.navigator.languages && window.navigator.languages[0]) || window.navigator.language || 'es';
    return String(language).toLowerCase().indexOf('es') === 0 ? 'es' : 'en';
  }

  function currentLanguage() {
    var stored = storageGet(STORAGE_KEY);

    if (stored === 'es' || stored === 'en') {
      return stored;
    }

    return getCookie(COOKIE_NAME).indexOf('/es/en') !== -1 ? 'en' : 'es';
  }

  function switcherMarkup(modifier) {
    return '<div class="triton-language-switcher ' + modifier + ' notranslate" translate="no" role="group" aria-label="Seleccionar idioma">' +
      '<button type="button" data-triton-lang="es" aria-label="Ver sitio en español" aria-pressed="false">ES</button>' +
      '<button type="button" data-triton-lang="en" aria-label="View website in English" aria-pressed="false">EN</button>' +
      '</div>';
  }

  function injectInterface() {
    var desktopGroup = document.querySelector('.triton-navigation-group');
    var desktopCta = document.querySelector('.triton-header-cta');
    var mobileActions = document.querySelector('.triton-mobile-actions');
    var mobileToggle = document.querySelector('.triton-menu-toggle');
    var mobileFooter = document.querySelector('.triton-mobile-nav-footer');
    var wrapper;

    if (desktopGroup && !desktopGroup.querySelector('.triton-language-switcher--desktop')) {
      wrapper = document.createElement('div');
      wrapper.innerHTML = switcherMarkup('triton-language-switcher--desktop');
      desktopGroup.insertBefore(wrapper.firstChild, desktopCta || null);
    }

    if (mobileActions && !mobileActions.querySelector('.triton-language-switcher--header')) {
      wrapper = document.createElement('div');
      wrapper.innerHTML = switcherMarkup('triton-language-switcher--header');
      mobileActions.insertBefore(wrapper.firstChild, mobileToggle || mobileActions.firstChild);
    }

    if (mobileFooter && !mobileFooter.querySelector('.triton-language-switcher--mobile')) {
      wrapper = document.createElement('div');
      wrapper.innerHTML = switcherMarkup('triton-language-switcher--mobile');
      mobileFooter.insertBefore(wrapper.firstChild, mobileFooter.firstChild);
    }

    if (!document.getElementById('google_translate_element')) {
      var element = document.createElement('div');
      element.id = 'google_translate_element';
      element.className = 'notranslate';
      element.setAttribute('translate', 'no');
      document.body.appendChild(element);
    }
  }

  function updateButtons(language) {
    injectInterface();

    Array.prototype.forEach.call(document.querySelectorAll('[data-triton-lang]'), function (button) {
      var active = button.getAttribute('data-triton-lang') === language;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    document.documentElement.setAttribute('lang', language === 'en' ? 'en' : 'es-MX');
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

  function applyTranslation() {
    var combo;

    if (currentLanguage() !== 'en') {
      return;
    }

    combo = document.querySelector('.goog-te-combo');
    if (!combo) {
      return;
    }

    if (combo.value !== 'en') {
      combo.value = 'en';
      dispatchChange(combo);
    }
  }

  function scheduleTranslation() {
    while (refreshTimers.length) {
      window.clearTimeout(refreshTimers.pop());
    }

    [80, 420, 950].forEach(function (delay) {
      refreshTimers.push(window.setTimeout(applyTranslation, delay));
    });
  }

  function loadGoogleTranslate() {
    if (currentLanguage() !== 'en' || document.getElementById('triton-google-translate-script')) {
      return;
    }

    var script = document.createElement('script');
    script.id = 'triton-google-translate-script';
    script.async = true;
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.head.appendChild(script);
  }

  function observeAngularView() {
    var view;

    if (!window.MutationObserver || observer || currentLanguage() !== 'en') {
      return;
    }

    view = document.querySelector('.principalSection');
    if (!view) {
      return;
    }

    observer = new window.MutationObserver(function () {
      window.clearTimeout(observerTimer);
      observerTimer = window.setTimeout(scheduleTranslation, 260);
    });

    observer.observe(view, { childList: true });
  }

  function selectLanguage(language) {
    language = language === 'en' ? 'en' : 'es';
    storageSet(STORAGE_KEY, language);

    if (language === 'en') {
      writeCookie('en');
    } else {
      clearCookie();
    }

    window.location.reload();
  }

  function detectLanguage() {
    var stored = storageGet(STORAGE_KEY);
    var desired;

    if (stored === 'es' || stored === 'en') {
      return stored;
    }

    desired = browserLanguage();
    storageSet(STORAGE_KEY, desired);

    if (desired === 'en') {
      writeCookie('en');

      if (getCookie(COOKIE_NAME).indexOf('/es/en') === -1 && sessionGet(AUTO_SESSION_KEY) !== 'en') {
        sessionSet(AUTO_SESSION_KEY, 'en');
        window.location.reload();
      }
    }

    return desired;
  }

  window.googleTranslateElementInit = function () {
    if (!window.google || !window.google.translate || currentLanguage() !== 'en') {
      return;
    }

    new window.google.translate.TranslateElement({
      pageLanguage: 'es',
      includedLanguages: 'en',
      autoDisplay: false,
      multilanguagePage: true
    }, 'google_translate_element');

    scheduleTranslation();
  };

  window.TritonLanguage = {
    current: currentLanguage,
    refresh: function () {
      updateButtons(currentLanguage());
      if (currentLanguage() === 'en') {
        loadGoogleTranslate();
        scheduleTranslation();
      }
    },
    select: selectLanguage
  };

  document.addEventListener('click', function (event) {
    var button = event.target.closest ? event.target.closest('[data-triton-lang]') : null;

    if (!button) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    selectLanguage(button.getAttribute('data-triton-lang'));
  });

  function initialize() {
    var language = detectLanguage();
    updateButtons(language);

    if (language === 'en') {
      loadGoogleTranslate();
      observeAngularView();
      scheduleTranslation();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})(window, document);
