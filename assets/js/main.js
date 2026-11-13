/* BEES HOME CLEANING LLC-H1 — main.js */
(function () {
  "use strict";

  /* ---------- AOS ---------- */
  if (window.AOS) {
    AOS.init({ duration: 800, easing: "ease-out-cubic", once: true, offset: 60 });
  }

  /* ---------- Sticky header shadow + back to top ---------- */
  var header = document.querySelector(".site-header");
  var backTop = document.querySelector(".back-top");
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle("scrolled", y > 10);
    if (backTop) backTop.classList.toggle("show", y > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (backTop) backTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

  /* ---------- Active nav link ---------- */
  var page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll(".site-header [data-page]").forEach(function (el) {
    var pages = el.getAttribute("data-page").split(",");
    if (pages.indexOf(page) !== -1) {
      el.classList.add("active");
      var dd = el.closest(".dropdown");
      if (dd) dd.querySelector(".nav-link").classList.add("active");
    }
  });

  /* ---------- Before / After sliders ---------- */
  document.querySelectorAll(".ba-slider").forEach(function (slider) {
    var dragging = false;
    function setPos(clientX) {
      var r = slider.getBoundingClientRect();
      var p = Math.min(Math.max((clientX - r.left) / r.width, 0.02), 0.98);
      slider.style.setProperty("--pos", (p * 100).toFixed(2) + "%");
    }
    slider.addEventListener("pointerdown", function (e) { dragging = true; slider.setPointerCapture(e.pointerId); setPos(e.clientX); });
    slider.addEventListener("pointermove", function (e) { if (dragging) setPos(e.clientX); });
    ["pointerup", "pointercancel"].forEach(function (ev) { slider.addEventListener(ev, function () { dragging = false; }); });
    slider.setAttribute("tabindex", "0");
    slider.setAttribute("role", "slider");
    slider.setAttribute("aria-label", "Before and after comparison");
    slider.addEventListener("keydown", function (e) {
      var cur = parseFloat(getComputedStyle(slider).getPropertyValue("--pos")) || 50;
      if (e.key === "ArrowLeft") cur -= 5; else if (e.key === "ArrowRight") cur += 5; else return;
      e.preventDefault();
      slider.style.setProperty("--pos", Math.min(Math.max(cur, 2), 98) + "%");
    });
  });

  /* ---------- Review carousel ---------- */
  document.querySelectorAll("[data-reviews]").forEach(function (wrap) {
    var track = wrap.querySelector(".review-track");
    var cards = track ? track.children : [];
    var dotsWrap = wrap.querySelector(".review-dots");
    var prev = wrap.querySelector("[data-prev]");
    var next = wrap.querySelector("[data-next]");
    if (!track || !cards.length) return;
    var index = 0;
    function perView() { return window.innerWidth < 768 ? 1 : 2; }
    function maxIndex() { return Math.max(cards.length - perView(), 0); }
    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = "";
      for (var i = 0; i <= maxIndex(); i++) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", "Go to review " + (i + 1));
        b.addEventListener("click", (function (n) { return function () { go(n); }; })(i));
        dotsWrap.appendChild(b);
      }
    }
    function go(n) {
      index = (n + maxIndex() + 1) % (maxIndex() + 1);
      var gap = parseFloat(getComputedStyle(track).gap) || 0;
      track.style.transform = "translateX(-" + index * (cards[0].offsetWidth + gap) + "px)";
      if (dotsWrap) Array.prototype.forEach.call(dotsWrap.children, function (d, i) { d.classList.toggle("active", i === index); });
    }
    if (prev) prev.addEventListener("click", function () { go(index - 1); });
    if (next) next.addEventListener("click", function () { go(index + 1); });
    var timer = setInterval(function () { go(index + 1); }, 6000);
    wrap.addEventListener("mouseenter", function () { clearInterval(timer); });
    window.addEventListener("resize", function () { buildDots(); go(Math.min(index, maxIndex())); });
    buildDots(); go(0);
  });

  /* ---------- Counters ---------- */
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseFloat(el.getAttribute("data-count"));
        var suffix = el.getAttribute("data-suffix") || "";
        var start = null, dur = 1600;
        function tick(t) {
          if (!start) start = t;
          var p = Math.min((t - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased).toLocaleString("en-US") + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        io.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { io.observe(c); });
  }

  /* ---------- Gallery filter ---------- */
  document.querySelectorAll("[data-filter-group]").forEach(function (group) {
    var scope = document.querySelector(group.getAttribute("data-filter-group"));
    group.querySelectorAll(".filter-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        group.querySelectorAll(".filter-btn").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        var f = btn.getAttribute("data-filter");
        scope.querySelectorAll("[data-cat]").forEach(function (item) {
          var show = f === "all" || item.getAttribute("data-cat").split(" ").indexOf(f) !== -1;
          item.style.display = show ? "" : "none";
        });
        if (window.AOS) AOS.refresh();
      });
    });
  });

  /* ---------- Forms (front-end demo handling) ---------- */
  document.querySelectorAll("form[data-demo-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.classList.add("was-validated"); return; }
      var msg = form.querySelector(".form-success");
      if (msg) { msg.classList.add("show"); }
      form.reset();
      form.classList.remove("was-validated");
      setTimeout(function () { if (msg) msg.classList.remove("show"); }, 6000);
    });
  });

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
