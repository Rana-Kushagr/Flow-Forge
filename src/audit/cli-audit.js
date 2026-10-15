/**
 * Flow-Forge CLI Bottleneck Audit Runner
 * Run directly via: npm run audit
 */

import { BottleneckAudit } from "./bottleneck-audit.js";

const sampleInput = {
  companyName: process.argv[2] || "BrightSmile Dental Practice",
  industry: "Local Healthcare & Services",
  monthlyLeads: parseInt(process.argv[3], 10) || 140,
  currentResponseHours: parseFloat(process.argv[4]) || 3.5,
  averageDealValue: parseInt(process.argv[5], 10) || 1500,
  weeklyAdminHours: parseInt(process.argv[6], 10) || 16,
  hourlyAdminRate: 35
};

console.log("\n=======================================================");
console.log(" FLOW-FORGE: 15-MINUTE BOTTLENECK AUDIT");
console.log("=======================================================\n");

const results = BottleneckAudit.analyze(sampleInput);
console.log(BottleneckAudit.toMarkdownReport(results));
