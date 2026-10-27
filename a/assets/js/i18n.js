/* i18n.js — 3개 언어(EN/KO/ZH) 전환.
   사전은 빌드가 만드는 i18n-data.js(window.__MDMOON_I18N__)에서 온다.
   마크업 계약:
     data-i18n="key"              텍스트 교체
     data-i18n-html="key"         HTML 허용(줄바꿈 <br> 등 신뢰된 콘텐츠만)
     data-i18n-alt="key"          <img alt> 교체
     data-i18n-attr="attr:key,..."  aria-label 등 속성 교체
   언어 버튼은 <button aria-pressed>. 상태는 localStorage 에 남긴다. */
(function () {
  'use strict';

  var DICT = window.__MDMOON_I18N__ || {};
  var LANGS = Object.keys(DICT);
  var TAG = { en: 'en', ko: 'ko', zh: 'zh-Hans' };
  var NAME = { en: 'English', ko: '한국어', zh: '中文' };
  var STORE = 'mdmoon.lang';
  var current = 'en';

  function dict(lang) {
    return DICT[lang] || DICT.en || {};
  }

  function store(lang) {
    try { window.localStorage.setItem(STORE, lang); } catch (e) { /* 사생활 보호 모드 */ }
  }

  function restore() {
    var saved = null;
    try { saved = window.localStorage.getItem(STORE); } catch (e) { saved = null; }
    if (saved && LANGS.indexOf(saved) >= 0) return saved;
    var nav = (navigator.language || 'en').toLowerCase();
    if (nav.indexOf('ko') === 0) return 'ko';
    if (nav.indexOf('zh') === 0) return 'zh';
    return 'en';
  }

  function announce(text) {
    var live = document.getElementById('live');
    if (!live) return;
    live.textContent = '';
    window.setTimeout(function () { live.textContent = text; }, 40);
  }

  function decode(s) {
    return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');
  }

  function setRich(el, val) {
    // 사전 값에 <br>/<em> 같은 마크업이 들어 있는 키가 있다(빌드 시 원문 유지).
    // 값은 우리 저장소의 신뢰된 콘텐츠이므로 마크업이 있으면 innerHTML 로 넣고,
    // 없으면 엔티티를 풀어 텍스트로 넣는다(&amp; 가 그대로 보이지 않게).
    if (/<[a-z][^>]*>/i.test(val)) el.innerHTML = decode(val);
    else el.textContent = decode(val);
  }

  function apply(lang, opts) {
    if (LANGS.indexOf(lang) < 0) lang = 'en';
    var d = dict(lang);
    current = lang;

    document.documentElement.lang = TAG[lang] || lang;

    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var key = nodes[i].getAttribute('data-i18n');
      if (d[key] !== undefined) setRich(nodes[i], d[key]);
    }

    var htmlNodes = document.querySelectorAll('[data-i18n-html]');
    for (var j = 0; j < htmlNodes.length; j++) {
      var hk = htmlNodes[j].getAttribute('data-i18n-html');
      if (d[hk] !== undefined) htmlNodes[j].innerHTML = d[hk];
    }

    var alts = document.querySelectorAll('[data-i18n-alt]');
    for (var k = 0; k < alts.length; k++) {
      var ak = alts[k].getAttribute('data-i18n-alt');
      if (d[ak] !== undefined) alts[k].setAttribute('alt', d[ak]);
    }

    var lists = document.querySelectorAll('[data-i18n-list]');
    for (var l = 0; l < lists.length; l++) {
      var lk = lists[l].getAttribute('data-i18n-list');
      var raw = d[lk];
      if (raw === undefined) continue;
      var parts = decode(raw).split('·');
      while (lists[l].firstChild) lists[l].removeChild(lists[l].firstChild);
      for (var q = 0; q < parts.length; q++) {
        var text = parts[q].trim();
        if (!text) continue;
        var li = document.createElement('li');
        li.textContent = text;
        lists[l].appendChild(li);
      }
    }

    var attrNodes = document.querySelectorAll('[data-i18n-attr]');
    for (var m = 0; m < attrNodes.length; m++) {
      var pairs = attrNodes[m].getAttribute('data-i18n-attr').split(',');
      for (var n = 0; n < pairs.length; n++) {
        var bits = pairs[n].split(':');
        if (bits.length !== 2) continue;
        var attr = bits[0].trim(), key2 = bits[1].trim();
        if (d[key2] !== undefined) attrNodes[m].setAttribute(attr, d[key2]);
      }
    }

    var root = document.documentElement;
    var tk = root.getAttribute('data-title-key');
    var dk = root.getAttribute('data-desc-key');
    if (tk && d[tk]) document.title = d[tk];
    if (dk && d[dk]) {
      var md = document.querySelector('meta[name="description"]');
      if (md) md.setAttribute('content', d[dk]);
    }
    var ogt = document.querySelector('meta[property="og:title"]');
    if (ogt && tk && d[tk]) ogt.setAttribute('content', d[tk]);
    var ogd = document.querySelector('meta[property="og:description"]');
    if (ogd && dk && d[dk]) ogd.setAttribute('content', d[dk]);

    var btns = document.querySelectorAll('[data-lang]');
    for (var p = 0; p < btns.length; p++) {
      btns[p].setAttribute('aria-pressed', btns[p].getAttribute('data-lang') === lang ? 'true' : 'false');
    }

    store(lang);
    if (opts && opts.announce) announce(d['ui.lang_ok'] || ('Language: ' + NAME[lang]));
    window.__mdmoonLang = lang;
  }

  function init() {
    if (!LANGS.length) return;
    apply(restore(), { announce: false });

    document.addEventListener('click', function (ev) {
      var btn = ev.target.closest ? ev.target.closest('[data-lang]') : null;
      if (!btn) return;
      ev.preventDefault();
      var lang = btn.getAttribute('data-lang');
      if (lang === current) return;
      apply(lang, { announce: true });
    });
  }

  window.__setLang = function (lang) { apply(lang, { announce: false }); };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
