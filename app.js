(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---- year ---- */
  var yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---- scroll progress ---- */
  var prog = document.querySelector(".scroll-progress");
  function onScroll() {
    var top = document.querySelector(".topbar");
    if (top) top.classList.toggle("scrolled", window.scrollY > 24);
    if (prog) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      prog.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- reveal on scroll ---- */
  var reveals = document.querySelectorAll("[data-reveal]");
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---- count up ---- */
  var counters = document.querySelectorAll("[data-count]");
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var dec = (el.getAttribute("data-count").split(".")[1] || "").length;
    if (reduce) { el.textContent = target.toFixed(dec); return; }
    var start = null, dur = 1500;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(dec);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toFixed(dec);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---- mobile menu: close on navigate ---- */
  var toggle = document.getElementById("navtoggle");
  if (toggle) {
    document.querySelectorAll(".nav a").forEach(function (a) {
      a.addEventListener("click", function () { toggle.checked = false; });
    });
  }

  /* ---- custom cursor ---- */
  if (fine && !reduce) {
    var dot = document.createElement("div"); dot.className = "cursor-dot";
    var ring = document.createElement("div"); ring.className = "cursor-ring";
    document.body.appendChild(dot); document.body.appendChild(ring);
    var mx = -100, my = -100, rx = -100, ry = -100, raf = null;
    function loop() {
      rx += (mx - rx) * 0.55; ry += (my - ry) * 0.55;
      ring.style.left = rx + "px"; ring.style.top = ry + "px";
      if (Math.abs(mx - rx) > 0.3 || Math.abs(my - ry) > 0.3) raf = requestAnimationFrame(loop);
      else raf = null;
    }
    document.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + "px"; dot.style.top = my + "px";
      if (raf === null) raf = requestAnimationFrame(loop);
    });
    var hot = "a, button, .btn, .pillar, .member, .teaser, .news-item, .press-item, .nav-burger, [data-cursor]";
    document.querySelectorAll(hot).forEach(function (el) {
      el.addEventListener("mouseenter", function () { ring.classList.add("hover"); });
      el.addEventListener("mouseleave", function () { ring.classList.remove("hover"); });
    });
    document.addEventListener("mouseleave", function () { dot.style.opacity = 0; ring.style.opacity = 0; });
    document.addEventListener("mouseenter", function () { dot.style.opacity = 1; ring.style.opacity = .5; });
  }
})();
