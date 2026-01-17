"use client";

import { Progress } from "@heroui/react";

interface ColorStat {
  color: string;
  count: number;
  percentage: number;
}

export function ColorPalette({ colors }: { colors: ColorStat[] }) {
  const topColors = colors.slice(0, 5);
  if (!colors || colors.length === 0) {
    return (
      <div className="h-48 flex flex-col items-center justify-center text-center border-2 border-dashed border-default-200 rounded-lg">
        <p className="text-default-400 text-sm font-medium">
          No color data found
        </p>
        <p className="text-[10px] text-default-300 uppercase tracking-widest mt-1">
          Add items to see your palette
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-default-500 mb-4">
        Color Analysis
      </h3>
      <div className="space-y-3">
        {topColors.map((c) => (
          <div key={c.color} className="flex items-center gap-3">
            {/* Color Bubble */}
            <div
              className="w-4 h-4 rounded-full border border-default-200 shadow-sm"
              style={{ backgroundColor: c.color }}
            />

            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="capitalize font-medium">{c.color}</span>
                <span className="text-default-400">{c.percentage}%</span>
              </div>
              <Progress
                value={c.percentage}
                size="sm"
                radius="none"
                classNames={{
                  indicator: "bg-foreground",
                  track: "bg-default-100",
                }}
                aria-label={`${c.color} percentage`}
              />
            </div>
          </div>
        ))}
        {colors.length === 0 && (
          <p className="text-xs text-default-400 italic">
            No color data available.
          </p>
        )}
      </div>
    </div>
  );
}
