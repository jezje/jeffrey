const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("nav");
const navLinks = document.querySelectorAll("nav a");
const sections = document.querySelectorAll(".section");

// Mobile nav toggle
if (navToggle && nav) {
  navToggle.addEventListener("click", () => nav.classList.toggle("open"));
}

// Close nav when link is clicked
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (nav?.classList.contains("open")) {
      nav.classList.remove("open");
    }
  });
});

// Keyboard navigation - arrow keys and home/end
document.addEventListener("keydown", (e) => {
  const sectionArray = Array.from(sections);
  const currentIndex = sectionArray.findIndex(
    (s) => s.getBoundingClientRect().top >= 0
  );

  if (e.key === "ArrowDown" && currentIndex < sectionArray.length - 1) {
    sectionArray[currentIndex + 1].scrollIntoView({ behavior: "smooth" });
  } else if (e.key === "ArrowUp" && currentIndex > 0) {
    sectionArray[currentIndex - 1].scrollIntoView({ behavior: "smooth" });
  } else if (e.key === "Home") {
    sectionArray[0]?.scrollIntoView({ behavior: "smooth" });
  } else if (e.key === "End") {
    sectionArray[sectionArray.length - 1]?.scrollIntoView({ behavior: "smooth" });
  }
});

// Scroll reveal animation
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
      }
    });
  },
  { threshold: 0.2 }
);

sections.forEach((section) => revealObserver.observe(section));

// Build section map for active nav tracking
const sectionMap = Array.from(sections).reduce((map, section) => {
  map[section.id] = section;
  return map;
}, {});

// Throttle function for performance
const throttle = (func, limit) => {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Update active nav link based on scroll position
const handleActiveNav = () => {
  const scrollPosition = window.scrollY + window.innerHeight / 3;

  navLinks.forEach((link) => {
    const targetId = link.getAttribute("href")?.substring(1);
    const targetSection = targetId ? sectionMap[targetId] : null;

    if (targetSection) {
      const rect = targetSection.getBoundingClientRect();
      const sectionTop = window.scrollY + rect.top;
      const sectionBottom = sectionTop + rect.height;

      if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    }
  });
};

// Throttled scroll handler for better performance
window.addEventListener("scroll", throttle(handleActiveNav, 150));
window.addEventListener("load", handleActiveNav);

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href");
    if (href !== "#") {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  });
});
