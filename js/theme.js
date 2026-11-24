// Tema claro/escuro/automático. Roda antes do app (script comum no <head>) pra tela não piscar.
(function () {
  var KEY = 'ronin:theme', mq = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
  function pref() { try { var v = localStorage.getItem(KEY); return v === 'dark' || v === 'light' ? v : 'auto'; } catch (e) { return 'auto'; } }
  function apply() {
    var p = pref(), dark = p === 'dark' || (p === 'auto' && mq && mq.matches);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    var m = document.querySelector('meta[name=theme-color]'); if (m) m.setAttribute('content', dark ? '#14120f' : '#ece5d3');
  }
  window.roninTheme = {
    get: pref,
    set: function (v) { try { v === 'auto' ? localStorage.removeItem(KEY) : localStorage.setItem(KEY, v); } catch (e) { } apply(); },
    isDark: function () { return document.documentElement.getAttribute('data-theme') === 'dark'; }
  };
  if (mq) (mq.addEventListener ? mq.addEventListener('change', apply) : mq.addListener(apply));
  apply();
})();
