<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Response;

class DeferMarketingScripts
{
    /**
     * Optimiza las páginas públicas y aplica componentes globales del sitio.
     */
    public function handle($request, Closure $next)
    {
        $response = $next($request);

        if (!$response instanceof Response || $request->is('admin*') || $request->is('dashboard*') || $request->is('login*')) {
            return $response;
        }

        $content = $response->getContent();

        if (!is_string($content) || stripos($content, '<!DOCTYPE html>') === false) {
            return $response;
        }

        $patterns = [
            '#<!-- Google tag \(gtag\.js\) -->\s*<script async src="https://www\.googletagmanager\.com/gtag/js\?id=G-VX652Y2FEH"></script>\s*<script>.*?</script>#si',
            '#<!-- Google Tag Manager -->\s*<script>.*?</script>\s*<!-- End Google Tag Manager -->#si',
            '#<!-- Start of HubSpot Embed Code -->.*?<!-- End of HubSpot Embed Code -->#si',
            '#<!-- Meta Pixel Code -->.*?<!-- End Meta Pixel Code -->#si',
            '#<!-- Google tag \(gtag\.js\) -->\s*<script async src="https://www\.googletagmanager\.com/gtag/js\?id=AW-636083390"></script>\s*<script>.*?</script>#si',
        ];

        $content = preg_replace($patterns, '', $content);

        // Mantiene actualizados los datos estructurados de la oficina.
        $content = str_replace(
            [
                '"streetAddress": "Calle 19 #465, Col. Altabrisa"',
                '"postalCode": "97133"'
            ],
            [
                '"streetAddress": "C. 13 158, entre 32 y 36, Campestre"',
                '"postalCode": "97120"'
            ],
            $content
        );

        if (stripos($content, 'triton-footer-v2.css') === false && stripos($content, '</head>') !== false) {
            $content = preg_replace(
                '/<\/head>/i',
                '        <link rel="stylesheet" href="/css/triton-footer-v2.css?v=20260717">' . "\n    </head>",
                $content,
                1
            );
        }

        $footer = <<<'HTML'
<footer class="triton-footer-v2" aria-label="Pie de página de Triton Desarrollos">
  <div class="triton-footer-shell">
    <div class="triton-footer-grid">
      <section class="triton-footer-brand" aria-label="Triton Desarrollos">
        <img src="/img/footer/logo_footer_sv.png" alt="Triton Desarrollos" width="138" height="64" loading="lazy" decoding="async">
        <p>Desarrollamos proyectos inmobiliarios en Mérida con enfoque en certeza, calidad constructiva y relaciones de largo plazo.</p>
      </section>

      <nav aria-label="Enlaces del sitio">
        <span class="triton-footer-label">Explora</span>
        <ul class="triton-footer-links">
          <li><a href="/desarrollos">Desarrollos en venta</a></li>
          <li><a href="/proyectos-entregados">Desarrollos entregados</a></li>
          <li><a href="/sello-triton">Sello Triton</a></li>
          <li><a href="/centro-comprador">Centro del comprador</a></li>
          <li><a href="/yucatan">Blog</a></li>
          <li><a href="/contacto">Contacto</a></li>
        </ul>
      </nav>

      <section aria-label="Ubicación y horario">
        <span class="triton-footer-label">Visítanos</span>
        <p class="triton-footer-address">
          C. 13 158, entre 32 y 36<br>
          Campestre, C.P. 97120<br>
          Mérida, Yucatán
        </p>
        <a class="triton-footer-map" href="https://maps.app.goo.gl/vbxB9XBJcALBAzd19" target="_blank" rel="noopener noreferrer">Ver ubicación en Google Maps</a>
        <p class="triton-footer-hours">Lunes a viernes: 9:00 a 20:00 hrs.<br>Sábado: 9:00 a 19:00 hrs.</p>
      </section>

      <section aria-label="Contacto y redes sociales">
        <span class="triton-footer-label">Contacto</span>
        <ul class="triton-footer-contact-list">
          <li><strong>Ventas</strong><a href="tel:+529999963195">999 996 3195</a></li>
          <li><strong>WhatsApp</strong><a href="https://wa.me/529999963195" target="_blank" rel="noopener noreferrer">Enviar mensaje</a></li>
          <li><strong>Correo</strong><a href="mailto:contacto@tritondesarrollos.com">contacto@tritondesarrollos.com</a></li>
        </ul>
        <div class="triton-footer-social" aria-label="Redes sociales de Triton">
          <a href="https://www.instagram.com/tritondesarrollos/" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="https://www.facebook.com/tritondesarrollos" target="_blank" rel="noopener noreferrer">Facebook</a>
          <a href="https://www.linkedin.com/company/triton-desarrollos/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="https://www.youtube.com/channel/UCJG9nEziQ6jKgmN2BKApMeg" target="_blank" rel="noopener noreferrer">YouTube</a>
        </div>
      </section>
    </div>

    <div class="triton-footer-bottom">
      <p>© Triton Desarrollos. Todos los derechos reservados.</p>
      <div class="triton-footer-legal">
        <a href="/pdf/terminos-y-condiciones.pdf" target="_blank" rel="noopener">Términos y condiciones</a>
        <a href="/pdf/aviso-privacidad.pdf" target="_blank" rel="noopener">Aviso de privacidad</a>
        <a href="/brokers">Portal para brokers</a>
        <a href="/postventa">Postventa</a>
      </div>
    </div>
  </div>
</footer>
HTML;

        $content = preg_replace('#<footer\b[^>]*>.*?</footer>#si', $footer, $content, 1);

        $loader = <<<'HTML'
<script id="triton-deferred-marketing">
(function(w,d){
  'use strict';
  var started=false;

  function loadScript(src,id){
    if(id&&d.getElementById(id)){return;}
    var s=d.createElement('script');
    if(id){s.id=id;}
    s.async=true;
    s.src=src;
    d.head.appendChild(s);
  }

  function startMarketing(){
    if(started){return;}
    started=true;

    w.dataLayer=w.dataLayer||[];
    w.gtag=w.gtag||function(){w.dataLayer.push(arguments);};
    w.gtag('js',new Date());
    w.gtag('config','G-VX652Y2FEH');
    w.gtag('config','AW-636083390');
    loadScript('https://www.googletagmanager.com/gtag/js?id=G-VX652Y2FEH','triton-gtag');

    w.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});
    loadScript('https://www.googletagmanager.com/gtm.js?id=GTM-5JRGKN5','triton-gtm');

    if(!w.fbq){
      var fbq=w.fbq=function(){fbq.callMethod?fbq.callMethod.apply(fbq,arguments):fbq.queue.push(arguments);};
      if(!w._fbq){w._fbq=fbq;}
      fbq.push=fbq;
      fbq.loaded=true;
      fbq.version='2.0';
      fbq.queue=[];
      fbq('init','368797567422112');
      fbq('track','PageView');
      loadScript('https://connect.facebook.net/en_US/fbevents.js','triton-meta-pixel');
    }

    w.setTimeout(function(){
      loadScript('https://js.hs-scripts.com/7887105.js','hs-script-loader');
    },1200);
  }

  function schedule(){
    if('requestIdleCallback' in w){
      w.requestIdleCallback(startMarketing,{timeout:2600});
    }else{
      w.setTimeout(startMarketing,1800);
    }
  }

  if(d.readyState==='complete'){
    schedule();
  }else{
    w.addEventListener('load',schedule,{once:true});
  }
})(window,document);
</script>
HTML;

        if (stripos($content, '</body>') !== false) {
            $content = preg_replace('/<\/body>/i', $loader . "\n</body>", $content, 1);
            $response->setContent($content);
        }

        return $response;
    }
}
