/**
 * FlowForge Client Controller
 * Lightweight, accessible interactions for the high-contrast B2B website.
 */

document.addEventListener("DOMContentLoaded", () => {

  // =========================================================================
  // 1. SELECTABLE AREA PILLS IN CONTACT FORM
  // =========================================================================
  const pillOptions = document.querySelectorAll("#automation-areas .pill-option");

  pillOptions.forEach(pill => {
    pill.addEventListener("click", () => {
      pill.classList.toggle("selected");
    });
  });

  // =========================================================================
  // 2. CONTACT / GET STARTED FORM SUBMISSION
  // =========================================================================
  const form = document.getElementById("lead-contact-form");
  const confirmationBox = document.getElementById("contact-confirmation");
  const btnSubmit = document.getElementById("btn-submit-contact");
  const btnSendAnother = document.getElementById("btn-send-another");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nameInput = document.getElementById("user-name");
      const contactInput = document.getElementById("user-contact");
      const businessInput = document.getElementById("user-business");
      const problemInput = document.getElementById("user-problem");

      const name = nameInput ? nameInput.value.trim() : "";
      const contact = contactInput ? contactInput.value.trim() : "";
      const business = businessInput ? businessInput.value.trim() : "";
      const problem = problemInput ? problemInput.value.trim() : "";

      if (!name || !contact || !problem) {
        alert("Please complete your Name, Email or Phone, and a description of your repetitive task.");
        return;
      }

      const selectedAreas = Array.from(document.querySelectorAll("#automation-areas .pill-option.selected"))
        .map(pill => pill.dataset.value);

      btnSubmit.disabled = true;
      btnSubmit.textContent = "Sending...";

      try {
        await fetch("/api/diagnostic", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email: contact,
            company: business,
            description: problem,
            bottlenecks: selectedAreas
          })
        }).catch(() => null);

        // Show confirmation box
        form.style.display = "none";
        if (confirmationBox) {
          confirmationBox.classList.add("active");
        }
      } catch (err) {
        console.warn("Contact submission:", err);
        form.style.display = "none";
        if (confirmationBox) {
          confirmationBox.classList.add("active");
        }
      } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = "Send Message \u2192";
      }
    });
  }

  if (btnSendAnother) {
    btnSendAnother.addEventListener("click", () => {
      if (confirmationBox) confirmationBox.classList.remove("active");
      if (form) {
        form.reset();
        form.style.display = "block";
      }
    });
  }

  // =========================================================================
  // 3. REACT BITS: BORDER GLOW COMPONENT CONTROLLER
  // =========================================================================
  function parseHSL(hslStr) {
    const match = (hslStr || '').match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
    if (!match) return { h: 24, s: 95, l: 55 };
    return { h: parseFloat(match[1]), s: parseFloat(match[2]), l: parseFloat(match[3]) };
  }

  function buildGlowVars(glowColor, intensity) {
    const { h, s, l } = parseHSL(glowColor);
    const base = `${h}deg ${s}% ${l}%`;
    const opacities = [100, 60, 50, 40, 30, 20, 10];
    const keys = ['', '-60', '-50', '-40', '-30', '-20', '-10'];
    const vars = {};
    for (let i = 0; i < opacities.length; i++) {
      vars[`--glow-color${keys[i]}`] = `hsl(${base} / ${Math.min(opacities[i] * intensity, 100)}%)`;
    }
    return vars;
  }

  const GRADIENT_POSITIONS = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%'];
  const GRADIENT_KEYS = ['--gradient-one', '--gradient-two', '--gradient-three', '--gradient-four', '--gradient-five', '--gradient-six', '--gradient-seven'];
  const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

  function buildGradientVars(colors) {
    const vars = {};
    for (let i = 0; i < 7; i++) {
      const c = colors[Math.min(COLOR_MAP[i], colors.length - 1)];
      vars[GRADIENT_KEYS[i]] = `radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${c} 0px, transparent 50%)`;
    }
    vars['--gradient-base'] = `linear-gradient(${colors[0]} 0 100%)`;
    return vars;
  }

  function easeOutCubic(x) { return 1 - Math.pow(1 - x, 3); }
  function easeInCubic(x) { return x * x * x; }

  function animateValue({ start = 0, end = 100, duration = 1000, delay = 0, ease = easeOutCubic, onUpdate, onEnd }) {
    const t0 = performance.now() + delay;
    function tick() {
      const elapsed = performance.now() - t0;
      const t = Math.min(elapsed / duration, 1);
      onUpdate(start + (end - start) * ease(t));
      if (t < 1) requestAnimationFrame(tick);
      else if (onEnd) onEnd();
    }
    setTimeout(() => requestAnimationFrame(tick), delay);
  }

  function getCenterOfElement(el) {
    const rect = el.getBoundingClientRect();
    return [rect.width / 2, rect.height / 2];
  }

  function getEdgeProximity(el, x, y) {
    const [cx, cy] = getCenterOfElement(el);
    const dx = x - cx;
    const dy = y - cy;
    let kx = Infinity;
    let ky = Infinity;
    if (dx !== 0) kx = cx / Math.abs(dx);
    if (dy !== 0) ky = cy / Math.abs(dy);
    return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
  }

  function getCursorAngle(el, x, y) {
    const [cx, cy] = getCenterOfElement(el);
    const dx = x - cx;
    const dy = y - cy;
    if (dx === 0 && dy === 0) return 0;
    const radians = Math.atan2(dy, dx);
    let degrees = radians * (180 / Math.PI) + 90;
    if (degrees < 0) degrees += 360;
    return degrees;
  }

  function isLightColor(color) {
    if (!color) return false;
    const value = color.trim().replace('#', '');
    if (!/^[\da-f]{3}([\da-f]{3})?$/i.test(value)) return false;
    const hex = value.length === 3 ? value.split('').map(char => char + char).join('') : value;
    const red = parseInt(hex.slice(0, 2), 16);
    const green = parseInt(hex.slice(2, 4), 16);
    const blue = parseInt(hex.slice(4, 6), 16);
    return red * 0.2126 + green * 0.7152 + blue * 0.0722 > 180;
  }

  function initBorderGlow(card, config = {}) {
    const glowColor = card.dataset.glowColor || config.glowColor || '24 95 55';
    let colors = ['#e84a15', '#ff6b35', '#f59e0b'];
    if (card.dataset.colors) {
      try { colors = JSON.parse(card.dataset.colors); } catch(e) {}
    } else if (config.colors) {
      colors = config.colors;
    }

    const intensity = parseFloat(card.dataset.glowIntensity || config.glowIntensity || 1.15);
    const edgeSensitivity = parseFloat(card.dataset.edgeSensitivity || config.edgeSensitivity || 28);
    const borderRadius = parseFloat(card.dataset.borderRadius || config.borderRadius || 10);
    const glowRadius = parseFloat(card.dataset.glowRadius || config.glowRadius || 36);
    const coneSpread = parseFloat(card.dataset.coneSpread || config.coneSpread || 24);
    const bgColor = card.dataset.backgroundColor || config.backgroundColor || '#0c0c10';

    if (isLightColor(bgColor) || card.classList.contains('border-glow-card--light')) {
      card.classList.add('border-glow-card--light');
    }

    card.style.setProperty('--card-bg', bgColor);
    card.style.setProperty('--edge-sensitivity', edgeSensitivity);
    card.style.setProperty('--border-radius', `${borderRadius}px`);
    card.style.setProperty('--glow-padding', `${glowRadius}px`);
    card.style.setProperty('--cone-spread', coneSpread);

    const glowVars = buildGlowVars(glowColor, intensity);
    Object.entries(glowVars).forEach(([k, v]) => card.style.setProperty(k, v));

    const gradientVars = buildGradientVars(colors);
    Object.entries(gradientVars).forEach(([k, v]) => card.style.setProperty(k, v));

    // Interactive pointer movement tracking
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const edge = getEdgeProximity(card, x, y);
      const angle = getCursorAngle(card, x, y);

      card.style.setProperty('--edge-proximity', (edge * 100).toFixed(3));
      card.style.setProperty('--cursor-angle', `${angle.toFixed(3)}deg`);
    });

    // Pointer leave: fade edge proximity smoothly to 0
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--edge-proximity', '0');
    });

    // Mount intro sweep animation
    const animated = card.dataset.animated !== 'false';
    if (animated) {
      const delay = parseInt(card.dataset.sweepDelay || '250', 10);
      const angleStart = 110;
      const angleEnd = 465;
      setTimeout(() => {
        card.classList.add('sweep-active');
        card.style.setProperty('--cursor-angle', `${angleStart}deg`);

        animateValue({ duration: 400, onUpdate: v => card.style.setProperty('--edge-proximity', v) });
        animateValue({ ease: easeInCubic, duration: 1200, end: 50, onUpdate: v => {
          card.style.setProperty('--cursor-angle', `${(angleEnd - angleStart) * (v / 100) + angleStart}deg`);
        }});
        animateValue({ ease: easeOutCubic, delay: 1200, duration: 1800, start: 50, end: 100, onUpdate: v => {
          card.style.setProperty('--cursor-angle', `${(angleEnd - angleStart) * (v / 100) + angleStart}deg`);
        }});
        animateValue({ ease: easeInCubic, delay: 2000, duration: 1200, start: 100, end: 0,
          onUpdate: v => card.style.setProperty('--edge-proximity', v),
          onEnd: () => card.classList.remove('sweep-active'),
        });
      }, delay);
    }
  }

  // Initialize BorderGlow on all hero cards
  const glowCards = document.querySelectorAll('.border-glow-card, [data-border-glow]');
  glowCards.forEach((card, idx) => {
    if (!card.dataset.sweepDelay) {
      card.dataset.sweepDelay = `${250 + idx * 220}`;
    }
    initBorderGlow(card);
  });

  // =========================================================================
  // 4. SIMPLIFY-STYLE SCROLL ANIMATION SYSTEM
  // =========================================================================

  // A. Top Reading Progress Bar
  let progressBar = document.getElementById('scroll-progress-bar');
  if (!progressBar) {
    progressBar = document.createElement('div');
    progressBar.id = 'scroll-progress-bar';
    progressBar.className = 'scroll-progress-bar';
    document.body.prepend(progressBar);
  }

  const updateScrollProgress = () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
    progressBar.style.width = `${Math.min(Math.max(progress, 0), 100)}%`;

    // Dynamic header elevation on scroll
    const navHeader = document.querySelector('.nav-header');
    if (navHeader) {
      if (window.scrollY > 24) {
        navHeader.classList.add('nav-scrolled');
      } else {
        navHeader.classList.remove('nav-scrolled');
      }
    }
  };

  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();

  // B. IntersectionObserver Scroll Reveal System
  const revealElements = document.querySelectorAll('.scroll-reveal');
  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('is-revealed'));
  }

  // C. Interactive Process Step Illuminator on Scroll
  const stepCards = document.querySelectorAll('.step-card');
  if ('IntersectionObserver' in window && stepCards.length > 0) {
    const stepObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        } else {
          entry.target.classList.remove('in-view');
        }
      });
    }, {
      threshold: 0.5,
      rootMargin: '-10% 0px -10% 0px'
    });

    stepCards.forEach(card => stepObserver.observe(card));
  }

});
