// GA4 + Consent Mode v2. Pon el ID de medición aquí para activarlo (vacío = no se carga nada).
(function () {
  var GA_ID = ''; // TODO: 'G-XXXXXXXXXX' (analytics.google.com → Admin → Flujos de datos)
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { dataLayer.push(arguments); };
  if (!GA_ID) return;
  var saved = null; try { saved = localStorage.getItem('consent_v1'); } catch (e) {}
  gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
    analytics_storage: saved === 'granted' ? 'granted' : 'denied', wait_for_update: 500 });
  gtag('js', new Date());
  gtag('config', GA_ID, { anonymize_ip: true });
  var s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(s);
  document.addEventListener('DOMContentLoaded', function () {
    if (!saved) {
      var es = (document.documentElement.lang || 'es').indexOf('en') !== 0;
      var b = document.createElement('div');
      b.setAttribute('role', 'dialog'); b.setAttribute('aria-label', 'Cookies');
      b.style.cssText = 'position:fixed;left:16px;right:16px;bottom:16px;z-index:95;max-width:520px;margin:auto;padding:14px 16px;border-radius:16px;background:rgba(10,10,20,.9);border:1px solid rgba(255,255,255,.15);color:#fff;font:14px/1.4 Poppins,system-ui;display:flex;gap:12px;align-items:center;backdrop-filter:blur(14px)';
      b.innerHTML = '<span style="flex:1">' + (es ? 'Usamos cookies de analítica para mejorar el sitio.' : 'We use analytics cookies to improve the site.') + '</span>' +
        '<button data-c="denied" style="background:none;border:1px solid #fff5;color:#fff;border-radius:99px;padding:8px 12px;cursor:pointer">No</button>' +
        '<button data-c="granted" style="background:#fff;color:#000;border:0;border-radius:99px;padding:8px 14px;cursor:pointer">' + (es ? 'Aceptar' : 'Accept') + '</button>';
      b.addEventListener('click', function (e) { var v = e.target.getAttribute('data-c'); if (!v) return;
        try { localStorage.setItem('consent_v1', v); } catch (x) {} gtag('consent', 'update', { analytics_storage: v }); b.remove(); });
      document.body.appendChild(b);
    }
  });
  // Conversiones: WhatsApp, teléfono, email (delegado, funciona con contenido dinámico)
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]'); if (!a) return; var h = a.href;
    var loc = (a.closest('section') || {}).id || (a.closest('header') ? 'nav' : 'other');
    if (/wa\.me|whatsapp\.com/.test(h)) gtag('event', 'whatsapp_click', { link_url: h, location: loc });
    else if (h.indexOf('tel:') === 0) gtag('event', 'phone_click', { location: loc });
    else if (h.indexOf('mailto:') === 0) gtag('event', 'email_click', { location: loc });
  });
})();
