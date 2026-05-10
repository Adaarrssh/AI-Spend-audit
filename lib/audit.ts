import { pricing } from "./pricing";

export type Tool = {
  name: string;
  plan: string;
  spend: number;
  seats: number;
};

export type AuditResult = {
  tool: string;
  currentSpend: number;
  recommendedPlan: string;
  recommendedCost: number;
  savings: number;
  reason: string;
};

export function runAudit(
  tools: Tool[],
  teamSize: number,
  useCase: string,
): AuditResult[] {
  const results: AuditResult[] = [];

  tools.forEach((tool) => {
    if (!tool.name || !tool.plan) return;

    const vendorPricing = pricing[tool.name as keyof typeof pricing];

    if (!vendorPricing) return;

    let recommendedPlan = tool.plan;
    let recommendedCost = tool.spend;
    let reason = "Current plan looks optimal.";

    const plans = Object.entries(vendorPricing);

    const cheapestPlan = plans[0];

    if (tool.seats <= 2 && tool.plan.toLowerCase().includes("team")) {
      recommendedPlan = cheapestPlan[0];
      recommendedCost = Number(cheapestPlan[1]) * tool.seats;

      reason =
        "Small teams usually do not need team-tier collaboration features.";
    }

    if (tool.seats > teamSize) {
      recommendedCost =
        Number(vendorPricing[tool.plan as keyof typeof vendorPricing]) *
        teamSize;

      reason = "You are paying for more seats than your declared team size.";
    }

    if (useCase === "coding" && tool.name === "ChatGPT") {
      recommendedPlan = "GitHub Copilot Individual";
      recommendedCost = 10 * tool.seats;

      reason =
        "GitHub Copilot is usually more cost-efficient for coding-heavy workflows.";
    }

    const savings = Math.max(0, tool.spend - recommendedCost);

    results.push({
      tool: tool.name,
      currentSpend: tool.spend,
      recommendedPlan,
      recommendedCost,
      savings,
      reason,
    });
  });

  return results;
}
