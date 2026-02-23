// components/analytics/CategoryBreakdown.tsx
"use client";

export function CategoryBreakdown({ categories }: { categories: any[] }) {
  const maxCount = Math.max(...categories.map((c) => c.count), 1);

  return (
    <div className="bg-white dark:bg-black border border-[#E5E5E5] dark:border-[#262626] p-8">
      {/* Header */}
      <div className="mb-8 pb-4 border-b border-[#E5E5E5] dark:border-[#262626]">
        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#3c3c3c] dark:text-[#EDEDED] mb-1">
          Category Analysis
        </h3>
        <p className="text-xs text-[#6b7884] font-light italic">
          Distribution across your collection
        </p>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {categories.slice(0, 8).map((cat, index) => (
          <div key={cat.name} className="group">
            {/* Category Header */}
            <div className="flex justify-between items-baseline mb-3">
              <div className="flex items-baseline gap-3">
                <span className="text-[10px] font-bold text-[#6b7884] w-6">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-base font-black uppercase italic tracking-tight text-[#171717] dark:text-[#EDEDED]">
                  {cat.name}
                </span>
              </div>

              <div className="flex items-baseline gap-4">
                <span className="text-xs text-[#6b7884] font-light">
                  {cat.count} {cat.count === 1 ? "piece" : "pieces"}
                </span>
                <span className="text-sm font-bold text-[#171717] dark:text-[#EDEDED]">
                  ${cat.value.toFixed(0)}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-[#E5E5E5] dark:bg-[#262626] overflow-hidden mb-2">
              <div
                className="h-full bg-[#171717] dark:bg-[#FFFFFF] transition-all duration-700 ease-out"
                style={{ width: `${(cat.count / maxCount) * 100}%` }}
              />
            </div>

            {/* Metadata */}
            <div className="flex justify-between text-[9px] text-[#6b7884] uppercase tracking-[0.1em]">
              <span>Avg ${cat.avgPrice.toFixed(0)}</span>
              <span>{cat.wears} total wears</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
