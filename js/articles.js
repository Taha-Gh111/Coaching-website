(function () {
  "use strict";

  /* ==========================================================================
     داده‌ی مقالات — فعلاً محتوای نمونه برای تست چیدمان و تعامل.
     در فاز بعد، هر آبجکت با متن و پوستر واقعی همان مقاله جایگزین می‌شود.
     ========================================================================== */
  var ARTICLES = [
    {
      id: "future-planning",
      tag: "رشد فردی",
      title: "چگونه برای آینده‌ات برنامه‌ریزی واقعی داشته باشی؟",
      excerpt: "از رویا تا عمل، با یک نقشه‌ی روشن — گام‌های عملی برای تبدیل هدف‌های بزرگ به برنامه‌ای قابل‌اجرا.",
      body: [
        "[متن کامل این مقاله در فاز بعدی جایگزین می‌شود. اینجا فقط برای تست چیدمان و اسکرول پنل مطالعه است.]",
        "[پاراگراف دوم نمونه — طول متن واقعی می‌تواند بیشتر یا کمتر از این باشد؛ چیدمان پنل با هر طولی کار می‌کند.]"
      ]
    },
    {
      id: "career-signals",
      tag: "کوچینگ شغلی",
      title: "۵ نشانه که وقت تغییر مسیر شغلی‌ست",
      excerpt: "وقتی رضایت شغلی افت می‌کند، مسئله همیشه «شغل اشتباه» نیست. این نشانه‌ها را جدی بگیرید.",
      body: [
        "[متن کامل این مقاله در فاز بعدی جایگزین می‌شود.]",
        "[پاراگراف دوم نمونه برای تست اسکرول پنل مطالعه.]"
      ]
    },
    {
      id: "business-finance",
      tag: "کسب‌وکار",
      title: "چرا اکثر کسب‌وکارهای کوچک بدون برنامه‌ی مالی شکست می‌خورند",
      excerpt: "سرمایه کافی نیست؛ بدون نقشه‌ی مالی روشن، رشد به همان سرعت که می‌آید از دست می‌رود.",
      body: [
        "[متن کامل این مقاله در فاز بعدی جایگزین می‌شود.]",
        "[پاراگراف دوم نمونه برای تست اسکرول پنل مطالعه.]"
      ]
    },
    {
      id: "leadership-crisis",
      tag: "رهبری",
      title: "رهبری در بحران: چطور تصمیم بگیریم وقتی همه‌چیز نامعلوم است",
      excerpt: "تصمیم‌گیری در ابهام یک مهارت است، نه یک استعداد ذاتی. این‌طور می‌شود تمرینش کرد.",
      body: [
        "[متن کامل این مقاله در فاز بعدی جایگزین می‌شود.]",
        "[پاراگراف دوم نمونه برای تست اسکرول پنل مطالعه.]"
      ]
    },
    {
      id: "coaching-vs-consulting",
      tag: "کوچینگ",
      title: "کوچینگ چیست و چه تفاوتی با مشاوره دارد؟",
      excerpt: "خیلی‌ها این دو را یکی می‌دانند. فهمیدن تفاوت، به انتخاب مسیر درست کمک می‌کند.",
      body: [
        "[متن کامل این مقاله در فاز بعدی جایگزین می‌شود.]",
        "[پاراگراف دوم نمونه برای تست اسکرول پنل مطالعه.]"
      ]
    },
    {
      id: "feedback-power",
      tag: "روان‌شناسی",
      title: "قدرت بازخورد: چطور از انتقاد برای رشد استفاده کنیم",
      excerpt: "بازخورد ناخوشایند معمولاً همان چیزی‌ست که بیشترین رشد را می‌سازد — اگر درست شنیده شود.",
      body: [
        "[متن کامل این مقاله در فاز بعدی جایگزین می‌شود.]",
        "[پاراگراف دوم نمونه برای تست اسکرول پنل مطالعه.]"
      ]
    }
  ];

  var POSTER_ICON =
    '<svg viewBox="0 0 48 48" fill="none"><rect x="4" y="4" width="40" height="40" rx="4" stroke="currentColor" stroke-width="1.4"/><circle cx="17" cy="17" r="4" stroke="currentColor" stroke-width="1.4"/><path d="M6 36 L18 24 L26 32 L34 22 L44 34" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var ARROW_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';

  var shell = document.getElementById("articlesShell");
  var grid = document.getElementById("articlesGrid");
  var reader = document.getElementById("articleReader");
  var readerContent = document.getElementById("readerContent");
  var readerClose = document.getElementById("readerClose");
  var lastTrigger = null;

  if (!shell || !grid || !reader) return;

  function cardHTML(article) {
    return (
      '<article class="article-card" data-id="' + article.id + '" tabindex="0" role="button" ' +
      'aria-label="مطالعه مقاله: ' + article.title + '">' +
      '<div class="article-poster" aria-hidden="true">' + <img src="../Assets/image/ChatGPT Image Sep 6, 2026, 08_44_18 PM.png" alt="" /> + "<span>پوستر مقاله</span></div>" +
      '<div class="article-body">' +
      '<span class="article-tag">' + article.tag + "</span>" +
      "<h3>" + article.title + "</h3>" +
      '<p class="article-excerpt">' + article.excerpt + "</p>" +
      '<span class="article-more">بیشتر بخوانید ' + ARROW_ICON + "</span>" +
      "</div>" +
      "</article>"
    );
  }

  function renderGrid() {
    grid.innerHTML = ARTICLES.map(cardHTML).join("");
  }

  function findArticle(id) {
    for (var i = 0; i < ARTICLES.length; i++) {
      if (ARTICLES[i].id === id) return ARTICLES[i];
    }
    return null;
  }

  function openArticle(id, triggerEl) {
    var article = findArticle(id);
    if (!article) return;

    lastTrigger = triggerEl || lastTrigger;

    readerContent.innerHTML =
      '<div class="reader-poster" aria-hidden="true">' + POSTER_ICON + "<span>پوستر مقاله</span></div>" +
      '<span class="reader-tag">' + article.tag + "</span>" +
      "<h2>" + article.title + "</h2>" +
      '<div class="reader-body">' +
      article.body.map(function (p) { return "<p>" + p + "</p>"; }).join("") +
      "</div>";

    shell.classList.add("is-split");
    reader.setAttribute("aria-hidden", "false");

    var cards = grid.querySelectorAll(".article-card");
    for (var i = 0; i < cards.length; i++) {
      cards[i].classList.toggle("is-active", cards[i].getAttribute("data-id") === id);
    }

    readerClose.focus({ preventScroll: true });
  }

  function closeReader() {
    shell.classList.remove("is-split");
    reader.setAttribute("aria-hidden", "true");

    var cards = grid.querySelectorAll(".article-card");
    for (var i = 0; i < cards.length; i++) {
      cards[i].classList.remove("is-active");
    }

    if (lastTrigger && typeof lastTrigger.focus === "function") {
      lastTrigger.focus({ preventScroll: true });
    }
  }

  grid.addEventListener("click", function (e) {
    var card = e.target.closest(".article-card");
    if (card) openArticle(card.getAttribute("data-id"), card);
  });

  grid.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    var card = e.target.closest(".article-card");
    if (card) {
      e.preventDefault();
      openArticle(card.getAttribute("data-id"), card);
    }
  });

  readerClose.addEventListener("click", closeReader);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && shell.classList.contains("is-split")) closeReader();
  });

  renderGrid();
})();
