/* app.js — 드로어·헤더·폼·맨위로. 외부 의존성 없음.
   접근성 계약:
     드로어는 열릴 때 첫 링크로 포커스, 닫힐 때 트리거로 복귀,
     Tab 이 드로어 밖으로 나가지 않도록 순환, Esc 로 닫기.
     aria-expanded / aria-controls 는 항상 실제 상태와 동기화. */
(function () {
  'use strict';

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ── 드로어 ───────────────────────────────────────────────────────────── */
  function drawer() {
    var el = $('#drawer');
    var trigger = $('#burger');
    var closeBtn = $('#drawer-close');
    if (!el || !trigger) return;

    var lastFocus = null;

    function focusables() {
      return $$('a[href], button:not([disabled]), input, select, textarea', el)
        .filter(function (n) { return n.offsetParent !== null || n === document.activeElement; });
    }

    function open() {
      lastFocus = document.activeElement;
      el.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      var f = focusables();
      (f[0] || closeBtn || el).focus();
    }

    function close() {
      if (el.hidden) return;
      el.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      var back = lastFocus && document.contains(lastFocus) ? lastFocus : trigger;
      back.focus();
    }

    trigger.addEventListener('click', function () {
      if (el.hidden) open(); else close();
    });
    if (closeBtn) closeBtn.addEventListener('click', close);

    el.addEventListener('click', function (ev) {
      if (ev.target === el) close();
      var a = ev.target.closest && ev.target.closest('a');
      if (a) close();
    });

    document.addEventListener('keydown', function (ev) {
      if (el.hidden) return;
      if (ev.key === 'Escape') { ev.preventDefault(); close(); return; }
      if (ev.key !== 'Tab') return;
      var f = focusables();
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
      else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
    });

    // 데스크톱으로 넓어지면 드로어를 닫아 숨은 포커스를 남기지 않는다
    var mq = window.matchMedia('(min-width: 861px)');
    var onChange = function (e) { if (e.matches) close(); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  /* ── 헤더 그림자 / 맨 위로 ──────────────────────────────────────────────── */
  function scrollUi() {
    var hdr = $('[data-hdr]');
    var top = $('.totop');
    var tick = false;

    function update() {
      var y = window.pageYOffset || document.documentElement.scrollTop || 0;
      if (hdr) hdr.setAttribute('data-stuck', y > 8 ? 'true' : 'false');
      if (top) top.setAttribute('data-show', y > 560 ? 'true' : 'false');
      tick = false;
    }
    window.addEventListener('scroll', function () {
      if (tick) return;
      tick = true;
      window.requestAnimationFrame(update);
    }, { passive: true });
    update();

    if (top) {
      top.addEventListener('click', function (ev) {
        ev.preventDefault();
        var main = $('#main');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (main) main.focus({ preventScroll: true });
      });
    }
  }

  /* ── 폼 검증 ───────────────────────────────────────────────────────────── */
  function forms() {
    $$('form[data-form]').forEach(function (form) {
      var status = $('[data-form-status]', form);
      var L = function () { return (window.__MDMOON_I18N__ && window.__MDMOON_I18N__[window.__mdmoonLang || 'en']) || {}; };

      function fieldError(el) {
        if (el.type === 'email' && el.value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.value)) return true;
        if (el.required) return !String(el.value).trim();
        return false;
      }

      function clear(el) {
        el.removeAttribute('aria-invalid');
        var box = el.closest('.field');
        if (box) box.removeAttribute('data-invalid');
      }

      $$('input, textarea, select', form).forEach(function (el) {
        el.addEventListener('input', function () { clear(el); });
        el.addEventListener('blur', function () {
          if (el.value && fieldError(el)) el.setAttribute('aria-invalid', 'true');
        });
      });

      form.addEventListener('submit', function (ev) {
        var bad = [];
        $$('input[required], textarea[required], input[type="email"]', form).forEach(function (el) {
          if (fieldError(el)) { el.setAttribute('aria-invalid', 'true'); bad.push(el); }
          else clear(el);
        });
        if (bad.length) {
          ev.preventDefault();
          if (status) {
            status.textContent = L()['ui.form_err'] || 'Please check the highlighted fields.';
            status.setAttribute('data-state', 'error');
          }
          bad[0].focus();
        } else if (status) {
          status.textContent = L()['ui.form_ok'] || 'Thank you.';
          status.setAttribute('data-state', 'ok');
        }
      });
    });
  }

  /* ── 현재 연도 ─────────────────────────────────────────────────────────── */
  function misc() {
    $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
  }

  function init() { drawer(); scrollUi(); forms(); misc(); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
