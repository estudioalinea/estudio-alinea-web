/* Medición de estudioalinea.com.ar: Google Analytics 4 y Meta Pixel.
   Con un ID vacío, esa herramienta no se carga y la web funciona igual.
   Tráfico interno: abrir cualquier página con ?interno=1 deja de medir en ese navegador
   (?interno=0 lo vuelve a activar). */
(function () {
  var GA_ID = "G-0E0R9H864J";     // Google Analytics 4, formato G-XXXXXXXXXX
  var PIXEL_ID = "";  // Meta Pixel, solo números

  var params = new URLSearchParams(location.search);
  var origen = params.get("origen") || params.get("utm_source") || "";
  try {
    if (params.get("interno") === "1") localStorage.setItem("alinea_interno", "1");
    if (params.get("interno") === "0") localStorage.removeItem("alinea_interno");
  } catch (e) { /* sin almacenamiento: se mide igual */ }
  var interno = false;
  try { interno = localStorage.getItem("alinea_interno") === "1"; } catch (e) {}

  // Eventos de la web y su equivalente en Meta.
  var META = {
    test_inicio: ["track", "Lead"],
    test_completo: ["trackCustom", "TestCompleto"],
    clic_whatsapp: ["track", "Contact"],
    clic_correo: ["track", "Contact"]
  };

  window.alineaEvento = function (nombre, datos) {
    datos = datos || {};
    if (origen && !datos.origen) datos.origen = origen;
    if (interno) return;
    if (window.gtag && GA_ID) window.gtag("event", nombre, datos);
    if (window.fbq && PIXEL_ID && META[nombre]) window.fbq(META[nombre][0], META[nombre][1], datos);
  };

  if (interno) return;

  if (GA_ID) {
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID);
  }

  if (PIXEL_ID) {
    /* Código base de Meta Pixel */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", PIXEL_ID);
    window.fbq("track", "PageView");
  }

  // Clics en WhatsApp, correo, Instagram y en el acceso al test (toda la página, incluido lo que se arma después).
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    var href = a.getAttribute("href"), lugar = a.id || a.className || "enlace";
    if (/wa\.me|api\.whatsapp\.com/.test(href)) window.alineaEvento("clic_whatsapp", { lugar: lugar });
    else if (/^mailto:/.test(href)) window.alineaEvento("clic_correo", { lugar: lugar });
    else if (/instagram\.com/.test(href)) window.alineaEvento("clic_instagram", { lugar: lugar });
    else if (/(^|\/)test\/?(\?|$)/.test(href) && !/\/test\//.test(location.pathname)) window.alineaEvento("clic_test", { lugar: lugar });
  }, true);
})();
