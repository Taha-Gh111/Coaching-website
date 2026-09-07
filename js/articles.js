(function () {
  "use strict";

  /* ==========================================================================
     این فایل دیگه محتوای مقاله‌ها رو نگه نمی‌داره — هر مقاله یک صفحه‌ی HTML
     واقعی داره (برای سئو و ویرایش راحت‌تر). این اسکریپت فقط رفتار اختیاری
     «پنل نصفه» رو اضافه می‌کنه:
       ۱) روی کلیک، به‌جای رفتن به صفحه، محتوای همون فایل رو fetch می‌کنه
       ۲) بخش [data-article-content] رو از داخلش درمیاره و توی پنل نشون می‌ده
       ۳) اگه fetch به هر دلیلی (مثلاً باز کردن فایل به‌صورت مستقیم بدون
          سرور) شکست بخوره، به‌صورت خودکار همون لینک معمولی رو باز می‌کنه —
          یعنی صفحه هیچ‌وقت خراب یا خالی نمی‌مونه.
     ========================================================================== */

  var shell = document.getElementById("articlesShell");
  var grid = document.getElementById("articlesGrid");
  var reader = document.getElementById("articleReader");
  var readerContent = document.getElementById("readerContent");
  var readerClose = document.getElementById("readerClose");
  var lastTrigger = null;

  // اگه عناصر لازم پیدا نشدن یا مرورگر fetch رو پشتیبانی نمی‌کنه، هیچ کاری
  // نکن — کارت‌ها همون لینک‌های ساده و کاملاً کاربردی می‌مونن.
  if (!shell || !grid || !reader || !readerContent || !readerClose || !window.fetch) {
    return;
  }

  var cards = grid.querySelectorAll(".article-card");

  function setActive(url) {
    cards.forEach(function (c) {
      c.classList.toggle("is-active", c.getAttribute("href") === url);
    });
  }

  function openArticle(url, triggerEl, pushHistory) {
    lastTrigger = triggerEl || lastTrigger;

    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error("fetch failed: " + res.status);
        return res.text();
      })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        var content = doc.querySelector("[data-article-content]");
        if (!content) throw new Error("no article content found");

        readerContent.innerHTML = content.innerHTML;
        shell.classList.add("is-split");
        reader.setAttribute("aria-hidden", "false");
        setActive(url);
        reader.scrollTop = 0;
        readerClose.focus({ preventScroll: true });

        if (pushHistory !== false) {
          history.pushState({ zaribafanArticle: url }, "", url);
        }

        var h1 = readerContent.querySelector("h1");
        if (h1) document.title = h1.textContent + " | Zaribafan";
      })
      .catch(function () {
        // شکست fetch (مثلاً فایل به‌صورت مستقیم و بدون سرور باز شده) —
        // به‌جای صفحه‌ی خراب، همون ناوبری معمولی رو انجام بده.
        window.location.href = url;
      });
  }

  function closeReader(pushHistory) {
    shell.classList.remove("is-split");
    reader.setAttribute("aria-hidden", "true");
    setActive(null);

    if (pushHistory !== false) {
      history.pushState({}, "", "articles.html");
    }

    if (lastTrigger && typeof lastTrigger.focus === "function") {
      lastTrigger.focus({ preventScroll: true });
    }
  }

  cards.forEach(function (card) {
    card.addEventListener("click", function (e) {
      e.preventDefault();
      openArticle(card.getAttribute("href"), card);
    });
  });

  readerClose.addEventListener("click", function () {
    closeReader();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && shell.classList.contains("is-split")) {
      closeReader();
    }
  });

  window.addEventListener("popstate", function (e) {
    if (e.state && e.state.zaribafanArticle) {
      openArticle(e.state.zaribafanArticle, null, false);
    } else if (shell.classList.contains("is-split")) {
      closeReader(false);
    }
  });
})();