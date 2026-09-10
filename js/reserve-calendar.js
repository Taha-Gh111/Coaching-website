(function () {
  "use strict";

  var trigger = document.getElementById("jalaliTrigger");
  var triggerText = document.getElementById("jalaliTriggerText");
  var panel = document.getElementById("jalaliCalendar");
  var monthLabel = document.getElementById("jalaliMonthLabel");
  var weekdaysEl = document.getElementById("jalaliWeekdays");
  var daysEl = document.getElementById("jalaliDays");
  var calNote = document.getElementById("jalaliCalNote");
  var prevBtn = document.getElementById("jalaliPrev");
  var nextBtn = document.getElementById("jalaliNext");
  var dateHiddenInput = document.getElementById("datePicker");
  var dateISOHiddenInput = document.getElementById("datePickerISO");
  var chipsWrap = document.getElementById("timeChips");
  var timeHiddenInput = document.getElementById("selectedTime");
  var timeSlotsNote = document.getElementById("timeSlotsNote");

  if (!trigger || !panel || !window.Jalali) return;

  var todayJS = new Date();
  todayJS.setHours(0, 0, 0, 0);
  var todayJ = Jalali.fromJSDate(todayJS);

  var viewYear = todayJ.jy;
  var viewMonth = todayJ.jm;

  var selected = null; // { jy, jm, jd, iso }
  var chipTexts = Array.prototype.map.call(chipsWrap.querySelectorAll(".chip"), function (c) {
    return c.textContent.trim();
  });

  // آرایه‌ای از {date, time} که از سرور (گوگل‌شیت) میاد
  var bookedSet = {}; // "iso|time" -> true
  var bookedDateCount = {}; // iso -> تعداد ساعت‌های رزروشده

  function isoOf(jy, jm, jd) {
    return Jalali.toISODate(Jalali.toJSDate(jy, jm, jd));
  }

  function isPastOrBlocked(jy, jm, jd) {
    var jsDate = Jalali.toJSDate(jy, jm, jd);
    if (jsDate < todayJS) return true;
    var dow = jsDate.getDay(); // شنبه=۶, چهارشنبه=۳
    if (dow === 6 || dow === 3) return true;
    return false;
  }

  function isFullyBooked(iso) {
    return (bookedDateCount[iso] || 0) >= chipTexts.length;
  }

  function renderWeekdays() {
    weekdaysEl.innerHTML = Jalali.WEEKDAY_SHORT.map(function (w) {
      return "<span>" + w + "</span>";
    }).join("");
  }

  function renderMonth() {
    monthLabel.textContent = Jalali.MONTH_NAMES[viewMonth - 1] + " " + Jalali.toPersianDigits(viewYear);

    var firstOfMonthJS = Jalali.toJSDate(viewYear, viewMonth, 1);
    var jsWeekday = firstOfMonthJS.getDay(); // 0=یکشنبه ... 6=شنبه (جاوااسکریپت)
    // تبدیل به آفست هفته‌ی فارسی که با شنبه شروع می‌شه: شنبه=0 ... جمعه=6
    var offset = (jsWeekday + 1) % 7;

    var len = Jalali.jalaaliMonthLength(viewYear, viewMonth);
    var html = "";

    for (var e = 0; e < offset; e++) {
      html += '<span class="jalali-empty">-</span>';
    }

    for (var d = 1; d <= len; d++) {
      var iso = isoOf(viewYear, viewMonth, d);
      var disabled = isPastOrBlocked(viewYear, viewMonth, d) || isFullyBooked(iso);
      var isToday = viewYear === todayJ.jy && viewMonth === todayJ.jm && d === todayJ.jd;
      var isSelected = selected && selected.jy === viewYear && selected.jm === viewMonth && selected.jd === d;

      var cls = [];
      if (isToday) cls.push("is-today");
      if (isSelected) cls.push("is-selected");

      html +=
        '<button type="button" class="' +
        cls.join(" ") +
        '" data-jy="' +
        viewYear +
        '" data-jm="' +
        viewMonth +
        '" data-jd="' +
        d +
        '"' +
        (disabled ? " disabled" : "") +
        ">" +
        Jalali.toPersianDigits(d) +
        "</button>";
    }

    daysEl.innerHTML = html;
  }

  function renderChipsAvailability() {
    var iso = selected ? selected.iso : null;
    var anyDisabled = false;

    chipsWrap.querySelectorAll(".chip").forEach(function (chip) {
      var text = chip.textContent.trim();
      var taken = iso && bookedSet[iso + "|" + text];
      chip.disabled = !!taken;
      if (taken) anyDisabled = true;
      if (taken && chip.classList.contains("selected")) {
        chip.classList.remove("selected");
        timeHiddenInput.value = "";
      }
    });

    timeSlotsNote.hidden = !(iso && isFullyBooked(iso));
  }

  function openPanel() {
    panel.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    renderMonth();
  }

  function closePanel() {
    panel.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
  }

  trigger.addEventListener("click", function (e) {
    e.stopPropagation();
    if (panel.hidden) openPanel();
    else closePanel();
  });

  document.addEventListener("click", function (e) {
    if (!panel.hidden && !panel.contains(e.target) && e.target !== trigger) {
      closePanel();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !panel.hidden) closePanel();
  });

  prevBtn.addEventListener("click", function () {
    viewMonth -= 1;
    if (viewMonth < 1) {
      viewMonth = 12;
      viewYear -= 1;
    }
    renderMonth();
  });

  nextBtn.addEventListener("click", function () {
    viewMonth += 1;
    if (viewMonth > 12) {
      viewMonth = 1;
      viewYear += 1;
    }
    renderMonth();
  });

  daysEl.addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-jy]");
    if (!btn || btn.disabled) return;

    var jy = +btn.getAttribute("data-jy");
    var jm = +btn.getAttribute("data-jm");
    var jd = +btn.getAttribute("data-jd");
    var iso = isoOf(jy, jm, jd);

    selected = { jy: jy, jm: jm, jd: jd, iso: iso };

    dateHiddenInput.value = Jalali.formatSlash(jy, jm, jd);
    dateISOHiddenInput.value = iso;
    triggerText.textContent = Jalali.formatSlash(jy, jm, jd);

    renderMonth();
    renderChipsAvailability();
    closePanel();

    dateHiddenInput.dispatchEvent(new Event("change", { bubbles: true }));
  });

  renderWeekdays();

  window.ReserveCalendar = {
    setBookedSlots: function (list) {
      bookedSet = {};
      bookedDateCount = {};
      (list || []).forEach(function (item) {
        if (!item || !item.date || !item.time) return;
        var key = item.date + "|" + item.time;
        bookedSet[key] = true;
        bookedDateCount[item.date] = (bookedDateCount[item.date] || 0) + 1;
      });
      if (!panel.hidden) renderMonth();
      renderChipsAvailability();
    },
    isSlotTaken: function (iso, time) {
      return !!bookedSet[iso + "|" + time];
    },
    getSelectedISO: function () {
      return selected ? selected.iso : null;
    },
  };
})();
