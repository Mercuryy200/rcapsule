"use client";

import { Card, CardBody } from "@heroui/react";

interface StatsCardProps {
  label: string;
  value: string | number;
  subtext?: string;
}

export function StatsCard({ label, value, subtext }: StatsCardProps) {
  return (
    <Card
      className="bg-content1 border border-default-100 shadow-sm"
      radius="sm"
    >
      <CardBody className="p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-default-400 mb-1">
          {label}
        </p>
        <p className="text-2xl font-black tracking-tight">{value}</p>
        {subtext && <p className="text-xs text-default-400 mt-1">{subtext}</p>}
      </CardBody>
    </Card>
  );
}
