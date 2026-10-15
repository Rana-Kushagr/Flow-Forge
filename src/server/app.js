import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SpeedToLeadEngine } from "../systems/speed-to-lead/engine.js";
import { InboxTriageEngine } from "../systems/inbox-triage/engine.js";
import { DataJanitorEngine } from "../systems/data-janitor/engine.js";
import { BottleneckAudit } from "../audit/bottleneck-audit.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Initialize engine instances
const speedToLead = new SpeedToLeadEngine();
const inboxTriage = new InboxTriageEngine();
const dataJanitor = new DataJanitorEngine();

// API Health
app.get("/api/health", (req, res) => {
  res.json({
    status: "OPERATIONAL",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    nodesActive: "99.98%",
    avgLatencyMs: 380
  });
});

// Speed to Lead API
app.post("/api/speed-to-lead", async (req, res) => {
  try {
    const result = await speedToLead.processInquiry(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Inbox Triage API
app.post("/api/inbox-triage", async (req, res) => {
  try {
    const result = await inboxTriage.triageMessage(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Data Janitor API
app.post("/api/data-janitor", (req, res) => {
  try {
    const { rawInput } = req.body;
    const result = dataJanitor.cleanRecords(rawInput);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bottleneck Audit Calculator API
app.post("/api/audit", (req, res) => {
  try {
    const result = BottleneckAudit.analyze(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Diagnostic Intake Submission
app.post("/api/diagnostic", (req, res) => {
  try {
    const { name, email, company, bottlenecks, stack, description } = req.body;
    if (!name || !email || !description) {
      return res.status(400).json({ error: "Name, email, and task description are required." });
    }

    const refId = `FF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
    
    res.json({
      success: true,
      referenceId: refId,
      timestamp: new Date().toISOString(),
      status: "QUEUED_FOR_DISSECTION",
      summary: {
        company: company || "Undisclosed",
        contact: email,
        bottlenecks: bottlenecks || [],
        stack: stack || []
      },
      message: "Telemetry received. Architectural blueprint dispatching within 4 business hours."
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server if run directly
if (process.argv[1] === __filename) {
  app.listen(PORT, () => {
    console.log(`[FlowForge] Industrial Engine online at http://localhost:${PORT}`);
  });
}

export default app;
