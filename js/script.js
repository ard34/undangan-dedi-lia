const MAPS_LINK = "https://www.google.com/maps/place/6%C2%B003'45.6%22S+106%C2%B024'01.4%22E/@-6.0633353,106.3993858,18.18z/data=!4m4!3m3!8m2!3d-6.0626594!4d106.4003873?hl=id&entry=ttu&g_ep=EgoyMDI2MDUxNy4wIKXMDSoASAFQAw%3D%3D";
const WEDDING_DATE = new Date("2026-05-31T09:00:00+07:00").getTime();

let revealObserver;
let textObserver;
let currentPage = 0;

document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("no-scroll");
  showPage(0);
  updateCountdown();
  setInterval(updateCountdown, 1000);
});

function bukaUndangan() {
  const cover = document.getElementById("cover");
  const invitation = document.getElementById("invitation");
  const musicButton = document.getElementById("musicToggle");
  const music = document.getElementById("weddingMusic");

  cover.classList.add("is-hidden");
  invitation.classList.add("is-open");
  invitation.setAttribute("aria-hidden", "false");
  document.body.classList.remove("no-scroll");
  musicButton.classList.add("is-visible");
  showPage(0);

  music.play()
    .then(() => {
      setMusicIcon(false);
    })
    .catch(() => {
      setMusicIcon(true);
    });

  window.setTimeout(() => {
    const firstPage = document.getElementById("pageMempelai");
    firstPage.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 250);

  window.setTimeout(() => showPage(0), 500);
}

function nextPage() {
  const pages = document.querySelectorAll(".page");

  if (currentPage >= pages.length - 1) {
    showPage(0);
    return;
  }

  showPage(currentPage + 1);
}

function showPage(index) {
  const pages = document.querySelectorAll(".page");
  const nextButton = document.getElementById("nextPageButton");

  if (!pages.length) return;

  currentPage = Math.max(0, Math.min(index, pages.length - 1));

  pages.forEach((page, pageIndex) => {
    page.classList.toggle("is-active", pageIndex === currentPage);
  });

  if (nextButton) {
    nextButton.textContent = currentPage === pages.length - 1 ? "Ulangi" : "Lanjut";
  }

  animateActivePage();
}

function toggleMusic() {
  const music = document.getElementById("weddingMusic");

  if (music.paused) {
    music.play()
      .then(() => setMusicIcon(false))
      .catch(() => setMusicIcon(true));
    return;
  }

  music.pause();
  setMusicIcon(true);
}

function setMusicIcon(isPaused) {
  const icon = document.getElementById("musicIcon");
  icon.innerHTML = isPaused ? "&#9654;" : "&#10074;&#10074;";
}

function copyLink() {
  const status = document.getElementById("copyStatus");

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(MAPS_LINK)
      .then(() => showCopyStatus(status, "Link maps berhasil disalin."))
      .catch(() => fallbackCopy(MAPS_LINK, status));
    return;
  }

  fallbackCopy(MAPS_LINK, status);
}

function fallbackCopy(text, status) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  textArea.select();

  try {
    document.execCommand("copy");
    showCopyStatus(status, "Link maps berhasil disalin.");
  } catch (error) {
    showCopyStatus(status, "Gagal menyalin. Silakan buka maps lalu salin dari browser.");
  }

  document.body.removeChild(textArea);
}

function showCopyStatus(element, message) {
  element.textContent = message;
  window.clearTimeout(element.dataset.timer);
  const timer = window.setTimeout(() => {
    element.textContent = "";
  }, 2800);
  element.dataset.timer = timer;
}

function updateCountdown() {
  const now = new Date().getTime();
  const distance = Math.max(WEDDING_DATE - now, 0);

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((distance / (1000 * 60)) % 60);
  const seconds = Math.floor((distance / 1000) % 60);

  setCountdownValue("days", days);
  setCountdownValue("hours", hours);
  setCountdownValue("minutes", minutes);
  setCountdownValue("seconds", seconds);
}

function setCountdownValue(id, value) {
  const element = document.getElementById(id);
  if (!element) return;
  element.textContent = String(value).padStart(2, "0");
}

function revealOnScroll() {
  const activePage = document.querySelector(".page.is-active");
  const elements = activePage ? activePage.querySelectorAll(".reveal:not(.show)") : document.querySelectorAll(".reveal:not(.show)");

  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("show"));
    return;
  }

  if (!revealObserver) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("show");
        revealObserver.unobserve(entry.target);
      });
    }, {
      threshold: 0.16,
      rootMargin: "0px 0px -40px 0px"
    });
  }

  elements.forEach((element) => revealObserver.observe(element));
}

function staggerTextReveal() {
  const groups = document.querySelectorAll(".page.is-active");

  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll(".stagger-text, .stagger").forEach((item) => item.classList.add("show"));
    return;
  }

  if (!textObserver) {
    textObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const items = entry.target.querySelectorAll(".stagger-text, .stagger");
        items.forEach((item, index) => {
          window.setTimeout(() => {
            item.classList.add("show");
          }, index * 180);
        });

        textObserver.unobserve(entry.target);
      });
    }, {
      threshold: 0.22,
      rootMargin: "0px 0px -30px 0px"
    });
  }

  groups.forEach((group) => textObserver.observe(group));
}

function animateActivePage() {
  const activePage = document.querySelector(".page.is-active");
  if (!activePage) return;

  activePage.querySelectorAll(".show").forEach((item) => item.classList.remove("show"));

  const animatedItems = activePage.querySelectorAll(".reveal, .stagger-text, .stagger");
  animatedItems.forEach((item, index) => {
    window.setTimeout(() => {
      item.classList.add("show");
    }, 120 + (index * 150));
  });
}
