/* ==========================================================================
   site.js — language switching, drawer, reveals, gallery lightbox, video
   ========================================================================== */
(function () {
  "use strict";

  var LANGS = ["en", "ko", "zh"];
  var STORE = "mdmoon.lang";

  /* 캡처/인쇄 안정화: 애니메이션 없이 렌더 (?noanim=1) */
  try {
    if (new URLSearchParams(location.search).get("noanim") === "1") {
      document.documentElement.classList.add("no-anim");
    }
  } catch (e) {}

  /* ---------------------------------------------------------- language */
  function preferred() {
    var q = null;
    try { q = new URLSearchParams(location.search).get("lang"); } catch (e) {}
    if (q && LANGS.indexOf(q) > -1) return q;
    var saved = null;
    try { saved = localStorage.getItem(STORE); } catch (e) {}
    if (saved && LANGS.indexOf(saved) > -1) return saved;
    var nav = (navigator.language || "en").toLowerCase();
    if (nav.indexOf("ko") === 0) return "ko";
    if (nav.indexOf("zh") === 0) return "zh";
    return "en";
  }

  function apply(lang) {
    var dict = (window.I18N && window.I18N[lang]) || {};
    var fallback = (window.I18N && window.I18N.en) || {};

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      var val = dict[key] !== undefined ? dict[key] : fallback[key];
      if (val === undefined) return;
      if (el.hasAttribute("data-i18n-attr")) {
        el.setAttribute(el.getAttribute("data-i18n-attr"), val);
      } else {
        el.innerHTML = val;
      }
    });

    document.querySelectorAll("[data-i18n-label]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-label");
      var val = dict[key] !== undefined ? dict[key] : fallback[key];
      if (val !== undefined) el.setAttribute("aria-label", val);
    });

    var titles = dict["meta." + (document.body.dataset.page || "home") + ".title"];
    if (titles) document.title = titles;

    document.documentElement.setAttribute("lang", lang === "zh" ? "zh-CN" : lang);
    document.documentElement.setAttribute("data-lang", lang);

    document.querySelectorAll(".lang__btn").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.lang === lang));
    });

    try { localStorage.setItem(STORE, lang); } catch (e) {}

    /* keep in-page links language-aware (static files, no query needed) */
    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang: lang } }));
  }

  document.querySelectorAll(".lang__btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      apply(btn.dataset.lang);
    });
  });

  var startLang = preferred();
  if (window.I18N) apply(startLang);

  /* --------------------------------------------------------- skip link */
  /* #main 은 tabindex="-1" 이라 focus() 로 포커스가 실제 이동한다.
     앵커 기본동작(해시 이동)은 그대로 둔다 — preventDefault 하지 않음. */
  var skipLink = document.querySelector(".skip-link");
  var mainEl = document.getElementById("main");
  if (skipLink && mainEl) {
    skipLink.addEventListener("click", function () {
      mainEl.focus();
    });
  }

  /* ------------------------------------------------------------ drawer */
  var drawer = document.querySelector(".drawer");
  var openBtn = document.querySelector(".menu-btn");
  var closeBtn = document.querySelector(".drawer__close");

  if (openBtn && drawer) {
    openBtn.addEventListener("click", function () {
      drawer.classList.add("is-open");
      document.body.style.overflow = "hidden";
      if (closeBtn) closeBtn.focus();
    });
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove("is-open");
    document.body.style.overflow = "";
  }
  if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
  if (drawer) {
    drawer.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeDrawer);
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeDrawer();
  });

  /* ------------------------------------------------------- sticky header */
  var head = document.querySelector(".masthead");
  if (head) {
    var onScroll = function () {
      head.classList.toggle("is-stuck", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ----------------------------------------------------------- reveals */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* 안전망: 로드 시점에 뷰포트 안에 있는데 아직 안 뜬 요소는 즉시 표시
     (IO 콜백 타이밍/헤드리스 렌더에서 카드가 비어 보이는 문제 방지) */
  window.addEventListener("load", function () {
    var vh = window.innerHeight || 800;
    reveals.forEach(function (el) {
      if (el.classList.contains("is-in")) return;
      var r = el.getBoundingClientRect();
      if (r.top < vh + 200 && r.bottom > -200) el.classList.add("is-in");
    });
  });

  /* ----------------------------------------------------------- gallery */
  var galItems = Array.prototype.slice.call(document.querySelectorAll(".gal__item"));
  if (galItems.length) {
    var box = document.querySelector(".lightbox");
    var boxImg = box ? box.querySelector("img") : null;
    var idx = 0;

    galItems.forEach(function (item, i) {
      var img = item.querySelector("img");
      if (img) {
        if (img.complete) img.classList.add("is-loaded");
        else img.addEventListener("load", function () { img.classList.add("is-loaded"); });
      }
      item.addEventListener("click", function () {
        if (!box || !boxImg) return;
        idx = i;
        show(i);
      });
    });

    function show(i) {
      idx = (i + galItems.length) % galItems.length;
      var img = galItems[idx].querySelector("img");
      if (!img) return;
      boxImg.src = img.currentSrc || img.src;
      boxImg.alt = img.alt || "";
      box.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }

    if (box) {
      box.addEventListener("click", function (e) {
        if (e.target === box) closeBox();
      });
      var closeEl = box.querySelector(".lightbox__close");
      var prevEl = box.querySelector(".lightbox__nav--prev");
      var nextEl = box.querySelector(".lightbox__nav--next");
      if (closeEl) closeEl.addEventListener("click", closeBox);
      if (prevEl) prevEl.addEventListener("click", function () { show(idx - 1); });
      if (nextEl) nextEl.addEventListener("click", function () { show(idx + 1); });
      document.addEventListener("keydown", function (e) {
        if (!box.classList.contains("is-open")) return;
        if (e.key === "Escape") closeBox();
        if (e.key === "ArrowLeft") show(idx - 1);
        if (e.key === "ArrowRight") show(idx + 1);
      });
    }

    function closeBox() {
      if (!box) return;
      box.classList.remove("is-open");
      document.body.style.overflow = "";
    }
  }

  /* ------------------------------------------------------------- video */
  document.querySelectorAll(".video__play").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.dataset.video;
      if (!id) return;
      var frame = document.createElement("iframe");
      frame.src = "https://www.youtube-nocookie.com/embed/" + id +
        "?autoplay=1&rel=0&modestbranding=1";
      frame.title = "Taewon Moon, MD — clinic film";
      frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      frame.setAttribute("allowfullscreen", "");
      frame.setAttribute("loading", "lazy");
      var wrap = btn.parentElement;
      wrap.innerHTML = "";
      wrap.appendChild(frame);
    });
  });

  /* ---------------------------------------------------- click-to-load map */
  document.querySelectorAll(".office__map").forEach(function (box) {
    var btn = box.querySelector(".office__mapbtn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var src = box.getAttribute("data-map-src");
      if (!src) return;
      var frame = document.createElement("iframe");
      frame.src = src;
      frame.title = "Map";
      frame.loading = "lazy";
      frame.setAttribute("referrerpolicy", "no-referrer-when-downgrade");
      box.insertBefore(frame, box.firstChild);
      btn.remove();
    });
  });

  /* ---------------------------------------------------------- promo carousel */
  var track = document.querySelector("[data-promo-track]");
  if (track) {
    var dotsBox = document.querySelector("[data-promo-dots]");
    var slides = Array.prototype.slice.call(track.children);
    var prevBtn = document.querySelector(".promo__nav--prev");
    var nextBtn = document.querySelector(".promo__nav--next");

    function stepSize() {
      var first = slides[0];
      if (!first) return 300;
      var cs = window.getComputedStyle(track);
      var gap = parseFloat(cs.columnGap || cs.gap || "16") || 16;
      return first.getBoundingClientRect().width + gap;
    }

    if (prevBtn) prevBtn.addEventListener("click", function () {
      track.scrollBy({ left: -stepSize(), behavior: "smooth" });
    });
    if (nextBtn) nextBtn.addEventListener("click", function () {
      track.scrollBy({ left: stepSize(), behavior: "smooth" });
    });

    if (dotsBox) {
      slides.forEach(function (_, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "promo__dot";
        b.setAttribute("aria-label", "Slide " + (i + 1));
        b.addEventListener("click", function () {
          track.scrollTo({ left: i * stepSize(), behavior: "smooth" });
        });
        dotsBox.appendChild(b);
      });
    }

    var dots = dotsBox ? Array.prototype.slice.call(dotsBox.children) : [];
    function syncPromo() {
      var i = Math.round(track.scrollLeft / stepSize());
      dots.forEach(function (d, k) { d.classList.toggle("is-active", k === i); });
      if (prevBtn) prevBtn.disabled = track.scrollLeft < 4;
      if (nextBtn) nextBtn.disabled =
        track.scrollLeft > track.scrollWidth - track.clientWidth - 4;
    }
    track.addEventListener("scroll", syncPromo, { passive: true });
    window.addEventListener("resize", syncPromo);
    syncPromo();

    /* 마우스 드래그로 밀기 (터치는 네이티브 스크롤 사용) */
    var dragging = false, dragStartX = 0, dragStartLeft = 0, dragMoved = false;
    track.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "touch") return;
      dragging = true;
      dragMoved = false;
      dragStartX = e.clientX;
      dragStartLeft = track.scrollLeft;
      track.classList.add("is-dragging");
      try { track.setPointerCapture(e.pointerId); } catch (err) {}
    });
    track.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - dragStartX;
      if (Math.abs(dx) > 4) dragMoved = true;
      track.scrollLeft = dragStartLeft - dx;
      e.preventDefault();
    });
    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      track.classList.remove("is-dragging");
      try { track.releasePointerCapture(e.pointerId); } catch (err) {}
    }
    track.addEventListener("pointerup", endDrag);
    track.addEventListener("pointercancel", endDrag);
    track.addEventListener("pointerleave", function (e) {
      if (dragging) endDrag(e);
    });
  }

  /* ------------------------------------------- language-aware promo images */
  function swapPromoImages(lang) {
    document.querySelectorAll("[data-src-" + lang + "]").forEach(function (img) {
      var src = img.getAttribute("data-src-" + lang);
      if (src && img.getAttribute("src") !== src) img.setAttribute("src", src);
    });
  }
  swapPromoImages(document.documentElement.getAttribute("data-lang") || "en");
  document.addEventListener("langchange", function (e) {
    swapPromoImages((e.detail && e.detail.lang) || "en");
  });

  /* -------------------------------------------------------- year stamp */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* --------------------------------------------- appointment form sent */
  try {
    var params = new URLSearchParams(location.search);
    if (params.get("sent") === "1") {
      var sec = document.getElementById("appointment");
      var host = sec ? sec.querySelector(".container") : null;
      if (host) {
        var note = document.createElement("p");
        note.className = "form__sent";
        note.setAttribute("data-i18n", "form.sent");
        note.textContent = "Thank you — your request has been sent.";
        host.prepend(note);
        if (window.I18N) { /* 언어 사전이 있으면 즉시 번역 적용 */
          var cur = document.documentElement.getAttribute("data-lang") || "en";
          var dict = window.I18N[cur] || window.I18N.en || {};
          if (dict["form.sent"]) note.textContent = dict["form.sent"];
        }
        apply(document.documentElement.getAttribute("data-lang") || "en");
      }
    }
  } catch (e) {}
})();
