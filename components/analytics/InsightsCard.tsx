// components/analytics/InsightsCard.tsx
"use client";

import {
  LightBulbIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export function InsightsCard({ insights }: { insights: any[] }) {
  const getStyles = (type: string) => {
    switch (type) {
      case "positive":
        return {
          border: "border-[#2d4530]",
          bg: "bg-[#2d4530]/5",
          icon: "text-[#2d4530]",
          IconComponent: CheckCircleIcon,
        };
      case "warning":
        return {
          border: "border-[#5e4b3b]",
          bg: "bg-[#5e4b3b]/5",
          icon: "text-[#5e4b3b]",
          IconComponent: ExclamationTriangleIcon,
        };
      default:
        return {
          border: "border-[#6b7884]",
          bg: "bg-[#6b7884]/5",
          icon: "text-[#6b7884]",
          IconComponent: LightBulbIcon,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#E5E5E5] dark:border-[#262626] pb-4">
        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#3c3c3c] dark:text-[#EDEDED]">
          Wardrobe Intelligence
        </h3>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, index) => {
          const styles = getStyles(insight.type);
          const Icon = styles.IconComponent;

          return (
            <div
              key={index}
              className={`${styles.bg} border-l-4 ${styles.border} p-5 group hover:shadow-md transition-all duration-300`}
            >
              <div className="flex items-start gap-4">
                <Icon
                  className={`w-5 h-5 ${styles.icon} flex-shrink-0 mt-0.5`}
                />
                <div className="flex-1">
                  <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#6b7884] mb-2">
                    {insight.category}
                  </p>
                  <p className="text-sm leading-relaxed text-[#171717] dark:text-[#EDEDED] font-light">
                    {insight.message}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
