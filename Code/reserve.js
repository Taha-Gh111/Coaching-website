const datePicker = document.getElementById("datePicker");

datePicker.addEventListener("change", function () {
  const selectedDate = new Date(this.value);
  const day = selectedDate.getDay();

  // Saturday = 6 , Wednesday = 3
  if (day === 6 || day === 3) {
    alert("رزرو در روزهای شنبه و چهارشنبه امکان‌پذیر نیست");
    this.value = "";
  }
});

const updateclock = () => {
  let now = new Date().toLocaleTimeString();
  let day_now = new Date().toLocaleDateString();
  document.getElementById("clock").textContent = now;
  document.getElementById("date").textContent = day_now;
};
setInterval(updateclock, 1000);