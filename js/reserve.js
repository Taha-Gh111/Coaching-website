(function () {
  "use strict";

  // ===== مرحله‌بندی فرم =====
  var step1 = document.querySelector('[data-step="1"]');
  var step2 = document.querySelector('[data-step="2"]');
  var seg1 = document.querySelector('[data-seg="1"]');
  var seg2 = document.querySelector('[data-seg="2"]');
  var bar = document.querySelector(".progress-bar");

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
  document.querySelectorAll(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      document.querySelectorAll(".chip").forEach(function (c) {
        c.classList.remove("selected");
      });
      chip.classList.add("selected");
    });
  });

  // ===== محدودیت روزهای شنبه و چهارشنبه =====
  var datePicker = document.getElementById("datePicker");
  datePicker.addEventListener("change", function () {
    var day = new Date(this.value).getDay();
    // شنبه = ۶ , چهارشنبه = ۳
    if (day === 6 || day === 3) {
      alert("رزرو در روزهای شنبه و چهارشنبه امکان‌پذیر نیست");
      this.value = "";
    }
  });

  // ===== ثبت فرم =====
  document.getElementById("reserveForm").addEventListener("submit", function (e) {
    e.preventDefault();

    var selectedTime = document.querySelector(".chip.selected");
    if (!datePicker.value || !selectedTime) {
      alert("لطفاً تاریخ و ساعت جلسه را انتخاب کنید");
      return;
    }

    var payload = {
      firstName: document.getElementById("fname").value.trim(),
      lastName: document.getElementById("lname").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      email: document.getElementById("email").value.trim(),
      date: datePicker.value,
      time: selectedTime.textContent.trim(),
    };

    // TODO: اتصال دیتا — این قسمت بعداً که روش ذخیره/ارسال اطلاعات (ایمیل،
    // گوگل‌شیت یا بک‌اند) مشخص شد، اینجا اضافه می‌شود.
    console.log("Reservation payload (ready for backend integration):", payload);

    document.querySelector(".reserve-form-inner form").style.display = "none";
    document.getElementById("progress").style.display = "none";
    document.getElementById("confirmBox").classList.add("active");
  });

  document.getElementById("resetForm").addEventListener("click", function (e) {
    e.preventDefault();
    location.reload();
  });
})();