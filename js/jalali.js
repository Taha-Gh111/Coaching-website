/**
 * تبدیل تاریخ میلادی ↔ شمسی
 * الگوریتم بر پایه‌ی کتابخانه‌ی متن‌باز jalaali-js (MIT License)
 * https://github.com/jalaali/jalaali-js — بر اساس روش Kazimierz M. Borkowski
 * این فایل عیناً و بدون وابستگی به CDN خارجی، لوکال سرو می‌شه.
 */
var Jalali = (function () {
  "use strict";

  var breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];

  function div(a, b) {
    return ~~(a / b);
  }
  function mod(a, b) {
    return a - ~~(a / b) * b;
  }

  function jalCal(jy, withoutLeap) {
    var bl = breaks.length,
      gy = jy + 621,
      leapJ = -14,
      jp = breaks[0],
      jm, jump, leap, leapG, march, n, i;

    if (jy < jp || jy >= breaks[bl - 1]) throw new Error("Invalid Jalaali year " + jy);

    for (i = 1; i < bl; i += 1) {
      jm = breaks[i];
      jump = jm - jp;
      if (jy < jm) break;
      leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4);
      jp = jm;
    }
    n = jy - jp;

    leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
    if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;

    leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
    march = 20 + leapJ - leapG;

    if (withoutLeap) return { gy: gy, march: march };

    if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33;
    leap = mod(mod(n + 1, 33) - 1, 4);
    if (leap === -1) leap = 4;

    return { leap: leap, gy: gy, march: march };
  }

  function g2d(gy, gm, gd) {
    var d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4) + div(153 * mod(gm + 9, 12) + 2, 5) + gd - 34840408;
    d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
    return d;
  }

  function d2g(jdn) {
    var j = 4 * jdn + 139361631;
    j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
    var i = div(mod(j, 1461), 4) * 5 + 308;
    var gd = div(mod(i, 153), 5) + 1;
    var gm = mod(div(i, 153), 12) + 1;
    var gy = div(j, 1461) - 100100 + div(8 - gm, 6);
    return { gy: gy, gm: gm, gd: gd };
  }

  function j2d(jy, jm, jd) {
    var r = jalCal(jy, true);
    return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
  }

  function d2j(jdn) {
    var gy = d2g(jdn).gy,
      jy = gy - 621,
      r = jalCal(jy, false),
      jdn1f = g2d(gy, 3, r.march),
      jd, jm, k;

    k = jdn - jdn1f;
    if (k >= 0) {
      if (k <= 185) {
        jm = 1 + div(k, 31);
        jd = mod(k, 31) + 1;
        return { jy: jy, jm: jm, jd: jd };
      }
      k -= 186;
    } else {
      jy -= 1;
      k += 179;
      if (r.leap === 1) k += 1;
    }
    jm = 7 + div(k, 30);
    jd = mod(k, 30) + 1;
    return { jy: jy, jm: jm, jd: jd };
  }

  function toJalaali(gy, gm, gd) {
    return d2j(g2d(gy, gm, gd));
  }

  function toGregorian(jy, jm, jd) {
    return d2g(j2d(jy, jm, jd));
  }

  function isLeapJalaaliYear(jy) {
    return jalCal(jy, false).leap === 0;
  }

  function jalaaliMonthLength(jy, jm) {
    if (jm <= 6) return 31;
    if (jm <= 11) return 30;
    return isLeapJalaaliYear(jy) ? 30 : 29;
  }

  /* ---------- کمکی‌های مخصوص این پروژه ---------- */

  var PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  var MONTH_NAMES = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
  var WEEKDAY_SHORT = ["ش", "ی", "د", "س", "چ", "پ", "ج"]; // شروع هفته: شنبه

  function toPersianDigits(input) {
    return String(input).replace(/[0-9]/g, function (d) {
      return PERSIAN_DIGITS[+d];
    });
  }

  // تبدیل Date جاوااسکریپت به شمسی
  function fromJSDate(date) {
    return toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  }

  // تبدیل تاریخ شمسی به Date جاوااسکریپت (ساعت ۰۰:۰۰ محلی)
  function toJSDate(jy, jm, jd) {
    var g = toGregorian(jy, jm, jd);
    return new Date(g.gy, g.gm - 1, g.gd);
  }

  // فرمت نمایشی: ۱۴۰۵/۰۶/۲۳
  function formatSlash(jy, jm, jd) {
    var mm = jm < 10 ? "0" + jm : "" + jm;
    var dd = jd < 10 ? "0" + jd : "" + jd;
    return toPersianDigits(jy + "/" + mm + "/" + dd);
  }

  // فرمت ISO میلادی: 2026-09-14 (برای مقایسه‌ی داخلی، بدون وابستگی به منطقه‌ی زمانی)
  function toISODate(date) {
    var y = date.getFullYear();
    var m = ("0" + (date.getMonth() + 1)).slice(-2);
    var d = ("0" + date.getDate()).slice(-2);
    return y + "-" + m + "-" + d;
  }

  return {
    toJalaali: toJalaali,
    toGregorian: toGregorian,
    isLeapJalaaliYear: isLeapJalaaliYear,
    jalaaliMonthLength: jalaaliMonthLength,
    toPersianDigits: toPersianDigits,
    MONTH_NAMES: MONTH_NAMES,
    WEEKDAY_SHORT: WEEKDAY_SHORT,
    fromJSDate: fromJSDate,
    toJSDate: toJSDate,
    formatSlash: formatSlash,
    toISODate: toISODate,
  };
})();