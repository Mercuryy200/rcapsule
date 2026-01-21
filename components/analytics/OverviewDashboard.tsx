"use client";

import { StatsCard } from "@/components/analytics/StatsCard";

export function OverviewDashboard({ analytics }: { analytics: any }) {
  const { overview } = analytics;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        label="Collection Value"
        value={`$${overview.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
        subtext={`${overview.totalItems} items`}
        trend={
          overview.savings > 0
            ? `Saved $${overview.savings.toFixed(0)}`
            : undefined
        }
        trendPositive={true}
      />

      <StatsCard
        label="Cost Per Wear"
        value={`$${analytics.wear.avgCostPerWear.toFixed(2)}`}
        subtext="Average across worn items"
        trend={
          analytics.wear.avgCostPerWear < 10 ? "Excellent value!" : undefined
        }
        trendPositive={analytics.wear.avgCostPerWear < 10}
      />

      <StatsCard
        label="Sustainability"
        value={`${overview.sustainabilityScore}%`}
        subtext="Eco-friendly purchases"
        trend={
          overview.sustainabilityScore > 50 ? "Great job!" : "Room to improve"
        }
        trendPositive={overview.sustainabilityScore > 50}
      />

      <StatsCard
        label="Outfits Created"
        value={overview.totalOutfits}
        subtext={`Avg ${analytics.outfits.avgWears.toFixed(1)} wears each`}
      />
    </div>
  );
}
