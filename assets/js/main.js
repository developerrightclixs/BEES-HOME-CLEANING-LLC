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

  /* ---------- Membership subscribe pop-up ---------- */
  function esc(t) { var d = document.createElement("div"); d.textContent = t; return d.innerHTML; }
  function clean(t) { return (t || "").replace(/\s+/g, " ").trim(); }

  var subscribeBtns = Array.prototype.filter.call(
    document.querySelectorAll(".price-card a.btn-bee, .price-card button.btn-bee"),
    function (b) { return /subscribe/i.test(b.textContent); }
  );
  if (subscribeBtns.length && window.bootstrap) {
    var modalEl = document.createElement("div");
    modalEl.className = "modal fade bee-modal";
    modalEl.id = "membershipModal";
    modalEl.tabIndex = -1;
    modalEl.setAttribute("aria-labelledby", "membershipModalTitle");
    modalEl.setAttribute("aria-hidden", "true");
    modalEl.innerHTML =
      '<div class="modal-dialog modal-dialog-centered">' +
        '<div class="modal-content">' +
          '<button type="button" class="bee-modal-close" data-bs-dismiss="modal" aria-label="Close"><i class="bi bi-x-lg"></i></button>' +
          '<span class="eyebrow">Membership</span>' +
          '<h2 class="h1-bee" id="membershipModalTitle">Start your membership</h2>' +
          '<p class="body-text mt-2 mb-4">Leave your details and our Findlay team will call you to set up your first visit.</p>' +
          '<form data-demo-form novalidate>' +
            '<div class="selected-pill mb-4"><i class="bi bi-patch-check-fill"></i><div><span>You’ve selected</span><strong data-plan-label>—</strong></div></div>' +
            '<input type="hidden" name="membership" data-plan-input>' +
            '<div class="mb-3"><label class="form-label" for="mmName">Name</label><input class="form-control" id="mmName" name="name" type="text" placeholder="Your name" autocomplete="name" required><div class="invalid-feedback">Please enter your name.</div></div>' +
            '<div class="mb-3"><label class="form-label" for="mmEmail">Email</label><input class="form-control" id="mmEmail" name="email" type="email" placeholder="name@example.com" autocomplete="email" required><div class="invalid-feedback">Please enter a valid email.</div></div>' +
            '<div class="mb-3"><label class="form-label" for="mmPhone">Phone number</label><input class="form-control" id="mmPhone" name="phone" type="tel" placeholder="(555) 555-5555" autocomplete="tel" required><div class="invalid-feedback">Please enter your phone number.</div></div>' +
            '<div class="mb-4"><label class="form-label" for="mmPlan">Membership plan</label><input class="form-control" id="mmPlan" type="text" readonly data-plan-field></div>' +
            '<button class="btn-bee btn-primary-bee btn-block" type="submit">Subscribe <i class="bi bi-arrow-right"></i></button>' +
            '<div class="form-success"><i class="bi bi-check-circle-fill"></i> Thanks! We’ll call you shortly to confirm your membership.</div>' +
          '</form>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modalEl);
    var modal = new bootstrap.Modal(modalEl);

    subscribeBtns.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        var card = btn.closest(".price-card");
        var name = clean(card.querySelector(".plan-name") && card.querySelector(".plan-name").textContent);
        var amtEl = card.querySelector(".price .amt") || card.querySelector(".price");
        var amt = amtEl ? clean(amtEl.firstChild && amtEl.firstChild.nodeType === 3 ? amtEl.firstChild.textContent : amtEl.textContent) : "";
        var activeBill = document.querySelector(".billing-toggle button.active");
        var isAnnual = !!(activeBill && /annual/i.test(activeBill.textContent));
        if (amtEl && amtEl.getAttribute("data-" + (isAnnual ? "annual" : "monthly"))) amt = amtEl.getAttribute("data-" + (isAnnual ? "annual" : "monthly"));
        var freq = card.querySelector(".tag");
        var label = name + (amt ? " — " + amt + " / month" : "") + (freq ? " (" + clean(freq.textContent) + ")" : "");
        if (isAnnual) label += ", billed yearly";
        modalEl.querySelector("[data-plan-label]").innerHTML = esc(label);
        ["[data-plan-input]", "[data-plan-field]"].forEach(function (sel) {
          var f = modalEl.querySelector(sel); f.value = label; f.defaultValue = label;
        });
        var form = modalEl.querySelector("form");
        form.classList.remove("was-validated");
        form.querySelector(".form-success").classList.remove("show");
        modal.show();
      });
    });
    modalEl.addEventListener("shown.bs.modal", function () { modalEl.querySelector("#mmName").focus(); });
  }

  /* ---------- Buy Package -> contact form with package pre-selected ---------- */
  document.querySelectorAll(".bundle-card a.btn-bee").forEach(function (a) {
    if (!/buy package/i.test(a.textContent)) return;
    var card = a.closest(".bundle-card");
    var title = card.querySelector("h2, h3");
    if (title) a.href = "contact.html?package=" + encodeURIComponent(clean(title.textContent)) + "#contact-form";
  });

  var pkgSelect = document.getElementById("cPackage");
  if (pkgSelect) {
    var chosen = new URLSearchParams(location.search).get("package");
    var note = document.getElementById("pkgSelectedNote");
    var msgField = document.getElementById("cMsg");
    var msgLabel = msgField ? document.querySelector('label[for="cMsg"]') : null;
    var optTag = document.createElement("span");
    optTag.className = "text-muted-bee fw-normal";
    optTag.textContent = " (optional)";
    function showPkgNote() {
      var opt = pkgSelect.options[pkgSelect.selectedIndex];
      // Message is optional once a package is picked
      if (msgField) {
        msgField.required = !pkgSelect.value;
        if (pkgSelect.value) {
          msgField.classList.remove("is-invalid");
          if (msgLabel && !msgLabel.contains(optTag)) msgLabel.appendChild(optTag);
          msgField.placeholder = "Anything we should know? (optional)";
        } else {
          if (optTag.parentNode) optTag.parentNode.removeChild(optTag);
          msgField.placeholder = "Tell us about your home and what you need…";
        }
      }
      if (note) {
        if (pkgSelect.value) {
          note.querySelector("strong").textContent = clean(opt.textContent);
          note.hidden = false;
        } else note.hidden = true;
      }
    }
    if (chosen) {
      Array.prototype.forEach.call(pkgSelect.options, function (o) {
        if (o.value.toLowerCase() === chosen.toLowerCase()) pkgSelect.value = o.value;
      });
    }
    if (pkgSelect.value) {
      Array.prototype.forEach.call(pkgSelect.options, function (o) { o.defaultSelected = o.value === pkgSelect.value; });
    }
    pkgSelect.addEventListener("change", showPkgNote);
    if (pkgSelect.form) pkgSelect.form.addEventListener("reset", function () { setTimeout(showPkgNote, 0); });
    showPkgNote();
  }

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

  /* ---------- Footer wordmark: always fit the container width ---------- */
  document.querySelectorAll(".f-wordmark").forEach(function (wm) {
    if (!wm.querySelector("span")) wm.innerHTML = "<span>" + wm.textContent + "</span>";
    var inner = wm.querySelector("span");
    function fit() {
      wm.style.fontSize = "";
      var max = parseFloat(getComputedStyle(wm).fontSize);
      var avail = wm.clientWidth;
      var w = inner.getBoundingClientRect().width;
      if (w > avail && w > 0) wm.style.fontSize = Math.floor(max * avail / w * 0.98) + "px";
    }
    fit();
    window.addEventListener("resize", fit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  });

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
