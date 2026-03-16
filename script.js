const navToggle = document.querySelector(".nav__toggle");
const navMenu = document.querySelector("#navMenu");

function setExpanded(isExpanded) {
  navToggle?.setAttribute("aria-expanded", String(isExpanded));
  navMenu?.classList.toggle("is-open", isExpanded);
}

navToggle?.addEventListener("click", () => {
  const expanded = navToggle.getAttribute("aria-expanded") === "true";
  setExpanded(!expanded);
});

// Close mobile menu when clicking a link
navMenu?.addEventListener("click", (e) => {
  const target = e.target;
  if (!(target instanceof HTMLElement)) return;
  if (target.matches('a[href^="#"]')) setExpanded(false);
});

// Smooth scroll offset for fixed nav
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const href = a.getAttribute("href");
    if (!href || href === "#") return;
    const id = href.slice(1);
    const el = document.getElementById(id);
    if (!el) return;

    e.preventDefault();
    const navHeight =
      document.querySelector(".nav")?.getBoundingClientRect().height ?? 0;
    const top = el.getBoundingClientRect().top + window.scrollY - navHeight - 10;
    window.scrollTo({ top, behavior: "smooth" });
  });
});

// Current year
const year = document.getElementById("year");
if (year) year.textContent = String(new Date().getFullYear());

