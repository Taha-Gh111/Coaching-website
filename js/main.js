(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header scroll state ---------- */
  var header = document.getElementById("site-header");
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 12) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Mobile nav ---------- */
  var toggle = document.getElementById("menu-toggle");
  var mobileNav = document.getElementById("mobile-nav");
  var closeBtn = document.getElementById("mobile-nav-close");
  var backdrop = document.getElementById("mobile-nav-backdrop");

  function openNav() {
    mobileNav.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "بستن منو");
    document.body.style.overflow = "hidden";
    if (closeBtn) closeBtn.focus();
  }

  function closeNav() {
    mobileNav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "باز کردن منو");
    document.body.style.overflow = "";
    toggle.focus();
  }

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var isOpen = mobileNav.classList.contains("is-open");
      if (isOpen) {
        closeNav();
      } else {
        openNav();
      }
    });

    if (closeBtn) closeBtn.addEventListener("click", closeNav);
    if (backdrop) backdrop.addEventListener("click", closeNav);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mobileNav.classList.contains("is-open")) {
        closeNav();
      }
    });

    // Close the panel whenever a nav link inside it is followed
    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });
  }

  /* ---------- Scroll reveal (one quiet technique, section-level) ---------- */
  var revealEls = document.querySelectorAll(".reveal-on-scroll");
  if (revealEls.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) {
        el.classList.add("is-visible");
      });
    } else {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
      );
      revealEls.forEach(function (el) {
        io.observe(el);
      });
    }
  }

  /* ---------- Footer clock (decorative — hidden from assistive tech) ---------- */
  var clockEl = document.getElementById("clock");
  var dateEl = document.getElementById("date");

  function updateClock() {
    var now = new Date();
    if (clockEl) clockEl.textContent = now.toLocaleTimeString("fa-IR");
    if (dateEl) dateEl.textContent = now.toLocaleDateString("fa-IR");
  }

  if (clockEl || dateEl) {
    updateClock();
    setInterval(updateClock, 1000);
  }
})();