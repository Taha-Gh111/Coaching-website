(function () {
  "use strict";

  /* ==========================================================================
     تنظیمات — این سه مقدار رو با اطلاعات واقعی خودت جایگزین کن
     ========================================================================== */
  var CONFIG = {
    // ایمیلی که رزروها بهش می‌رسه (از formsubmit.co)
    FORMSUBMIT_EMAIL: "zaribafan.erfan@gmail.com",

    // کد access key که از web3forms.com می‌گیری (خالی بذار = غیرفعال)
    WEB3FORMS_ACCESS_KEY: "",

    // لینک Web App که از Google Apps Script می‌گیری (همون لینکی که برای
    // ثبت رزرو استفاده می‌شه، برای خوندن لیست رزروهای قبلی هم استفاده می‌شه)
    GOOGLE_SHEET_URL: "",
  };

  // ===== مرحله‌بندی فرم =====
  var step1 = document.querySelector('[data-step="1"]');
  var step2 = document.querySelector('[data-step="2"]');
  var seg1 = document.querySelector('[data-seg="1"]');
  var seg2 = document.querySelector('[data-seg="2"]');
  var dateISOHiddenInput = document.getElementById("datePickerISO");
  var selectedTimeInput = document.getElementById("selectedTime");
  var submitBtn = document.getElementById("submitBtn");
  var formError = document.getElementById("formError");
  var form = document.getElementById("reserveForm");
  var chipsWrap = document.getElementById("timeChips");

  document.getElementById("toStep2").addEventListener("click", function () {
    var fname = document.getElementById("fname").value.trim();
    var lname = document.getElementById("lname").value.trim();
    var phone = document.getElementById("phone").value.trim();

    if (!fname || !lname || !phone) {
      alert("لطفاً نام، نام خانوادگی و شماره تماس را وارد کنید");
      return;
    }

    step1.classList.remove("active");
    step2.classList.add("active");
    seg1.classList.add("done");
    seg2.classList.add("active");
  });

  document.getElementById("backStep1").addEventListener("click", function () {
    step2.classList.remove("active");
    step1.classList.add("active");
    seg2.classList.remove("active");
    seg1.classList.remove("done");
  });

  // ===== انتخاب ساعت (chip) =====
  // غیرفعال‌بودن هر چیپ (روزهای پرشده) رو js/reserve-calendar.js مدیریت می‌کنه.
  chipsWrap.querySelectorAll(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      chipsWrap.querySelectorAll(".chip").forEach(function (c) {
        c.classList.remove("selected");
      });
      chip.classList.add("selected");
      selectedTimeInput.value = chip.textContent.trim();
    });
  });

  /* ==========================================================================
     در دسترس بودن — خوندن لیست رزروهای قبلی از گوگل‌شیت (اگه تنظیم شده باشه)
     تا روزها/ساعت‌های پرشده تو تقویم غیرفعال بشن. اگه این درخواست شکست بخوره
     (مثلاً به هر دلیلی گوگل در دسترس نباشه)، تقویم بدون فیلتر رزرو کار
     می‌کنه — یعنی این ویژگی هیچ‌وقت جلوی ثبت رزرو رو نمی‌گیره.
     ========================================================================== */

  function loadAvailability() {
    if (!CONFIG.GOOGLE_SHEET_URL || !window.ReserveCalendar) return Promise.resolve();
    return fetch(CONFIG.GOOGLE_SHEET_URL, { method: "GET" })
      .then(function (res) {
        if (!res.ok) throw new Error("availability fetch failed");
        return res.json();
      })
      .then(function (data) {
        window.ReserveCalendar.setBookedSlots(data.booked || []);
      })
      .catch(function () {
        /* بی‌سروصدا نادیده گرفته می‌شه — تقویم بدون فیلتر کار می‌کنه */
      });
  }

  loadAvailability();

  /* ==========================================================================
     سه کانال ارسال — هر سه موازی امتحان می‌شن. اگه حداقل یکی از FormSubmit
     یا Web3Forms موفق بشه، رزرو "موفق" حساب می‌شه. گوگل‌شیت صرفاً یک آرشیو
     کمکیه و روی نتیجه‌ی نهایی تاثیر نمی‌ذاره (چون Apps Script جواب قابل
     خوندن از مرورگر نمی‌ده).
     ========================================================================== */

  function submitFormSubmit(formData) {
    if (!CONFIG.FORMSUBMIT_EMAIL || CONFIG.FORMSUBMIT_EMAIL.indexOf("@") === -1) {
      return Promise.reject(new Error("formsubmit not configured"));
    }
    return fetch("https://formsubmit.co/ajax/" + CONFIG.FORMSUBMIT_EMAIL, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: formData,
    }).then(function (res) {
      if (!res.ok) throw new Error("formsubmit failed");
      return res.json();
    });
  }

  function submitWeb3Forms(plainData) {
    if (!CONFIG.WEB3FORMS_ACCESS_KEY) {
      return Promise.reject(new Error("web3forms not configured"));
    }
    var payload = Object.assign({}, plainData, { access_key: CONFIG.WEB3FORMS_ACCESS_KEY });
    return fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    }).then(function (res) {
      if (!res.ok) throw new Error("web3forms failed");
      return res.json();
    });
  }

  function submitGoogleSheet(plainData) {
    if (!CONFIG.GOOGLE_SHEET_URL) {
      return Promise.resolve(); // غیرفعاله، بی‌سروصدا رد شو
    }
    // no-cors چون Apps Script هدر CORS برنمی‌گردونه؛ جواب رو نمی‌تونیم بخونیم
    // ولی درخواست باز هم به‌صورت واقعی ارسال و ثبت می‌شه.
    return fetch(CONFIG.GOOGLE_SHEET_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(plainData),
    }).catch(function () {
      /* best-effort — خطاش رو نادیده می‌گیریم */
    });
  }

  // بازبینی نهایی درست قبل از ارسال: شاید بین باز کردن فرم و الان یکی دیگه
  // همین ساعت رو رزرو کرده باشه. این یه تلاش بهترینه، نه یه تضمین قطعی —
  // چون هیچ قفل واقعی سمت سرور بین دو مرورگر وجود نداره.
  function recheckAvailability(iso, time) {
    if (!CONFIG.GOOGLE_SHEET_URL) return Promise.resolve(true);
    return fetch(CONFIG.GOOGLE_SHEET_URL, { method: "GET" })
      .then(function (res) {
        if (!res.ok) throw new Error("recheck failed");
        return res.json();
      })
      .then(function (data) {
        var booked = data.booked || [];
        if (window.ReserveCalendar) window.ReserveCalendar.setBookedSlots(booked);
        var stillFree = !booked.some(function (b) {
          return b.date === iso && b.time === time;
        });
        return stillFree;
      })
      .catch(function () {
        return true; // نتونستیم چک کنیم — جلوی ارسال رو نمی‌گیریم
      });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var selectedTimeChip = document.querySelector(".chip.selected");
    if (!dateISOHiddenInput.value || !selectedTimeChip) {
      alert("لطفاً تاریخ و ساعت جلسه را انتخاب کنید");
      return;
    }

    var iso = dateISOHiddenInput.value;
    var time = selectedTimeChip.textContent.trim();

    formError.hidden = true;
    submitBtn.disabled = true;
    submitBtn.textContent = "در حال بررسی...";

    recheckAvailability(iso, time).then(function (stillFree) {
      if (!stillFree) {
        submitBtn.disabled = false;
        submitBtn.textContent = "ثبت رزرو";
        formError.textContent = "این ساعت همین الان توسط شخص دیگری رزرو شد. لطفاً ساعت یا روز دیگری انتخاب کنید.";
        formError.hidden = false;
        return;
      }

      submitBtn.textContent = "در حال ارسال...";

      var formData = new FormData(form);
      var plainData = Object.fromEntries(formData.entries());

      Promise.allSettled([
        submitFormSubmit(formData),
        submitWeb3Forms(plainData),
        submitGoogleSheet(plainData),
      ]).then(function (results) {
        var formSubmitOk = results[0].status === "fulfilled";
        var web3FormsOk = results[1].status === "fulfilled";

        submitBtn.disabled = false;
        submitBtn.textContent = "ثبت رزرو";

        if (formSubmitOk || web3FormsOk) {
          document.querySelector(".reserve-form-inner form").style.display = "none";
          document.getElementById("progress").style.display = "none";
          document.getElementById("confirmBox").classList.add("active");
        } else {
          formError.textContent =
            "مشکلی در ارسال پیش آمد. لطفاً دوباره امتحان کنید یا مستقیم از راه‌های ارتباطی تماس بگیرید.";
          formError.hidden = false;
        }
      });
    });
  });

  document.getElementById("resetForm").addEventListener("click", function (e) {
    e.preventDefault();
    location.reload();
  });
})();