(() => {
  "use strict";

  /* ---------- sticky nav state ---------- */
  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- active section in nav ---------- */
  const links = [...document.querySelectorAll(".nav-links a")];
  const sections = links
    .map(a => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach(s => io.observe(s));
  }

  /* ---------- copy buttons ---------- */
  const copyText = async text => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
  };

  document.querySelectorAll(".copy").forEach(btn => {
    const label = btn.textContent;
    btn.addEventListener("click", async () => {
      const target = document.getElementById(btn.dataset.copyTarget);
      if (!target) return;
      // join visible lines, skipping comment lines
      const lines = [...target.querySelectorAll(".line")];
      const text = lines.length
        ? lines.filter(l => !l.classList.contains("cm")).map(l => l.textContent).join("\n")
        : target.textContent;
      await copyText(text);
      btn.textContent = "Copied";
      btn.classList.add("copied");
      setTimeout(() => {
        btn.textContent = label;
        btn.classList.remove("copied");
      }, 1600);
    });
  });

  /* ---------- tabs (supports nesting) ---------- */
  document.querySelectorAll("[data-tabs]").forEach(group => {
    const list = group.querySelector(":scope > .tablist");
    const tabs = [...list.querySelectorAll(":scope > .tab")];
    const panels = [...group.querySelectorAll(":scope > .tabpanel")];

    const select = (tab, focus) => {
      tabs.forEach(t => {
        const on = t === tab;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", on);
        t.tabIndex = on ? 0 : -1;
      });
      panels.forEach(p => { p.hidden = p.dataset.panel !== tab.dataset.tab; });
      if (focus) tab.focus();
    };

    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => select(tab));
      tab.addEventListener("keydown", e => {
        let n = null;
        if (e.key === "ArrowRight") n = tabs[(i + 1) % tabs.length];
        if (e.key === "ArrowLeft") n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === "Home") n = tabs[0];
        if (e.key === "End") n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n, true); }
      });
    });
  });

  /* ---------- token modes slider ---------- */
  const range = document.getElementById("mode-range");
  const cmd = document.getElementById("mode-cmd");
  const name = document.getElementById("mode-name");
  const desc = document.getElementById("mode-desc");
  const fill = document.getElementById("mode-fill");

  const modes = [
    ["Strict Lazy", "Answers in a single sentence. The cheapest mode – use it when you only need the result."],
    ["Level 1", "Still very short, with a little more room than Strict Lazy."],
    ["Level 2", "Concise answers with the key points and little explanation."],
    ["Level 3", "More explanation and context before the answer."],
    ["Level 4", "Detailed reasoning and a check of the answer before it is given."],
    ["Maximum Audit", "Full reasoning plus a risk review. The most thorough mode and the most tokens."]
  ];

  const renderMode = () => {
    const v = Number(range.value);
    cmd.textContent = "@sm_ailib_" + v;
    name.textContent = modes[v][0];
    desc.textContent = modes[v][1];
    fill.style.width = (v / 5) * 100 + "%";
    if (v === 0) fill.style.width = "6%";
    range.setAttribute("aria-valuetext", "Level " + v + ", " + modes[v][0]);
  };
  range.addEventListener("input", renderMode);
  renderMode();
})();