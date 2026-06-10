import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MetricCardProps = {
  label: string;
  value: string;
  change: string;
  tone: "positive" | "attention";
};

export function MetricCard({ label, value, change, tone }: MetricCardProps) {
  const isPositive = tone === "positive";
  const Icon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-3">
          <p className="text-2xl font-semibold tracking-normal">{value}</p>
          <Badge variant={isPositive ? "success" : "warning"} className="gap-1">
            <Icon className="size-3" />
            {change}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
