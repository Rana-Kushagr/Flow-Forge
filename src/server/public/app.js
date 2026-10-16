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
  // 4. INTERACTIVE SOLUTION BLUEPRINT COMPONENT (Right Hero Column)
  // =========================================================================
  const blueprintScenarios = [
    {
      name: "Lead Follow-Up",
      bottleneck: "Inquiries arrive after hours. Team spends the first 2 hours of every morning manually sorting emails and copying details into CRM.",
      solution: "Autonomous intake agent qualifies urgency, extracts prospect needs, logs the lead into CRM, and drafts an immediate personalized response.",
      result: "Zero missed inquiries, instant response times, and your team only steps in for qualified, high-intent conversations."
    },
    {
      name: "Doc Triage",
      bottleneck: "Staff manually opens dozens of client PDFs, invoices, or intake forms each day to re-type line items and verify requirements.",
      solution: "Custom extraction pipeline parses incoming documents, validates key figures against rules, and routes structured data into internal tools.",
      result: "Documents processed within seconds of arrival with high accuracy and an auditable record of every action."
    },
    {
      name: "Sheet Sync",
      bottleneck: "Project updates, status notes, and customer records sit siloed across separate apps, requiring endless copy-pasting to stay aligned.",
      solution: "Deterministic two-way workflow automation bridges your project manager, databases, and spreadsheets whenever records change.",
      result: "Every dashboard and sheet updates in real time automatically without human intervention or copy-paste errors."
    }
  ];

  let activeScenarioIndex = 0;
  let scenarioTimer = null;
  let scenarioProgress = 0;
  const SCENARIO_DURATION = 5000; // 5 seconds per scenario
  const PROGRESS_TICK = 50; // 50ms tick
  let isScenarioPaused = false;

  const scenarioTabs = document.querySelectorAll('.scenario-tab-btn');
  const textProblem = document.getElementById('blueprint-text-problem');
  const textSolution = document.getElementById('blueprint-text-solution');
  const textResult = document.getElementById('blueprint-text-result');
  const blueprintCard = document.getElementById('interactive-blueprint-card');

  function setBlueprintScenario(index, manualClick = false) {
    if (index === activeScenarioIndex && !manualClick) return;
    activeScenarioIndex = index;
    scenarioProgress = 0;

    // Update tabs UI
    scenarioTabs.forEach((tab, idx) => {
      const isActive = idx === activeScenarioIndex;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      const pBar = tab.querySelector('.scenario-progress-bar');
      if (pBar) {
        pBar.style.width = '0%';
      }
    });

    // Cross-fade text smoothly
    const textElements = [textProblem, textSolution, textResult];
    textElements.forEach(el => {
      if (el) el.classList.add('text-transitioning');
    });

    setTimeout(() => {
      const data = blueprintScenarios[activeScenarioIndex];
      if (textProblem && data) textProblem.textContent = data.bottleneck;
      if (textSolution && data) textSolution.textContent = data.solution;
      if (textResult && data) textResult.textContent = data.result;

      textElements.forEach(el => {
        if (el) el.classList.remove('text-transitioning');
      });
    }, 180);
  }

  function startBlueprintCycle() {
    if (scenarioTimer) clearInterval(scenarioTimer);
    scenarioTimer = setInterval(() => {
      if (isScenarioPaused) return;

      scenarioProgress += (PROGRESS_TICK / SCENARIO_DURATION) * 100;
      const activeTab = scenarioTabs[activeScenarioIndex];
      if (activeTab) {
        const pBar = activeTab.querySelector('.scenario-progress-bar');
        if (pBar) pBar.style.width = `${Math.min(scenarioProgress, 100)}%`;
      }

      if (scenarioProgress >= 100) {
        const nextIndex = (activeScenarioIndex + 1) % blueprintScenarios.length;
        setBlueprintScenario(nextIndex);
      }
    }, PROGRESS_TICK);
  }

  if (scenarioTabs.length > 0) {
    scenarioTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetIndex = parseInt(tab.dataset.scenario, 10);
        setBlueprintScenario(targetIndex, true);
      });
    });

    if (blueprintCard) {
      blueprintCard.addEventListener('mouseenter', () => { isScenarioPaused = true; });
      blueprintCard.addEventListener('mouseleave', () => { isScenarioPaused = false; });
      blueprintCard.addEventListener('touchstart', () => { isScenarioPaused = true; }, { passive: true });
    }

    setBlueprintScenario(0, true);
    startBlueprintCycle();
  }

  // =========================================================================
  // 5. PARALLAX HERO BACKGROUND CONTROLLER
  // =========================================================================
  const heroSection = document.getElementById('hero');
  const heroPhoto = document.querySelector('.hero-bg-photo');

  function updateHeroParallax() {
    if (!heroSection || !heroPhoto) return;
    const rect = heroSection.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top <= window.innerHeight) {
      const scrolled = Math.max(0, -rect.top);
      heroPhoto.style.transform = `translate3d(0, ${(scrolled * 0.18).toFixed(1)}px, 0)`;
    }
  }

  // =========================================================================
  // 6. GLOBAL SCROLL PROGRESS & ACTIVE NAV SPY
  // =========================================================================
  let progressBar = document.getElementById('scroll-progress-bar');
  const navHeader = document.querySelector('.nav-header');
  const navLinks = document.querySelectorAll('.nav-links-wrap .nav-item');
  const trackedSections = [
    document.getElementById('services'),
    document.getElementById('how-it-works'),
    document.getElementById('about'),
    document.getElementById('contact')
  ].filter(Boolean);

  function updateScrollAndNav() {
    const scrollY = window.scrollY || window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

    if (progressBar) {
      progressBar.style.width = `${Math.min(Math.max(progress, 0), 100)}%`;
    }

    if (navHeader) {
      if (scrollY > 20) {
        navHeader.classList.add('nav-scrolled');
      } else {
        navHeader.classList.remove('nav-scrolled');
      }
    }

    // Active nav highlighting on scroll
    const viewportAnchor = scrollY + 180;
    let activeId = '';

    for (let i = trackedSections.length - 1; i >= 0; i--) {
      const section = trackedSections[i];
      if (section.offsetTop <= viewportAnchor) {
        activeId = section.id;
        break;
      }
    }

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${activeId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // =========================================================================
  // 7. HOW IT WORKS: CONTINUOUS PROGRESS LINE & STEP SPOTLIGHT
  // =========================================================================
  const howItWorksSection = document.getElementById('how-it-works');
  const stepsProgressFill = document.getElementById('steps-progress-fill');
  const stepCards = document.querySelectorAll('.step-card');

  function updateHowItWorksProgress() {
    if (!howItWorksSection || !stepsProgressFill) return;
    const rect = howItWorksSection.getBoundingClientRect();
    const sectionHeight = rect.height;
    const windowHeight = window.innerHeight;

    if (rect.top <= windowHeight && rect.bottom >= 0) {
      const totalDistance = sectionHeight + windowHeight * 0.4;
      const scrolledPast = windowHeight - rect.top;
      const percentage = Math.min(Math.max((scrolledPast / totalDistance) * 100, 10), 100);
      stepsProgressFill.style.width = `${percentage}%`;

      // Map progress to active step spotlight
      const stepIndex = Math.min(Math.floor((percentage / 100) * stepCards.length), stepCards.length - 1);
      stepCards.forEach((card, idx) => {
        if (idx === stepIndex) {
          card.classList.add('active');
        } else {
          card.classList.remove('active');
        }
      });
    }
  }

  // Interactive click spotlight for step cards
  stepCards.forEach(card => {
    card.addEventListener('click', () => {
      stepCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
    });
  });

  // =========================================================================
  // 8. ABOUT SECTION: SCROLL-SCRUBBED MISSION REVEAL
  // =========================================================================
  const aboutSection = document.getElementById('about');
  const scrubSentences = document.querySelectorAll('.about-scrub-sentence');

  function updateAboutScrub() {
    if (!aboutSection || scrubSentences.length === 0) return;
    const rect = aboutSection.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    if (rect.top <= windowHeight && rect.bottom >= 0) {
      const totalDistance = rect.height + windowHeight * 0.4;
      const scrolledPast = windowHeight - rect.top;
      const ratio = Math.min(Math.max(scrolledPast / totalDistance, 0), 1);

      scrubSentences.forEach((span, idx) => {
        const threshold = 0.12 + idx * 0.22;
        if (ratio >= threshold) {
          span.classList.add('illuminated');
        } else {
          if (idx > 0) span.classList.remove('illuminated');
        }
      });
    }
  }

  // =========================================================================
  // 9. HIGH-EFFICIENCY SCROLL DISPATCHER (requestAnimationFrame)
  // =========================================================================
  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        updateScrollAndNav();
        updateHeroParallax();
        updateHowItWorksProgress();
        updateAboutScrub();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });

  // Initial calculation on load
  updateScrollAndNav();
  updateHeroParallax();
  updateHowItWorksProgress();
  updateAboutScrub();

  // =========================================================================
  // 10. INTERSECTION OBSERVER SCROLL REVEALS
  // =========================================================================
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

  // =========================================================================
  // 11. CONTACT: QUICK-FILL PROMPT CHIPS & "AUTOMATE THIS" DISPATCHER
  // =========================================================================
  const promptChips = document.querySelectorAll('.prompt-chip');
  const problemTextarea = document.getElementById('user-problem');

  promptChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const promptText = chip.dataset.prompt;
      if (problemTextarea && promptText) {
        problemTextarea.value = promptText;
        problemTextarea.focus();
        problemTextarea.classList.remove('field-highlight');
        void problemTextarea.offsetWidth; // force reflow
        problemTextarea.classList.add('field-highlight');
      }
    });
  });

  // "Automate This →" links from service cards
  const automateLinks = document.querySelectorAll('.service-automate-link');
  automateLinks.forEach(link => {
    link.addEventListener('click', () => {
      const targetCategory = link.dataset.serviceCategory;
      if (targetCategory) {
        const matchingPill = Array.from(document.querySelectorAll('#automation-areas .pill-option'))
          .find(p => p.dataset.value === targetCategory);

        if (matchingPill) {
          document.querySelectorAll('#automation-areas .pill-option').forEach(p => p.classList.remove('selected'));
          matchingPill.classList.add('selected');
        }
      }

      if (problemTextarea) {
        setTimeout(() => {
          problemTextarea.focus();
          problemTextarea.classList.remove('field-highlight');
          void problemTextarea.offsetWidth;
          problemTextarea.classList.add('field-highlight');
        }, 350);
      }
    });
  });

});
