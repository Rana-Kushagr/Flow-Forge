/**
 * Trojan Horse Tool: 15-Minute Workflow Bottleneck Audit
 * Generates an executive ROI projection and visual workflow blueprint
 * comparing a client's manual operations with Flow-Forge automated systems.
 */

export class BottleneckAudit {
  /**
   * Run economic and operational audit calculation
   */
  static analyze({
    companyName = "Prospective Client",
    industry = "Local Services",
    monthlyLeads = 120,
    currentResponseHours = 4,
    averageDealValue = 1200,
    weeklyAdminHours = 15,
    hourlyAdminRate = 35
  }) {
    // 1. Operational Cost Analysis
    const annualAdminHours = weeklyAdminHours * 52;
    const annualAdminCost = annualAdminHours * hourlyAdminRate;

    // 2. Lead Conversion Decay Model
    // Research shows response time > 5 minutes causes severe qualification decay.
    // Base conversion at <1 min response = ~12%; at 4 hours = ~3%; at 24 hours = ~1%
    const currentConversionRate = Math.max(0.01, 0.12 * Math.exp(-0.35 * Math.min(currentResponseHours, 12)));
    const automatedConversionRate = 0.115; // Realistic target with <60s response

    const currentMonthlyDeals = Math.round(monthlyLeads * currentConversionRate);
    const automatedMonthlyDeals = Math.round(monthlyLeads * automatedConversionRate);
    const additionalMonthlyDeals = Math.max(1, automatedMonthlyDeals - currentMonthlyDeals);

    const monthlyRevenueGain = additionalMonthlyDeals * averageDealValue;
    const annualRevenueGain = monthlyRevenueGain * 12;

    // 3. Efficiency Savings
    // Flow-Forge recovers ~80% of repetitive triage and data entry hours
    const annualHoursSaved = Math.round(annualAdminHours * 0.80);
    const annualLaborSavings = Math.round(annualHoursSaved * hourlyAdminRate);

    // 4. Total Financial Impact & ROI
    const totalAnnualImpact = annualRevenueGain + annualLaborSavings;
    const estimatedPilotCost = 2500; // Standard low-friction pilot fee
    const estimatedMonthlyRetainer = 950;
    const totalAnnualInvestment = estimatedPilotCost + (estimatedMonthlyRetainer * 11);
    const projectedROI = Math.round(((totalAnnualImpact - totalAnnualInvestment) / totalAnnualInvestment) * 100);

    return {
      companyName,
      industry,
      parameters: {
        monthlyLeads,
        currentResponseHours,
        averageDealValue,
        weeklyAdminHours,
        hourlyAdminRate
      },
      findings: {
        currentConversionRate: `${(currentConversionRate * 100).toFixed(1)}%`,
        automatedConversionRate: `${(automatedConversionRate * 100).toFixed(1)}%`,
        monthlyDealsCurrent: currentMonthlyDeals,
        monthlyDealsProjected: automatedMonthlyDeals,
        additionalAnnualDeals: additionalMonthlyDeals * 12,
        annualRevenueGain,
        annualHoursSaved,
        annualLaborSavings,
        totalAnnualImpact,
        projectedROI: `${projectedROI}%`
      },
      blueprint: [
        {
          stage: "1. Inbound Lead Ingestion & Qualification",
          currentManualState: `Leads sit in inbox/WhatsApp queue for avg ${currentResponseHours} hours before a rep reviews them. High decay rate.`,
          flowForgeSolution: "Flow-Forge Speed-to-Lead webhooks qualify intent, answer immediate FAQs via RAG, and book calendar slot within 60 seconds.",
          metricOutcome: "+200% to +300% lift in booked discovery calls"
        },
        {
          stage: "2. Email & Support Triage",
          currentManualState: `Staff manually reads all incoming messages, copy-pasting customer details into CRM, spending ~${weeklyAdminHours} hrs/week.`,
          flowForgeSolution: "Inbox Autopilot automatically categorizes incoming tickets, extracts order/invoice IDs, and drafts context-aware replies for 1-click human approval.",
          metricOutcome: `Recovers ~${Math.round(weeklyAdminHours * 0.8)} hours weekly for high-value strategic work`
        },
        {
          stage: "3. Records & Data Cleanliness",
          currentManualState: "Messy spreadsheets, unstandardized phone numbers, missing emails, and duplicate entries cause sales friction.",
          flowForgeSolution: "The Data Janitor automatically normalizes phone formats (+E.164), validates emails, standardizes currency, and deduplicates contacts before syncing.",
          metricOutcome: "Zero manual data entry and 100% clean CRM records"
        }
      ],
      recommendedWedgePlan: {
        step1: "Free 15-Minute Bottleneck Audit (Completed)",
        step2: "7-Day Low-Friction Pilot: Deploy Speed-to-Lead Engine on primary inbound channel ($2,500 one-off)",
        step3: "Monthly Automation Retainer: Support, RAG tuning, and Inbox Triage expansion ($950/month)"
      }
    };
  }

  /**
   * Generates a printable markdown report
   */
  static toMarkdownReport(auditResult) {
    const f = auditResult.findings;
    return `# Flow-Forge Workflow Audit: ${auditResult.companyName}
**Industry:** ${auditResult.industry} | **Date:** ${new Date().toLocaleDateString()}

---

## Executive Summary
- **Total Projected Annual Value:** $${f.totalAnnualImpact.toLocaleString()}
- **Annual Hours Reclaimed:** ${f.annualHoursSaved} hours
- **Estimated ROI:** ${f.projectedROI}

### Operational Breakdown
| Metric | Current Manual Process | Flow-Forge Automated System | Delta |
|---|---|---|---|
| Inbound Response Time | ${auditResult.parameters.currentResponseHours} Hours | < 60 Seconds | 99% reduction |
| Lead Conversion Rate | ${f.currentConversionRate} | ${f.automatedConversionRate} | +${(parseFloat(f.automatedConversionRate) - parseFloat(f.currentConversionRate)).toFixed(1)}% |
| Monthly Booked Deals | ${f.monthlyDealsCurrent} deals | ${f.monthlyDealsProjected} deals | +${f.monthlyDealsProjected - f.monthlyDealsCurrent}/month |
| Annual Pipeline Gain | — | $${f.annualRevenueGain.toLocaleString()} | +$${f.annualRevenueGain.toLocaleString()} |
| Annual Admin Labor Cost | $${(auditResult.parameters.weeklyAdminHours * 52 * auditResult.parameters.hourlyAdminRate).toLocaleString()} | $${((auditResult.parameters.weeklyAdminHours * 52 - f.annualHoursSaved) * auditResult.parameters.hourlyAdminRate).toLocaleString()} | -$${f.annualLaborSavings.toLocaleString()} saved |

---

## 3-Phase Transformation Blueprint
${auditResult.blueprint.map((b, i) => `### Stage ${i + 1}: ${b.stage}
- **Current Bottleneck:** ${b.currentManualState}
- **Flow-Forge System:** ${b.flowForgeSolution}
- **Business Outcome:** **${b.metricOutcome}**
`).join("\n")}

---

## Next Steps: Low-Friction Pilot
1. **Scope:** Deploy Speed-to-Lead Engine on the highest-friction channel.
2. **Turnaround:** 5 to 7 business days.
3. **Guarantee:** Measurable sub-60-second response and automated calendar booking.
`;
  }
}
