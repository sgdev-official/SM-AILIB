
(() => {
  "use strict";

  /* =========================================
     SM-AILIB — COMPLETE WEBSITE JAVASCRIPT
     ========================================= */

  const $ = (selector, parent = document) =>
    parent.querySelector(selector);

  const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];


  /* ---------- STICKY NAVIGATION ---------- */

  const nav = $("#nav");

  const updateNavigation = () => {
    if (!nav) return;

    nav.classList.toggle("scrolled", window.scrollY > 8);
  };

  updateNavigation();

  window.addEventListener("scroll", updateNavigation, {
    passive: true
  });


  /* ---------- MOBILE MENU ---------- */

  const menuToggle = $("#menuToggle");
  const navLinks = $("#navLinks");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");

      menuToggle.textContent = isOpen ? "✕" : "☰";
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    $$(".nav-links a").forEach(link => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuToggle.textContent = "☰";
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("click", event => {
      if (
        navLinks.classList.contains("open") &&
        !navLinks.contains(event.target) &&
        !menuToggle.contains(event.target)
      ) {
        navLinks.classList.remove("open");
        menuToggle.textContent = "☰";
        menuToggle.setAttribute("aria-expanded", "false");
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

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          const id = `#${entry.target.id}`;

          links.forEach(link => {
            link.classList.toggle(
              "active",
              link.getAttribute("href") === id
            );
          });
        });
      },
      {
        rootMargin: "-25% 0px -65% 0px",
        threshold: 0
      }
    );

    sections.forEach(section => {
      sectionObserver.observe(section);
    });
  }


  /* ---------- INSTALLATION TABS ---------- */

  const installTabs = $$(".install-tab");
  const installPanels = $$(".install-content");

  installTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const targetId = tab.dataset.target;

      installTabs.forEach(item => {
        const active = item === tab;

        item.classList.toggle("active", active);
        item.setAttribute("aria-selected", String(active));
      });

      installPanels.forEach(panel => {
        const active = panel.id === targetId;

        panel.classList.toggle("active", active);
        panel.hidden = !active;
      });
    });
  });

  // Set initial installation panel state.
  installPanels.forEach((panel, index) => {
    const active = index === 0;

    panel.classList.toggle("active", active);
    panel.hidden = !active;
  });


  /* ---------- COPY BUTTONS ---------- */

  const copyButtons = $$(".copy-command");

  copyButtons.forEach(button => {
    button.addEventListener("click", async () => {
      const container = button.parentElement;
      const code = $("code", container);

      if (!code) return;

      const text = code.textContent.trim();
      const originalText = button.textContent;

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

        button.textContent = "Copied!";
        button.classList.add("copied");

      } catch (error) {
        console.error("Clipboard error:", error);

        button.textContent = "Failed";
      }

      window.setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove("copied");
      }, 1600);
    });
  });


  /* ---------- FAQ ACCORDION ---------- */

  const faqItems = $$(".faq-item");

  faqItems.forEach(item => {
    const summary = $("summary", item);

    if (!summary) return;

    summary.addEventListener("click", event => {
      event.preventDefault();

      const shouldOpen = !item.open;

      faqItems.forEach(other => {
        other.open = false;
      });

      item.open = shouldOpen;
    });
  });


  /* ---------- BACK TO TOP ---------- */

  const backToTop = $("#backToTop");

  const updateBackToTop = () => {
    if (!backToTop) return;

    backToTop.classList.toggle(
      "visible",
      window.scrollY > 450
    );
  };

  updateBackToTop();

  window.addEventListener("scroll", updateBackToTop, {
    passive: true
  });

  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }


  /* ---------- DYNAMIC COPYRIGHT YEAR ---------- */

  const year = $("#year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }


  /* ---------- SMOOTH INTERNAL LINKS ---------- */

  $$('a[href^="#"]').forEach(link => {
    link.addEventListener("click", event => {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") return;

      const target = $(targetId);

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

      history.replaceState(null, "", targetId);
    });
  });


  /* ---------- INITIALIZE ---------- */

  document.documentElement.classList.add("js-ready");

  console.log(
    "%cSM-AILIB",
    "color:#a78bfa;font-size:22px;font-weight:bold;"
  );

  console.log(
    "%cPersistent memory. Image generation. Token modes.",
    "color:#67e8f9;font-size:12px;"
  );

})();
