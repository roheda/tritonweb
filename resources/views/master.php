<!DOCTYPE html>
<html lang="es">
    <head>
        <?php
            $path = trim(request()->path(), '/');
            $isHomePage = $path === '';

            $pageTitle = 'Triton Desarrollos | Desarrolladora inmobiliaria en Mérida';
            $pageDescription = 'Triton Desarrollos crea proyectos residenciales y comerciales en Mérida, con 10 años de experiencia y enfoque en calidad.';
            $socialImage = url('/img/home/quienes-somos.webp');
            $seoNota = null;
            $seoDesarrollo = null;

            if ($isHomePage) {
                $pageTitle = 'Triton Desarrollos | Desarrolladora en Mérida con 10 años de experiencia';
                $pageDescription = 'Desarrolladora inmobiliaria en Mérida con 10 años de experiencia, enfocada en calidad constructiva, diseño funcional y atención cercana.';
            } elseif ($path === 'desarrollos') {
                $pageTitle = 'Desarrollos inmobiliarios en Mérida | Triton Desarrollos';
                $pageDescription = 'Conoce los desarrollos residenciales y comerciales de Triton en Mérida: proyectos con calidad, funcionalidad y atención personalizada.';
                $socialImage = url('/img/home/trayectoria.webp');
            } elseif (strpos($path, 'desarrollos/') === 0) {
                try {
                    $slugDesarrollo = request()->segment(2);
                    if (class_exists('\App\Desarrollo')) {
                        $seoDesarrollo = \App\Desarrollo::where('slug', $slugDesarrollo)->first();
                    }
                    if ($seoDesarrollo) {
                        $nombreDesarrollo = isset($seoDesarrollo->nombre) ? $seoDesarrollo->nombre : 'Desarrollo inmobiliario';
                        $descripcionDesarrollo = trim(strip_tags(isset($seoDesarrollo->descripcion) ? $seoDesarrollo->descripcion : ''));
                        $pageTitle = $nombreDesarrollo . ' | Triton Desarrollos';
                        $pageDescription = $descripcionDesarrollo
                            ? \Illuminate\Support\Str::limit($descripcionDesarrollo, 155, '')
                            : 'Conoce ubicación, características, amenidades y disponibilidad de ' . $nombreDesarrollo . '.';
                        if (!empty($seoDesarrollo->imagen)) {
                            $socialImage = url('/' . ltrim($seoDesarrollo->imagen, '/'));
                        }
                    } else {
                        $pageTitle = 'Proyecto inmobiliario en Mérida | Triton Desarrollos';
                        $pageDescription = 'Consulta características, amenidades, galería y disponibilidad de este proyecto inmobiliario de Triton Desarrollos.';
                    }
                } catch (\Exception $e) {
                    $pageTitle = 'Proyecto inmobiliario en Mérida | Triton Desarrollos';
                }
            } elseif ($path === 'inversion') {
                $pageTitle = 'Inversión inmobiliaria en Mérida | Triton Desarrollos';
                $pageDescription = 'Conoce criterios y proyectos para evaluar una inversión inmobiliaria en Mérida con información clara y atención de Triton Desarrollos.';
                $socialImage = url('/img/home/trayectoria.webp');
            } elseif ($path === 'contacto') {
                $pageTitle = 'Contacto | Triton Desarrollos en Mérida';
                $pageDescription = 'Contacta a Triton Desarrollos para conocer disponibilidad, precios, proyectos inmobiliarios y atención para compradores o brokers en Mérida.';
                $socialImage = url('/img/contacto.jpg');
            } elseif ($path === 'yucatan') {
                $pageTitle = 'Blog inmobiliario de Mérida y Yucatán | Triton Desarrollos';
                $pageDescription = 'Guías sobre vivienda, inversión, zonas de Mérida, arquitectura y calidad constructiva publicadas por Triton Desarrollos.';
                $socialImage = url('/img/home/quienes-somos.webp');
            } elseif (strpos($path, 'yucatan/') === 0) {
                try {
                    $slugNota = request()->segment(2);
                    $seoNota = \App\Nota::where('slug', $slugNota)->where('estatus', 1)->first();
                    if ($seoNota) {
                        $descripcionNota = trim(preg_replace('/\s+/', ' ', strip_tags($seoNota->descripcion)));
                        $pageTitle = $seoNota->titulo . ' | Triton Desarrollos';
                        $pageDescription = \Illuminate\Support\Str::limit($descripcionNota, 155, '');
                        if (!empty($seoNota->foto)) {
                            $socialImage = url('/' . ltrim($seoNota->foto, '/'));
                        }
                    } else {
                        $pageTitle = 'Guía inmobiliaria de Mérida | Triton Desarrollos';
                        $pageDescription = 'Información sobre vivienda, inversión y bienes raíces en Mérida y Yucatán.';
                    }
                } catch (\Exception $e) {
                    $pageTitle = 'Guía inmobiliaria de Mérida | Triton Desarrollos';
                }
            }

            $currentUrl = url()->current();
        ?>
        <meta charset="utf-8"/>
        <meta name="author" content="Daniel Cárdenas Arenas">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <meta name="csrf-token" content="<?php echo csrf_token(); ?>">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title><?php echo e($pageTitle); ?></title>
        <meta name="description" content="<?php echo e($pageDescription); ?>">
        <link rel="canonical" href="<?php echo e($currentUrl); ?>">
        <meta property="og:locale" content="es_MX">
        <meta property="og:type" content="website">
        <meta property="og:site_name" content="Triton Desarrollos">
        <meta property="og:title" content="<?php echo e($pageTitle); ?>">
        <meta property="og:description" content="<?php echo e($pageDescription); ?>">
        <meta property="og:url" content="<?php echo e($currentUrl); ?>">
        <meta property="og:image" content="<?php echo e($socialImage); ?>">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="<?php echo e($pageTitle); ?>">
        <meta name="twitter:description" content="<?php echo e($pageDescription); ?>">
        <meta name="twitter:image" content="<?php echo e($socialImage); ?>">
        <meta name="theme-color" content="#F9AF1B">
        <!-- Paleta oficial Triton: Blanco #FFFFFF, Gris #6E6969, Amarillo #F9AF1B -->
        <link rel="shortcut icon" href="img/favicon.ico" />
        <link rel="stylesheet" href="<?php echo url('./components/flexslider/flexslider.css'); ?>">
        <link rel="stylesheet" href="<?php echo url('./components/angular-material/angular-material.css'); ?>">
        <link rel="stylesheet" href="<?php echo url('./css/fonts.css')?>"/>
        <link rel="stylesheet" href="<?php echo url('./css/general.css')?>"/>
        <link rel="stylesheet" href="<?php echo url('./css/main.css')?>"/>
        <link rel="stylesheet" href="<?php echo url('./css/responsive.css')?>"/>
        <link rel="stylesheet" href="<?php echo url('./css/triton-secciones.css')?>"/>
        <link rel="stylesheet" href="<?php echo url('./css/triton-menu.css')?>"/>
        <link rel="stylesheet" href="<?php echo url('./css/triton-whatsapp.css')?>"/>
        <base href="/">
        <!-- Google tag (gtag.js) -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-VX652Y2FEH"></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){ dataLayer.push(arguments); }
            gtag('js', new Date());
            gtag('config', 'G-VX652Y2FEH');
        </script>
        <!-- Google Tag Manager -->
        <script>
            (function(w,d,s,l,i) { 
                w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
                var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),
                dl=l!='dataLayer'?'&l='+l:'';
                j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-5JRGKN5');
        </script>
        <!-- End Google Tag Manager -->
        <meta name="facebook-domain-verification" content="gncs529ztf3m2g7q43b0oepqkv81vn" />
        <!-- Start of HubSpot Embed Code -->
<script type="text/javascript" id="hs-script-loader" async defer src="//js.hs-scripts.com/7887105.js"></script>
<!-- End of HubSpot Embed Code -->
        <!-- Meta Pixel Code -->
        <script>
            !function(f,b,e,v,n,t,s) {
                if(f.fbq) return;
                n=f.fbq=function(){ n.callMethod? n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script', 'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '368797567422112');
                fbq('track', 'PageView');
        </script>
        <noscript>
            <img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=368797567422112&ev=PageView&noscript=1"/>
        </noscript>
        <!-- End Meta Pixel Code -->
        <!-- Google tag (gtag.js) -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-636083390"></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-636083390');
        </script>

        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Triton Desarrollos",
          "url": "<?php echo url('/'); ?>",
          "logo": "<?php echo url('/img/menu/logo_principal.png'); ?>",
          "image": "<?php echo url('/img/home/quienes-somos.webp'); ?>",
          "description": "Desarrolladora inmobiliaria en Mérida con 10 años de experiencia, enfocada en calidad constructiva, diseño funcional y atención cercana.",
          "telephone": "+52 999 996 3195",
          "email": "contacto@tritondesarrollos.com",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Calle 19 #465, Col. Altabrisa",
            "postalCode": "97133",
            "addressLocality": "Mérida",
            "addressRegion": "Yucatán",
            "addressCountry": "MX"
          },
          "areaServed": {
            "@type": "City",
            "name": "Mérida, Yucatán"
          },
          "sameAs": [
            "https://www.facebook.com/tritondesarrollos",
            "https://www.instagram.com/tritondesarrollos/",
            "https://www.linkedin.com/company/triton-desarrollos/",
            "https://www.youtube.com/channel/UCJG9nEziQ6jKgmN2BKApMeg"
          ]
        }
        </script>

        <?php if ($isHomePage): ?>
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "¿Quién es Triton Desarrollos?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Triton Desarrollos es una desarrolladora inmobiliaria con sede en Mérida, Yucatán, enfocada en proyectos residenciales y comerciales, diseño funcional y calidad constructiva."
              }
            },
            {
              "@type": "Question",
              "name": "¿Cuántos años de experiencia tiene Triton Desarrollos?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Triton Desarrollos cuenta con 10 años de experiencia en la planeación, desarrollo, construcción y comercialización de proyectos inmobiliarios."
              }
            },
            {
              "@type": "Question",
              "name": "¿Qué distingue a Triton Desarrollos?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Triton Desarrollos se distingue por su enfoque en calidad, funcionalidad, supervisión de procesos y atención cercana durante las distintas etapas de la compra."
              }
            },
            {
              "@type": "Question",
              "name": "¿Dónde desarrolla sus proyectos?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "La empresa tiene su sede en Mérida, Yucatán, y desarrolla proyectos principalmente en Mérida y el sureste de México."
              }
            },
            {
              "@type": "Question",
              "name": "¿Cómo controla Triton la calidad de sus proyectos?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "La calidad se trabaja mediante planeación, definición de especificaciones, seguimiento de obra, revisión de instalaciones y acabados, y una inspección previa a la entrega."
              }
            },
            {
              "@type": "Question",
              "name": "¿Triton ofrece atención después de la entrega?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Sí. Triton Desarrollos cuenta con canales de atención para recibir y dar seguimiento a reportes relacionados con la propiedad después de su entrega."
              }
            },
            {
              "@type": "Question",
              "name": "¿Cómo puedo conocer los desarrollos disponibles?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Los desarrollos disponibles pueden consultarse en la sección Desarrollos del sitio o mediante contacto directo con un asesor."
              }
            },
            {
              "@type": "Question",
              "name": "¿Dónde están las oficinas de Triton Desarrollos?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Las oficinas se encuentran en Calle 19 número 465, colonia Altabrisa, Mérida, Yucatán."
              }
            }
          ]
        }
        </script>
        <?php endif; ?>


        <?php if ($path === 'desarrollos'): ?>
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Desarrollos inmobiliarios de Triton Desarrollos",
          "url": "<?php echo e($currentUrl); ?>",
          "description": "<?php echo e($pageDescription); ?>",
          "isPartOf": {"@type": "WebSite", "name": "Triton Desarrollos", "url": "<?php echo url('/'); ?>"},
          "about": {"@type": "Organization", "name": "Triton Desarrollos"}
        }
        </script>
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {"@type":"Question","name":"¿Dónde se encuentran los proyectos de Triton Desarrollos?","acceptedAnswer":{"@type":"Answer","text":"Los proyectos se desarrollan principalmente en Mérida y otras ubicaciones del sureste de México."}},
            {"@type":"Question","name":"¿Cómo puedo consultar la disponibilidad?","acceptedAnswer":{"@type":"Answer","text":"La disponibilidad vigente puede solicitarse desde la ficha de cada desarrollo o mediante contacto directo con el equipo."}},
            {"@type":"Question","name":"¿Qué experiencia tiene Triton Desarrollos?","acceptedAnswer":{"@type":"Answer","text":"Triton Desarrollos cuenta con 10 años de experiencia y una trayectoria que incluye desarrollos entregados al 100%."}}
          ]
        }
        </script>
        <?php endif; ?>

        <?php if ($path === 'inversion'): ?>
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {"@type":"Question","name":"¿Triton garantiza la plusvalía o un rendimiento?","acceptedAnswer":{"@type":"Answer","text":"No. El desempeño de una inversión depende del mercado, ubicación, costos, demanda, plazo y condiciones particulares."}},
            {"@type":"Question","name":"¿Qué debo revisar antes de comprar una propiedad?","acceptedAnswer":{"@type":"Answer","text":"Conviene revisar ubicación, documentación, precio total, gastos, mantenimiento, especificaciones, entrega y contrato aplicable."}},
            {"@type":"Question","name":"¿Puedo comprar con crédito?","acceptedAnswer":{"@type":"Answer","text":"Los esquemas dependen del desarrollo y de la unidad. El equipo puede informar las opciones comerciales vigentes."}}
          ]
        }
        </script>
        <?php endif; ?>

        <?php if ($path === 'contacto'): ?>
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "name": "Contacto de Triton Desarrollos",
          "url": "<?php echo e($currentUrl); ?>",
          "description": "<?php echo e($pageDescription); ?>",
          "mainEntity": {
            "@type": "Organization",
            "name": "Triton Desarrollos",
            "telephone": "+52 999 996 3195",
            "email": "contacto@tritondesarrollos.com"
          }
        }
        </script>
        <?php endif; ?>

        <?php if ($path === 'yucatan'): ?>
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Blog",
          "name": "Blog inmobiliario de Triton Desarrollos",
          "url": "<?php echo e($currentUrl); ?>",
          "description": "<?php echo e($pageDescription); ?>",
          "publisher": {"@type":"Organization","name":"Triton Desarrollos","logo":{"@type":"ImageObject","url":"<?php echo url('/img/menu/logo_principal.png'); ?>"}}
        }
        </script>
        <?php endif; ?>

        <?php if ($seoNota): ?>
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": <?php echo json_encode($seoNota->titulo, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); ?>,
          "description": <?php echo json_encode($pageDescription, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); ?>,
          "image": <?php echo json_encode($socialImage, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); ?>,
          "datePublished": "<?php echo date('c', strtotime($seoNota->fecha)); ?>",
          "dateModified": "<?php echo !empty($seoNota->updated_at) ? date('c', strtotime($seoNota->updated_at)) : date('c', strtotime($seoNota->fecha)); ?>",
          "author": {"@type":"Organization","name":"Triton Desarrollos"},
          "publisher": {"@type":"Organization","name":"Triton Desarrollos","logo":{"@type":"ImageObject","url":"<?php echo url('/img/menu/logo_principal.png'); ?>"}},
          "mainEntityOfPage": {"@type":"WebPage","@id":"<?php echo e($currentUrl); ?>"}
        }
        </script>
        <?php endif; ?>

    </head>
    <body ng-app="app" ng-controller="mainController" ng-cloak>
        <!-- Google Tag Manager (noscript) -->
        <noscript>
            <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-5JRGKN5" height="0" width="0" style="display:none;visibility:hidden"></iframe>
        </noscript>
        <!-- End Google Tag Manager (noscript) -->
        <header md-whiteframe="5" class="triton-site-header">
            <div class="triton-header-shell">
                <div show-gt-sm hide-sm hide-xs class="triton-header-desktop">
                    <div class="triton-brand-group">
                        <a href="/" class="triton-brand-link" aria-label="Triton Desarrollos, inicio">
                            <img src="/img/menu/logo_principal.png" alt="Triton Desarrollos">
                        </a>
                        <div class="triton-sales-contact">
                            <span class="triton-sales-label">Ventas</span>
                            <a href="tel:+529999963195">999 996 3195</a>
                        </div>
                    </div>

                    <div class="triton-navigation-group">
                        <nav class="triton-main-nav" aria-label="Navegación principal">
                            <ul>
                                <li ng-class="{active: isActive('/')}">
                                    <a href="/">Nosotros</a>
                                </li>
                                <li ng-class="{active: isActive('/yucatan')}">
                                    <a href="/yucatan">Yucatán</a>
                                </li>
                                <li ng-class="{active: isActive('/desarrollos')}">
                                    <a href="/desarrollos">Desarrollos</a>
                                </li>
                                <li ng-class="{active: isActive('/inversion')}">
                                    <a href="/inversion">Inversión</a>
                                </li>
                                <li ng-class="{active: isActive('/contacto')}">
                                    <a href="/contacto">Contacto</a>
                                </li>
                            </ul>
                        </nav>

                        <a href="/desarrollos" class="triton-header-cta">Conocer desarrollos</a>
                    </div>
                </div>

                <div hide-gt-sm show-sm show-xs class="triton-header-mobile">
                    <a href="/" class="triton-mobile-logo" aria-label="Triton Desarrollos, inicio">
                        <img src="/img/menu/logo_principal.png" alt="Triton Desarrollos">
                    </a>

                    <div class="triton-mobile-actions">
                        <a href="tel:+529999963195" class="triton-mobile-phone" aria-label="Llamar a ventas">
                            <span>Ventas</span>
                        </a>

                        <md-button class="contBotonMenu triton-menu-toggle"
                                   ng-click="toggleRight()"
                                   ng-hide="isOpenRight()"
                                   aria-label="Abrir menú"
                                   ng-class="{actived: botonActive()}">
                            <span class="triton-menu-icon" aria-hidden="true">
                                <i></i><i></i><i></i>
                            </span>
                        </md-button>
                    </div>
                </div>
            </div>
        </header>
        <md-sidenav flex="100"
                    class="md-sidenav-right triton-mobile-nav"
                    md-component-id="right"
                    aria-label="Menú móvil">
            <div class="triton-mobile-nav-head">
                <a href="/" class="triton-mobile-nav-logo" ng-click="cerrarMenu()">
                    <img src="/img/menu/logo_principal.png" alt="Triton Desarrollos">
                </a>
                <button type="button"
                        class="triton-mobile-nav-close"
                        ng-click="cerrarMenu()"
                        aria-label="Cerrar menú">
                    <span></span>
                    <span></span>
                </button>
            </div>

            <nav class="triton-mobile-nav-links" aria-label="Navegación móvil">
                <a href="/" ng-click="cerrarMenu()" ng-class="{active: isActive('/')}">Nosotros</a>
                <a href="/yucatan" ng-click="cerrarMenu()" ng-class="{active: isActive('/yucatan')}">Yucatán</a>
                <a href="/desarrollos" ng-click="cerrarMenu()" ng-class="{active: isActive('/desarrollos')}">Desarrollos</a>
                <a href="/inversion" ng-click="cerrarMenu()" ng-class="{active: isActive('/inversion')}">Inversión</a>
                <a href="/contacto" ng-click="cerrarMenu()" ng-class="{active: isActive('/contacto')}">Contacto</a>
            </nav>

            <div class="triton-mobile-nav-footer">
                <a href="/desarrollos" class="triton-mobile-nav-cta" ng-click="cerrarMenu()">Conocer desarrollos</a>
                <a href="tel:+529999963195" class="triton-mobile-nav-contact">
                    <small>Ventas</small>
                    <strong>999 996 3195</strong>
                </a>
            </div>
        </md-sidenav>
        <section ng-view autoscroll="true" class="principalSection"></section>
        <div id="triton-whatsapp-widget" class="triton-wa" aria-live="polite">
            <button id="triton-wa-toggle"
                    class="triton-wa-toggle"
                    type="button"
                    aria-controls="triton-wa-panel"
                    aria-expanded="false"
                    aria-label="Abrir formulario de WhatsApp">
                <svg viewBox="0 0 32 32" aria-hidden="true">
                    <path fill="currentColor" d="M19.11 17.42c-.28-.14-1.66-.82-1.92-.91-.26-.1-.45-.14-.64.14-.19.28-.73.91-.9 1.1-.17.19-.33.21-.61.07-.28-.14-1.18-.44-2.25-1.39-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.49.14-.16.19-.28.28-.47.09-.19.05-.35-.02-.49-.07-.14-.64-1.54-.88-2.11-.23-.56-.47-.48-.64-.49h-.55c-.19 0-.49.07-.75.35-.26.28-.99.97-.99 2.36 0 1.39 1.01 2.74 1.15 2.93.14.19 1.99 3.04 4.82 4.26.67.29 1.2.46 1.61.59.68.22 1.29.19 1.78.12.54-.08 1.66-.68 1.9-1.34.23-.66.23-1.23.16-1.34-.07-.12-.26-.19-.54-.33z"/>
                    <path fill="currentColor" d="M27.3 4.66A15.1 15.1 0 0 0 3.54 22.88L1.4 30.7l8.01-2.1A15.1 15.1 0 0 0 27.3 4.66zm-11.17 23.5c-2.33 0-4.62-.63-6.61-1.82l-.47-.28-4.75 1.25 1.27-4.63-.31-.48a12.65 12.65 0 1 1 10.87 5.96z"/>
                </svg>
                <span class="triton-wa-toggle-label">WhatsApp</span>
            </button>

            <section id="triton-wa-panel"
                     class="triton-wa-panel"
                     hidden
                     aria-labelledby="triton-wa-title">
                <header class="triton-wa-header">
                    <img src="/img/menu/logo_principal.png" alt="Triton Desarrollos" class="triton-wa-brand">
                    <div>
                        <span class="triton-wa-online"><i></i> Atención disponible</span>
                        <h2 id="triton-wa-title">Habla con un asesor</h2>
                        <p>Registraremos tu solicitud y después abriremos WhatsApp con la información capturada.</p>
                    </div>
                    <button id="triton-wa-close" class="triton-wa-close" type="button" aria-label="Cerrar formulario">×</button>
                </header>

                <form id="triton-wa-form" class="triton-wa-form" novalidate>
                    <input type="hidden" name="_token" value="<?php echo csrf_token(); ?>">
                    <input type="hidden" name="medio" value="Widget WhatsApp del sitio web">
                    <input type="hidden" name="preferencia" value="WhatsApp">
                    <input type="hidden" name="pais" value="México">

                    <div class="triton-wa-grid">
                        <div class="triton-wa-field">
                            <label for="triton-wa-nombre">Nombre *</label>
                            <input id="triton-wa-nombre" name="nombre" type="text" autocomplete="given-name" required>
                        </div>
                        <div class="triton-wa-field">
                            <label for="triton-wa-apellido">Apellido *</label>
                            <input id="triton-wa-apellido" name="apellido" type="text" autocomplete="family-name" required>
                        </div>
                    </div>

                    <div class="triton-wa-grid">
                        <div class="triton-wa-field">
                            <label for="triton-wa-telefono">Teléfono *</label>
                            <input id="triton-wa-telefono"
                                   name="telefono"
                                   type="tel"
                                   autocomplete="tel"
                                   inputmode="numeric"
                                   placeholder="999 000 0000"
                                   pattern="[0-9\s()+-]{10,18}"
                                   required>
                        </div>
                        <div class="triton-wa-field">
                            <label for="triton-wa-correo">Correo</label>
                            <input id="triton-wa-correo" name="correo" type="email" autocomplete="email">
                        </div>
                    </div>

                    <div class="triton-wa-grid">
                        <div class="triton-wa-field">
                            <label for="triton-wa-ciudad">Ciudad *</label>
                            <input id="triton-wa-ciudad" name="ciudad" type="text" autocomplete="address-level2" required>
                        </div>
                        <div class="triton-wa-field">
                            <label for="triton-wa-interes">¿Qué te interesa? *</label>
                            <select id="triton-wa-interes" name="interes" required>
                                <option value="" selected disabled>Selecciona</option>
                                <option value="Conocer desarrollos disponibles">Conocer desarrollos disponibles</option>
                                <option value="Comprar una propiedad">Comprar una propiedad</option>
                                <option value="Invertir en Mérida">Invertir en Mérida</option>
                                <option value="Información para brokers">Información para brokers</option>
                                <option value="Atención postventa">Atención postventa</option>
                            </select>
                        </div>
                    </div>

                    <div class="triton-wa-field">
                        <label for="triton-wa-mensaje">Mensaje</label>
                        <textarea id="triton-wa-mensaje"
                                  name="mensaje"
                                  rows="3"
                                  placeholder="Ejemplo: Me interesa conocer precios y disponibilidad."></textarea>
                    </div>

                    <label class="triton-wa-consent" for="triton-wa-privacy">
                        <input id="triton-wa-privacy" type="checkbox" required>
                        <span>
                            Acepto el uso de mis datos para recibir atención.
                            <a href="/pdf/aviso-privacidad.pdf" target="_blank" rel="noopener">Aviso de privacidad</a>
                        </span>
                    </label>

                    <div id="triton-wa-feedback" class="triton-wa-feedback" role="status"></div>

                    <button id="triton-wa-submit" class="triton-wa-submit" type="submit">
                        Registrar y continuar por WhatsApp
                    </button>
                    <p class="triton-wa-small">No se enviará el mensaje automáticamente: WhatsApp se abrirá para que puedas revisarlo y enviarlo.</p>
                </form>
            </section>
        </div>
        <footer>
            <div layout="row" layout-wrap layout-align="center stretch">
                <div flex="5" class="lateral"></div>
                <div flex="90" class="p+++">
                    <div layout="row" layout-padding layout-wrap layout-align-gt-xs="start stretch" layout-align="center center" class="footContainer">
                        <div flex-gt-sm="70" flex="100" class="p+++">
                            <div layout="row" layout-wrap layout-align="center center">
                                <div flex="25" flex-xs="100" class="contImg">
                                    <img src="img/footer/logo_footer_sv.png" width="120px">
                                </div>
                                <div flex="25" flex-xs="100">
                                    <ul class="enlaces">
                                        <li class="mb+"><a class="primary-color" href="/">Nosotros</a></li>
                                        <li class="mb+"><a class="primary-color" href="/yucatan">Yucatán</a></li>
                                        <li class="mb+"><a class="primary-color" href="/desarrollos">Desarrollos</a></li>
                                        <li class="mb+"><a class="primary-color" href="/inversion">Inversión</a></li>
                                        <li class="mb+"><a class="primary-color" href="/contacto">Contacto</a></li>
                                    </ul>
                                </div>
                                <div flex="25" flex-xs="100">
                                    <a href="https://www.google.com.mx/maps/place/Trit%C3%B3n+Desarrollos/@21.024287,-89.5890999,17z/data=!3m1!4b1!4m5!3m4!1s0x8f5677f9acd32ff7:0xf24107fbd4161e48!8m2!3d21.0242423!4d-89.5868619" target="_blank">
                                        <div class="address mb++">
                                            <p><b>Dirección:</b></p>
                                            <p>Calle 19 #465</p>
                                            <p>Col. Altabrisa, 97133</p>
                                            <p>Mérida, Yuc.</p>
                                            <p>Por C.20 y C.22</p>
                                        </div>
                                    </a>
                                    <div class="workhour">
                                        <p><b>Horario:</b></p>
                                        <p>Lunes a Viernes</p>
                                        <p>De 9:00 a 20:00 hrs</p>
                                        <p>Sábado de 9:00 a 19:00</p>
                                    </div>
                                </div>
                                <div flex="25" flex-xs="100">
                                    <div class="contact-phone mb++">
                                        <p><b>Teléfonos:</b></p>
                                        <p><a href="tel:9999963195">999 996 3195</a></p>
                                        <p>WhatsApp</p>
                                        <p><a href="https://wa.me/+529999963195" target="_blank">999 996 3195</a></p>
                                    </div>
                                    <div class="contact-mail">
                                        <p><b>Correo:</b></p>
                                        <p><a href="mailto:contacto@tritondesarrollos.com" target="_blank">contacto@tritondesarrollos.com</a></p><br/>
                                        <p><a href="pdf/terminos-y-condiciones.pdf" target="_blank">Terminos y condiciones</a></p>
                                        <p><a href="pdf/aviso-privacidad.pdf" target="_blank">Aviso de privacidad</a></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div flex-gt-sm="30" flex="100" class="p+++">
                            <div layout="row" layout-align="center center" class="h-100">
                                <div flex="70">
                                    <ul layout="row" layout-align-gt-sm="start center" layout-align="center center" class="redes">
                                        <li class="m0">
                                            <a href="https://api.whatsapp.com/send?phone=5219999963195&text=Hola%20vi%20la%20publicidad%20en%20facebook%20de%20Kantera%2C%20me%20gustar%C3%ADa%20saber%20m%C3%A1s%20informaci%C3%B3n." target="_blank">
                                                <div class="red wha"></div>
                                            </a>
                                        </li>
                                        <li class="m0">
                                            <a href="https://www.facebook.com/tritondesarrollos" target="_blank">
                                                <div class="red fb"></div>
                                            </a>
                                        </li>
                                        <li class="m0">
                                            <a href="https://www.linkedin.com/company/triton-desarrollos/" target="_blank">
                                                <div class="red in"></div>
                                            </a>
                                        </li>
                                        <li class="m0">
                                            <a href="https://www.youtube.com/channel/UCJG9nEziQ6jKgmN2BKApMeg" target="_blank">
                                                <div class="red you"></div>
                                            </a>
                                        </li>
                                    </ul>
                                    <ul layout="row" layout-align-gt-sm="start center" layout-align="center center" class="redes">
                                        <li class="m0">
                                            <a href="https://www.instagram.com/tritondesarrollos/" target="_blank">
                                                <div class="red ins"></div>
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div flex="5"></div>
            </div>
        </footer>
        <script src="<?php echo url('./components/jquery/jquery.js') ?>"></script>
        <script src="<?php echo url('./components/flexslider/jquery.flexslider.js') ?>"></script>
        <script src="<?php echo url('./components/angular/angular.js') ?>"></script>
        <script src="<?php echo url('./components/angular/angular-messages.js') ?>"></script>
        <script src="<?php echo url('./components/angular/angular-aria.js') ?>"></script>
        <script src="<?php echo url('./components/angular/angular-route.js') ?>"></script>
        <script src="<?php echo url('./components/angular/angular-animate.js') ?>"></script>
        <script src="<?php echo url('./components/angular/angular-sanitize.js') ?>"></script>
		<script src="<?php echo url('./components/angular-filter/angular-filter.js')?>"></script>
        <script src="<?php echo url('./components/angular-flexslider/angular-flexslider.js') ?>"></script>
        <script src="<?php echo url('./components/angular-material/angular-material.js') ?>"></script>
        <script src="<?php echo url('./components/angular-youtube/src/angular-youtube-embed.js') ?>"></script>
        <script src="<?php echo url('./components/i18n/angular-locale_es-mx.js') ?>"></script>
        <script src="<?php echo url('/js/app.js') ?>"></script>
        <script src="<?php echo url('/js/controllers/homecontroller.js') ?>"></script>
        <script src="<?php echo url('/js/controllers/yucatancontroller.js') ?>"></script>
        <script src="<?php echo url('/js/controllers/notascontroller.js') ?>"></script>
        <script src="<?php echo url('/js/controllers/desarrollocontroller.js') ?>"></script>
        <script src="<?php echo url('/js/controllers/detalledesarrollocontroller.js') ?>"></script>
        <script src="<?php echo url('/js/controllers/inversioncontroller.js') ?>"></script>
        <script src="<?php echo url('/js/controllers/contactocontroller.js') ?>"></script>
        <script src="<?php echo url('/js/services/homeservice.js') ?>"></script>
        <script src="<?php echo url('/js/services/desarrolloservice.js') ?>"></script>
        <script src="<?php echo url('/js/services/multimediaservice.js') ?>"></script>
        <script src="<?php echo url('/js/services/contactoservice.js') ?>"></script>
        <script src="<?php echo url('/js/services/notasservice.js') ?>"></script>
            <script src="<?php echo url('/js/triton-whatsapp.js') ?>"></script>
    </body>
</html>
