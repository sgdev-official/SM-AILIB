
(() => {
  "use strict";

  const $ = (selector, parent = document) =>
    parent.querySelector(selector);

  const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;


  /* ---------- STICKY NAVIGATION ---------- */

  const nav = $("#nav");

  const updateNavigation = () => {
    if (!nav) return;
    nav.classList.toggle("scrolled", window.scrollY > 8);
  };

  // rAF: read scroll position after the first layout instead of forcing one
  requestAnimationFrame(() => {
    updateNavigation();
    updateBackToTop();
  });

  window.addEventListener("scroll", updateNavigation, { passive: true });


  /* ---------- MOBILE MENU ---------- */

  const menuToggle = $("#menuToggle");
  const navLinks = $("#navLinks");

  const setMenu = open => {
    if (!menuToggle || !navLinks) return;

    navLinks.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  if (menuToggle && navLinks) {
    setMenu(false);

    menuToggle.addEventListener("click", () => {
      setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
    });

    $$("a", navLinks).forEach(link => {
      link.addEventListener("click", () => setMenu(false));
    });

    document.addEventListener("click", event => {
      if (
        !navLinks.contains(event.target) &&
        !menuToggle.contains(event.target)
      ) {
        setMenu(false);
      }
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && navLinks.classList.contains("open")) {
        setMenu(false);
        menuToggle.focus();
      }
    });
  }


  /* ---------- ACTIVE NAV SECTION ---------- */

  const links = $$(".nav-links a");

  const sections = links
    .map(link => {
      const id = link.getAttribute("href");
      if (!id || !id.startsWith("#")) return null;
      return $(id);
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          const id = `#${entry.target.id}`;

          links.forEach(link => {
            const active = link.getAttribute("href") === id;

            link.classList.toggle("active", active);

            if (active) {
              link.setAttribute("aria-current", "true");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        });
      },
      { rootMargin: "-25% 0px -65% 0px", threshold: 0 }
    );

    sections.forEach(section => observer.observe(section));
  }


  /* ---------- INSTALLATION TABS ---------- */

  const tabs = $$(".install-tab");

  const selectTab = tab => {
    tabs.forEach(item => {
      const active = item === tab;
      const panel = document.getElementById(
        item.getAttribute("aria-controls")
      );

      item.classList.toggle("active", active);
      item.setAttribute("aria-selected", String(active));
      item.tabIndex = active ? 0 : -1;

      if (panel) {
        panel.classList.toggle("active", active);
        panel.hidden = !active;
      }
    });
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectTab(tab));

    tab.addEventListener("keydown", event => {
      const move =
        event.key === "ArrowRight" ? 1 :
        event.key === "ArrowLeft" ? -1 : 0;

      if (!move) return;

      event.preventDefault();

      const next = tabs[(index + move + tabs.length) % tabs.length];

      selectTab(next);
      next.focus();
    });
  });

  if (tabs.length) selectTab(tabs[0]);


  /* ---------- COPY BUTTONS ---------- */

  $$(".copy-command").forEach(button => {
    const label = button.textContent.trim();

    button.addEventListener("click", async () => {
      const scope =
        button.closest(".command-box, .command-item, .code-block") ||
        button.parentElement;

      const code = $("code", scope);
      if (!code) return;

      const text = code.textContent.trim();

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          const textarea = document.createElement("textarea");

          textarea.value = text;
          textarea.style.position = "fixed";
          textarea.style.opacity = "0";

          document.body.appendChild(textarea);
          textarea.select();

          const copied = document.execCommand("copy");
          textarea.remove();

          if (!copied) throw new Error("Copy failed");
        }

        button.textContent = "Copied";
        button.classList.add("copied");
      } catch (error) {
        button.textContent = "Failed";
      }

      window.setTimeout(() => {
        button.textContent = label;
        button.classList.remove("copied");
      }, 1600);
    });
  });


  /* ---------- FAQ: one answer open at a time ---------- */

  const faqItems = $$(".faq-item");

  faqItems.forEach(item => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;

      faqItems.forEach(other => {
        if (other !== item) other.open = false;
      });
    });
  });


  /* ---------- BACK TO TOP ---------- */

  const backToTop = $("#backToTop");

  const updateBackToTop = () => {
    if (!backToTop) return;
    backToTop.classList.toggle("visible", window.scrollY > 450);
  };

  window.addEventListener("scroll", updateBackToTop, { passive: true });

  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: reduceMotion ? "auto" : "smooth"
      });
    });
  }


  /* ---------- FOOTER YEAR ---------- */

  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

})();
