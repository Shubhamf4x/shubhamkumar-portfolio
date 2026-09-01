(() => {
  document.documentElement.classList.add("js");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const fxOn = finePointer && !reduceMotion;
  const hasGsap = typeof window.gsap !== "undefined";
  const hasST = hasGsap && typeof window.ScrollTrigger !== "undefined";
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  if (hasGsap && !reduceMotion) {
    document.querySelectorAll(".hero-name .line-inner").forEach((inner) => {
      const star = inner.querySelector(".hero-star");
      const textNode = Array.from(inner.childNodes).find(
        (n) => n.nodeType === 3 && n.textContent.trim().length > 0
      );
      if (!textNode) return;
      const frag = document.createDocumentFragment();
      Array.from(textNode.textContent).forEach((c) => {
        const s = document.createElement("span");
        s.className = "ch";
        s.textContent = c;
        frag.appendChild(s);
      });
      inner.replaceChild(frag, textNode);
      if (star) inner.appendChild(star);
      inner.closest(".hero-name").classList.add("split");
    });
    gsap.set(".hero-name .ch", { yPercent: 120, rotateX: -85, opacity: 0 });
  }

  const bodyEl = document.body;
  const preloader = document.querySelector(".preloader");
  const preCount = document.querySelector(".pre-count");
  const preBar = document.querySelector(".pre-bar i");

  const finishLoad = () => {
    if (bodyEl.classList.contains("loaded")) return;
    bodyEl.classList.add("loaded");
    if (preloader) {
      preloader.classList.add("done");
      setTimeout(() => preloader.remove(), 1000);
    }
    if (hasGsap && !reduceMotion) {
      gsap.to(".hero-name .ch", {
        yPercent: 0,
        rotateX: 0,
        opacity: 1,
        duration: 1.15,
        stagger: 0.032,
        ease: "power4.out",
        delay: 0.45
      });
    }
  };

  if (!reduceMotion && preCount && preBar) {
    let p = 0;
    const step = () => {
      p += (100 - p) * 0.09 + 0.55;
      if (p >= 100) {
        preCount.textContent = "100";
        preBar.style.width = "100%";
        finishLoad();
        return;
      }
      preCount.textContent = Math.floor(p);
      preBar.style.width = p + "%";
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  } else {
    finishLoad();
  }
  window.addEventListener("load", finishLoad);
  setTimeout(finishLoad, 3500);

  document.querySelectorAll("[data-stagger]").forEach((group) => {
    Array.from(group.children).forEach((child, i) => {
      child.style.setProperty("--d", `${i * 90}ms`);
    });
  });

  const reveals = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -8% 0px" }
  );
  reveals.forEach((el) => io.observe(el));

  let lenis = null;
  if (typeof window.Lenis !== "undefined" && !reduceMotion) {
    document.documentElement.classList.add("has-lenis");
    lenis = new window.Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true });
    if (hasST) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const rafLoop = (t) => {
        lenis.raf(t);
        requestAnimationFrame(rafLoop);
      };
      requestAnimationFrame(rafLoop);
    }
  }

  if (hasST) {
    window.addEventListener("load", () => ScrollTrigger.refresh());
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
  }

  if (hasST && !reduceMotion) {
    const heroTl = gsap.timeline({
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1.1 }
    });
    heroTl
      .to(".hero-name", { yPercent: -18, ease: "none" }, 0)
      .to(".hero-topline", { y: 60, opacity: 0.2, ease: "none" }, 0)
      .to(".hero-foot", { y: 40, opacity: 0, ease: "none" }, 0);

    gsap.utils.toArray(".section-head .sec-label").forEach((el) => {
      gsap.fromTo(
        el,
        { x: -28 },
        {
          x: 28,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1 }
        }
      );
    });

    gsap.utils.toArray(".section-head .muted").forEach((el) => {
      gsap.fromTo(
        el,
        { x: 28 },
        {
          x: -28,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1 }
        }
      );
    });

    document.querySelectorAll(".section-head").forEach((head) => {
      const rule = document.createElement("span");
      rule.className = "rule";
      head.appendChild(rule);
    });
    gsap.utils.toArray(".section-head .rule").forEach((rule) => {
      gsap.fromTo(
        rule,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.3,
          ease: "power3.inOut",
          scrollTrigger: { trigger: rule, start: "top 88%" }
        }
      );
    });

    const splitWords = (el) => {
      const process = (node) => {
        Array.from(node.childNodes).forEach((child) => {
          if (child.nodeType === 3) {
            const frag = document.createDocumentFragment();
            child.textContent.split(/(\s+)/).forEach((part) => {
              if (!part) return;
              if (/^\s+$/.test(part)) {
                frag.appendChild(document.createTextNode(" "));
                return;
              }
              const w = document.createElement("span");
              w.className = "w";
              const wi = document.createElement("span");
              wi.className = "wi";
              wi.textContent = part;
              w.appendChild(wi);
              frag.appendChild(w);
            });
            node.replaceChild(frag, child);
          } else if (child.nodeType === 1 && child.tagName !== "BR") {
            process(child);
          }
        });
      };
      process(el);
      el.classList.add("sw");
    };

    document.querySelectorAll(".lead, .contact-title").forEach(splitWords);
    gsap.utils.toArray(".lead, .contact-title").forEach((el) => {
      const wis = el.querySelectorAll(".wi");
      if (!wis.length) return;
      gsap.set(wis, { yPercent: 115 });
      gsap.to(wis, {
        yPercent: 0,
        duration: 0.9,
        stagger: 0.045,
        ease: "power4.out",
        scrollTrigger: { trigger: el, start: "top 82%" }
      });
    });

    document.querySelectorAll(".xp-row").forEach((row) => {
      const lis = row.querySelectorAll(".bullets li");
      if (!lis.length) return;
      gsap.set(lis, { opacity: 0, y: 14 });
      gsap.to(lis, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.07,
        ease: "power3.out",
        scrollTrigger: { trigger: row, start: "top 75%" }
      });
    });

    gsap.utils.toArray(".skill-row dd").forEach((dd) => {
      gsap.fromTo(
        dd,
        { opacity: 0, x: -24 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: dd, start: "top 88%" }
        }
      );
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!lenis) { return; }
      e.preventDefault();
      setMenu(false);
      if (href === "#top" || href === "#") {
        lenis.scrollTo(0, { duration: 1.5, easing: (t) => 1 - Math.pow(1 - t, 4) });
        return;
      }
      const target = document.querySelector(href);
      if (target) {
        lenis.scrollTo(target, { offset: -70, duration: 1.5, easing: (t) => 1 - Math.pow(1 - t, 4) });
      }
    });
  });

  const header = document.querySelector(".site-header");
  const progress = document.querySelector(".progress");
  const marqueeSkew = document.querySelector(".marquee-skew");
  let lastY = window.scrollY;
  let skewT = 0;
  let driftT = 0;
  let scrollScheduled = false;
  const onScroll = () => {
    if (scrollScheduled) { return; }
    scrollScheduled = true;
    requestAnimationFrame(() => {
      scrollScheduled = false;
      const y = window.scrollY;
      header.classList.toggle("scrolled", y > 24);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      if (fxOn && marqueeSkew) {
        const v = y - lastY;
        skewT = clamp(v * 0.35, -7, 7);
        driftT = max > 0 ? (y / max) * -160 : 0;
      }
      lastY = y;
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
  const linkMap = new Map(navLinks.map((l) => [l.getAttribute("href").slice(1), l]));
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((l) => l.classList.remove("active"));
          const link = linkMap.get(entry.target.id);
          if (link) link.classList.add("active");
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  document.querySelectorAll("main section[id]").forEach((s) => spy.observe(s));

  const menuOverlay = document.getElementById("menu");
  const openBtn = document.querySelector(".site-header .menu-btn");
  const closeBtn = document.querySelector(".close-btn");
  const setMenu = (open) => {
    document.body.classList.toggle("menu-open", open);
    menuOverlay.setAttribute("aria-hidden", String(!open));
    openBtn.setAttribute("aria-expanded", String(open));
    if (lenis) { open ? lenis.stop() : lenis.start(); }
  };
  openBtn.addEventListener("click", () => setMenu(true));
  closeBtn.addEventListener("click", () => setMenu(false));
  menuOverlay.querySelectorAll(".menu-nav a").forEach((a) =>
    a.addEventListener("click", () => setMenu(false))
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenu(false);
  });

  const clock = document.getElementById("clock");
  if (clock) {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata"
    });
    const tick = () => (clock.textContent = fmt.format(new Date()));
    tick();
    setInterval(tick, 1000);
  }

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  if (fxOn) {
    bodyEl.classList.add("has-cursor");

    const dot = document.createElement("div");
    dot.className = "cursor-dot";
    const ring = document.createElement("div");
    ring.className = "cursor-ring";
    ring.innerHTML = '<span class="cursor-label mono">View</span>';
    document.body.append(dot, ring);

    const glow = document.querySelector(".glow");
    const hero = document.querySelector(".hero");
    const nameTilt = document.querySelector(".name-tilt");
    const star3d = document.querySelector(".star3d");
    const preview = document.querySelector(".work-preview");
    const wpInner = preview ? preview.querySelector(".wp-inner") : null;
    const wpNum = preview ? preview.querySelector(".wp-num") : null;
    const wpName = preview ? preview.querySelector(".wp-name") : null;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let dx = mx, dy = my, rx = mx, ry = my, gx = mx, gy = my;
    let pvx = mx, pvy = my, pvRot = 0;
    let previewOn = false;
    let nrx = 0, nry = 0, nrxT = 0, nryT = 0;
    let skew = 0;
    let drift = 0;

    document.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
    });

    if (hero && nameTilt) {
      hero.addEventListener("mousemove", (e) => {
        const r = hero.getBoundingClientRect();
        nryT = ((e.clientX - r.left) / r.width - 0.5) * 7;
        nrxT = -((e.clientY - r.top) / r.height - 0.5) * 5;
      });
      hero.addEventListener("mouseleave", () => {
        nrxT = 0;
        nryT = 0;
      });
    }

    document.addEventListener("mouseover", (e) => {
      const t = e.target;
      const view = t.closest(".work-row");
      ring.classList.toggle("view", !!view);
      dot.style.opacity = view ? "0" : "1";
      ring.classList.toggle("hover", !view && !!t.closest("a, button, [data-tilt]"));
    });

    if (preview && wpInner && wpNum && wpName) {
      document.querySelectorAll(".work-row").forEach((row) => {
        row.addEventListener("mouseenter", () => {
          previewOn = true;
          wpNum.textContent = row.querySelector(".work-num").textContent;
          wpName.textContent = row.querySelector(".work-title").textContent;
          wpInner.className = "wp-inner " + (row.dataset.grad || "g1");
          preview.classList.add("show");
        });
        row.addEventListener("mouseleave", () => {
          previewOn = false;
          preview.classList.remove("show");
        });
      });
    }

    document.querySelectorAll(".magnetic").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const relX = e.clientX - (r.left + r.width / 2);
        const relY = e.clientY - (r.top + r.height / 2);
        el.style.transition = "transform 0.18s ease-out";
        el.style.transform = `translate(${relX * 0.28}px, ${relY * 0.28}px)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transition = "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)";
        el.style.transform = "";
      });
    });

    document.querySelectorAll("[data-tilt]").forEach((el) => {
      el.addEventListener("mouseenter", () => {
        el.style.transition = "transform 0.12s ease-out";
      });
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty("--ry", (px * 8) + "deg");
        el.style.setProperty("--rx", (-py * 8) + "deg");
      });
      el.addEventListener("mouseleave", () => {
        el.style.transition = "";
        el.style.setProperty("--rx", "0deg");
        el.style.setProperty("--ry", "0deg");
      });
    });

    const loop = () => {
      dx += (mx - dx) * 0.55;
      dy += (my - dy) * 0.55;
      dot.style.transform = `translate3d(${dx}px, ${dy}px, 0) translate(-50%, -50%)`;

      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;

      if (glow) {
        gx += (mx - gx) * 0.07;
        gy += (my - gy) * 0.07;
        glow.style.transform = `translate3d(${gx - 320}px, ${gy - 320}px, 0)`;
      }

      if (marqueeSkew) {
        skewT *= 0.9;
        skew += (skewT - skew) * 0.1;
        drift += (driftT - drift) * 0.06;
        marqueeSkew.style.transform = `translateX(${drift.toFixed(1)}px) skewX(${skew.toFixed(3)}deg)`;
      }

      if (nameTilt) {
        nrx += (nrxT - nrx) * 0.07;
        nry += (nryT - nry) * 0.07;
        nameTilt.style.transform = `rotateX(${nrx.toFixed(3)}deg) rotateY(${nry.toFixed(3)}deg)`;
      }

      if (star3d) {
        star3d.style.translate = `${nryT * 2.5}px ${nrxT * 2.5}px`;
      }

      if (preview) {
        if (previewOn) {
          const tx = mx + 28;
          const ty = my + 24;
          pvx += (tx - pvx) * 0.16;
          pvy += (ty - pvy) * 0.16;
          pvRot += (clamp((tx - pvx) * 0.1, -14, 14) - pvRot) * 0.1;
          preview.style.transform = `translate3d(${pvx}px, ${pvy}px, 0) rotateY(${pvRot.toFixed(2)}deg) rotateX(${(-pvRot * 0.4).toFixed(2)}deg)`;
        } else {
          pvx = mx + 28;
          pvy = my + 24;
        }
      }
        requestAnimationFrame(loop);
    };
    loop();
  }
})();
