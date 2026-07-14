<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Response;

class DeferMarketingScripts
{
    /**
     * Evita que herramientas externas compitan con el contenido principal.
     * Las etiquetas se conservan, pero se cargan cuando la página ya es visible.
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
