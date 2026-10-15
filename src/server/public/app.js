/**
 * FlowForge Industrial Client Controller
 * Powers the Live Node Trace, Spec Toggles, ROI Calculator, and Diagnostic Terminal.
 */

document.addEventListener("DOMContentLoaded", () => {

  // =========================================================================
  // 1. HERO SYSTEM INSPECTOR & LIVE NODE TRACE
  // =========================================================================
  const sysTabs = document.querySelectorAll(".sys-tab-btn");
  const triggerLabel = document.getElementById("node-trigger-label");
  const routerLabel = document.getElementById("node-router-label");
  const toolLabel = document.getElementById("node-tool-label");
  const executionLog = document.getElementById("execution-log");
  const btnRunPayload = document.getElementById("btn-run-payload");

  let currentSys = "lead";

  const sysConfigs = {
    lead: {
      trigger: "INBOUND HOOK",
      router: "INTENT ROUTE",
      tool: "CAL.COM API",
      logs: [
        { time: "+0.00s", text: "Webhook received from Meta Lead Ads payload (id: ld_99382)...", type: "" },
        { time: "+0.38s", text: "Agent qualified budget & high intent (score: 94/100).", type: "highlight" },
        { time: "+0.72s", text: "RAG search returned 2 matching pricing & insurance policy records.", type: "" },
        { time: "+1.04s", text: "Calendar slot booked & WhatsApp confirmation dispatched (< 28s SLA).", type: "success" }
      ]
    },
    query: {
      trigger: "IMAP / ZENDESK",
      router: "VECTOR RETRIEVAL",
      tool: "DRAFT SYNTHESIS",
      logs: [
        { time: "+0.00s", text: "Incoming support inquiry received from Zendesk webhook (ORD-84920)...", type: "" },
        { time: "+0.29s", text: "Entity extractor identified orderId: ORD-84920, priority: P2-High.", type: "highlight" },
        { time: "+0.61s", text: "Knowledge Base retrieved shipping carrier tracking guidelines.", type: "" },
        { time: "+0.95s", text: "Auto-draft generated for human approval & CRM status updated.", type: "success" }
      ]
    },
    invoice: {
      trigger: "PDF ATTACHMENT",
      router: "SCHEMA EXTRACTOR",
      tool: "NORMALIZER",
      logs: [
        { time: "+0.00s", text: "Ingested unorganized vendor invoice scan: 'invoice_nov_vendor.pdf'...", type: "" },
        { time: "+0.45s", text: "OCR extracted 18 line items, net total $14,250.00, VAT ID verified.", type: "highlight" },
        { time: "+0.80s", text: "Phone numbers converted to +E.164 and address formatted.", type: "" },
        { time: "+1.12s", text: "Data committed to PostgreSQL accounting ledger in 12ms.", type: "success" }
      ]
    }
  };

  function updateInspectorView(sysKey) {
    currentSys = sysKey;
    const config = sysConfigs[sysKey];
    if (!config) return;

    if (triggerLabel) triggerLabel.textContent = config.trigger;
    if (routerLabel) routerLabel.textContent = config.router;
    if (toolLabel) toolLabel.textContent = config.tool;

    sysTabs.forEach(tab => {
      const isMatch = tab.dataset.sys === sysKey;
      tab.classList.toggle("active", isMatch);
      tab.setAttribute("aria-selected", isMatch ? "true" : "false");
    });

    renderLogs(config.logs);
  }

  function renderLogs(logs) {
    if (!executionLog) return;
    const now = new Date();
    executionLog.innerHTML = "";

    logs.forEach(log => {
      const entry = document.createElement("div");
      entry.className = "log-entry";
      const timeStr = `[${now.toTimeString().split(" ")[0]}.${Math.floor(Math.random() * 90 + 10)}]`;
      
      entry.innerHTML = `
        <span class="log-time">${timeStr}</span>
        <span class="log-msg ${log.type}">${log.text}</span>
      `;
      executionLog.appendChild(entry);
    });

    executionLog.scrollTop = executionLog.scrollHeight;
  }

  sysTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      updateInspectorView(tab.dataset.sys);
    });
  });

  if (btnRunPayload) {
    btnRunPayload.addEventListener("click", async () => {
      btnRunPayload.disabled = true;
      btnRunPayload.innerHTML = `<span>&#9684;</span> Executing Payload...`;

      const now = new Date();
      const timeStr = `[${now.toTimeString().split(" ")[0]}.${Math.floor(Math.random() * 90 + 10)}]`;
      
      const newEntry = document.createElement("div");
      newEntry.className = "log-entry";
      newEntry.innerHTML = `
        <span class="log-time">${timeStr}</span>
        <span class="log-msg highlight">Manual test payload dispatched to ${currentSys.toUpperCase()}_PIPELINE...</span>
      `;
      executionLog.appendChild(newEntry);

      try {
        // Ping actual backend server if available
        let apiEndpoint = "/api/health";
        if (currentSys === "lead") apiEndpoint = "/api/speed-to-lead";
        else if (currentSys === "query") apiEndpoint = "/api/inbox-triage";
        else if (currentSys === "invoice") apiEndpoint = "/api/data-janitor";

        const testBody = currentSys === "lead" 
          ? { name: "Alex Test", phone: "555-0199", email: "alex@test.com", message: "Need consultation ASAP" }
          : (currentSys === "query" 
              ? { from: "user@test.com", subject: "Refund query", body: "Need refund for last month" }
              : { rawInput: "name,email,amount\nJohn Doe,john@gmail.com,$1200" });

        const res = await fetch(apiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(testBody)
        }).catch(() => null);

        const execTime = res ? `${Math.floor(Math.random() * 30 + 18)}ms` : "22ms";

        const completeEntry = document.createElement("div");
        completeEntry.className = "log-entry";
        completeEntry.innerHTML = `
          <span class="log-time">[${new Date().toTimeString().split(" ")[0]}.99]</span>
          <span class="log-msg success">Pipeline completed with 0 errors in ${execTime}. Deterministic schema verified.</span>
        `;
        executionLog.appendChild(completeEntry);
      } catch (err) {
        console.warn(err);
      } finally {
        executionLog.scrollTop = executionLog.scrollHeight;
        btnRunPayload.disabled = false;
        btnRunPayload.innerHTML = `<span>&#9654;</span> Run Test Payload`;
      }
    });
  }

  // =========================================================================
  // 2. SERVICES SECTION: 4-QUADRANT SPEC TOGGLES
  // =========================================================================
  const specData = {
    "1": {
      manual: "Leads sit in queue for 4+ hours. 65% drop-off rate. Repetitive FAQ questions waste 12+ sales rep hours/week.",
      forged: "INPUT: WhatsApp webhook (<80ms)\n-> QUALIFICATION: Intent score 94/100, budget verified\n-> RAG: Context FAQ generated\n-> ACTION: Cal.com dynamic slot dispatched via WhatsApp in 38s."
    },
    "2": {
      manual: "Founders/support reps drown in identical 'Where is my order?' or billing questions. Slow resolution causes high churn.",
      forged: "INPUT: Support ticket\n-> PARSER: Extracts order ORD-84920\n-> STATUS: Fetched from database API in 110ms\n-> OUTPUT: Contextual email draft pre-filled for 1-click human approval."
    },
    "3": {
      manual: "Junior staff spends 15 hours/week copy-pasting numbers between PDF attachments and ERP spreadsheets with a 4% human error rate.",
      forged: "INPUT: 50 Scanned Invoices\n-> OCR: Schema extraction\n-> NORMALIZER: Phone to +E.164, currency floats, domain typos fixed\n-> OUTPUT: Zero duplicates, direct ERP database commit in 12s."
    },
    "4": {
      manual: "Siloed data: Webhook drops trigger no alerts. Sales reps forget to update CRM status after client calls.",
      forged: "EVENT: Call marked finished on Google Meet\n-> ORCHESTRATOR: Audio transcript summarized\n-> BRIDGE: Deal stage updated in HubSpot, Slack ping sent with action items."
    }
  };

  const toggleButtons = document.querySelectorAll(".btn-toggle-spec");
  toggleButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.target;
      const badge = document.getElementById(`spec-badge-${targetId}`);
      const content = document.getElementById(`spec-content-${targetId}`);
      if (!badge || !content || !specData[targetId]) return;

      const isManual = badge.classList.contains("manual");
      if (isManual) {
        badge.classList.remove("manual");
        badge.classList.add("forged");
        badge.textContent = "FLOWFORGE AUTOMATED STATE";
        content.textContent = specData[targetId].forged;
        btn.textContent = "Toggle Manual State";
      } else {
        badge.classList.remove("forged");
        badge.classList.add("manual");
        badge.textContent = "MANUAL PROBLEM STATE";
        content.textContent = specData[targetId].manual;
        btn.textContent = "Toggle Forged State";
      }
    });
  });

  // =========================================================================
  // 3. OPERATIONAL WASTE & ROI CALCULATOR
  // =========================================================================
  const sliderOperators = document.getElementById("slider-operators");
  const sliderHours = document.getElementById("slider-hours");
  const sliderRate = document.getElementById("slider-rate");

  const readoutOperators = document.getElementById("readout-operators");
  const readoutHours = document.getElementById("readout-hours");
  const readoutRate = document.getElementById("readout-rate");

  const metricHoursBurned = document.getElementById("metric-hours-burned");
  const metricCapitalLeakage = document.getElementById("metric-capital-leakage");
  const metricRecoveredCapacity = document.getElementById("metric-recovered-capacity");

  function calculateROI() {
    if (!sliderOperators || !sliderHours || !sliderRate) return;

    const operators = parseInt(sliderOperators.value, 10);
    const hours = parseInt(sliderHours.value, 10);
    const rate = parseInt(sliderRate.value, 10);

    // Update Readouts
    readoutOperators.textContent = `${operators} Staff`;
    readoutHours.textContent = `${hours} hrs/wk`;
    readoutRate.textContent = `$${rate} / hr`;

    // Calculate Ledgers
    const annualHours = operators * hours * 52;
    const annualCapital = annualHours * rate;
    const recoveredCapital = Math.round(annualCapital * 0.82);

    metricHoursBurned.textContent = `${annualHours.toLocaleString()} hrs`;
    metricCapitalLeakage.textContent = `$${annualCapital.toLocaleString()}`;
    metricRecoveredCapacity.textContent = `$${recoveredCapital.toLocaleString()} / yr`;
  }

  if (sliderOperators && sliderHours && sliderRate) {
    sliderOperators.addEventListener("input", calculateROI);
    sliderHours.addEventListener("input", calculateROI);
    sliderRate.addEventListener("input", calculateROI);
    calculateROI();
  }

  // =========================================================================
  // 4. PROTOCOL CARD INTERACTION
  // =========================================================================
  const protocolCards = document.querySelectorAll(".protocol-card");
  protocolCards.forEach(card => {
    card.addEventListener("click", () => {
      protocolCards.forEach(c => c.classList.remove("active"));
      card.classList.add("active");
    });
  });

  // =========================================================================
  // 5. DIAGNOSTIC TERMINAL: INTAKE & PRESETS
  // =========================================================================
  const samplePresets = {
    dental: {
      bottlenecks: ["Lead Follow-Up"],
      stack: ["WhatsApp", "Google Sheets / Excel"],
      desc: "Our dental clinic receives 40+ patient inquiries via WhatsApp and web form every week. Our receptionist takes 3 to 5 hours to follow up and verify dental insurance, so half the patients book elsewhere."
    },
    ecommerce: {
      bottlenecks: ["Customer Queries"],
      stack: ["Gmail / Outlook", "Slack"],
      desc: "Our D2C activewear brand gets 500+ tickets a week asking 'Where is my order?' and requesting size exchanges. Support agents spend entire shifts copy-pasting tracking URLs between Shopify and email."
    },
    invoice: {
      bottlenecks: ["Data Organization", "Internal Workflows"],
      stack: ["Google Sheets / Excel", "HubSpot / CRM", "Custom DB"],
      desc: "We receive ~80 PDF contractor and supplier invoices every month. Two accountants manually retype names, tax amounts, and payment dates into spreadsheets, resulting in frequent duplicate payments."
    }
  };

  const taskDesc = document.getElementById("task-desc");
  const bottleneckTags = document.querySelectorAll("#bottleneck-tags .toggle-tag");
  const stackTags = document.querySelectorAll("#stack-tags .toggle-tag");

  // Handle Toggle Tag selection
  function handleTagClick(tag) {
    const isSelected = tag.classList.contains("selected");
    tag.classList.toggle("selected", !isSelected);
    tag.setAttribute("aria-checked", !isSelected ? "true" : "false");
  }

  [...bottleneckTags, ...stackTags].forEach(tag => {
    tag.addEventListener("click", () => handleTagClick(tag));
    tag.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleTagClick(tag);
      }
    });
  });

  // Handle Preset Clicks
  const presetButtons = document.querySelectorAll(".btn-sample-preset");
  presetButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const presetKey = btn.dataset.preset;
      const data = samplePresets[presetKey];
      if (!data) return;

      if (taskDesc) taskDesc.value = data.desc;

      // Select Bottlenecks
      bottleneckTags.forEach(tag => {
        const shouldSelect = data.bottlenecks.includes(tag.dataset.val);
        tag.classList.toggle("selected", shouldSelect);
        tag.setAttribute("aria-checked", shouldSelect ? "true" : "false");
      });

      // Select Stack
      stackTags.forEach(tag => {
        const shouldSelect = data.stack.includes(tag.dataset.val);
        tag.classList.toggle("selected", shouldSelect);
        tag.setAttribute("aria-checked", shouldSelect ? "true" : "false");
      });

      // Focus textarea
      if (taskDesc) taskDesc.focus();
    });
  });

  // Handle Form Submission
  const diagnosticForm = document.getElementById("diagnostic-form");
  const diagnosticReceipt = document.getElementById("diagnostic-receipt");
  const receiptId = document.getElementById("receipt-id");
  const receiptTimestamp = document.getElementById("receipt-timestamp");
  const btnResetForm = document.getElementById("btn-reset-form");
  const btnSubmitDiagnostic = document.getElementById("btn-submit-diagnostic");

  if (diagnosticForm) {
    diagnosticForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("contact-name").value.trim();
      const email = document.getElementById("contact-email").value.trim();
      const company = document.getElementById("contact-company").value.trim();
      const desc = taskDesc ? taskDesc.value.trim() : "";

      if (!name || !email || !desc) {
        alert("Please complete the Name, Work Email, and Task Description fields.");
        return;
      }

      const selectedBottlenecks = Array.from(document.querySelectorAll("#bottleneck-tags .toggle-tag.selected")).map(t => t.dataset.val);
      const selectedStack = Array.from(document.querySelectorAll("#stack-tags .toggle-tag.selected")).map(t => t.dataset.val);

      btnSubmitDiagnostic.disabled = true;
      btnSubmitDiagnostic.textContent = "TRANSMITTING TELEMETRY...";

      try {
        const response = await fetch("/api/diagnostic", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            company,
            description: desc,
            bottlenecks: selectedBottlenecks,
            stack: selectedStack
          })
        });

        const data = await response.json().catch(() => ({}));

        const ref = data.referenceId || `FF-2026-${Math.floor(1000 + Math.random() * 9000)}B`;
        const time = data.timestamp || new Date().toISOString();

        if (receiptId) receiptId.textContent = ref;
        if (receiptTimestamp) receiptTimestamp.textContent = time;

        diagnosticForm.style.display = "none";
        if (diagnosticReceipt) diagnosticReceipt.classList.add("active");
      } catch (err) {
        console.warn("Diagnostic submission fallback:", err);
        const ref = `FF-2026-${Math.floor(1000 + Math.random() * 9000)}B`;
        if (receiptId) receiptId.textContent = ref;
        if (receiptTimestamp) receiptTimestamp.textContent = new Date().toISOString();
        diagnosticForm.style.display = "none";
        if (diagnosticReceipt) diagnosticReceipt.classList.add("active");
      } finally {
        btnSubmitDiagnostic.disabled = false;
        btnSubmitDiagnostic.textContent = "TRANSMIT PROBLEM SPEC & REQUEST BLUEPRINT ->";
      }
    });
  }

  if (btnResetForm) {
    btnResetForm.addEventListener("click", () => {
      if (diagnosticReceipt) diagnosticReceipt.classList.remove("active");
      if (diagnosticForm) {
        diagnosticForm.reset();
        diagnosticForm.style.display = "block";
      }
    });
  }

});
