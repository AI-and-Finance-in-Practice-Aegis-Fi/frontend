import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const risks = [
  { label: "Duplicate SaaS vendors", value: 78, status: "Needs review" },
  { label: "Out-of-policy transactions", value: 42, status: "Investigating" },
  { label: "Renewal savings captured", value: 86, status: "On track" },
];

export function RiskPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk controls</CardTitle>
        <CardDescription>Policy signals ranked by CFO agent confidence</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {risks.map((risk) => {
          const healthy = risk.value >= 80;

          return (
            <div key={risk.label} className="rounded-md border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{risk.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{risk.status}</p>
                </div>
                <Badge variant={healthy ? "success" : "warning"} className="gap-1">
                  {healthy ? <CheckCircle2 className="size-3" /> : <AlertTriangle className="size-3" />}
                  {risk.value}%
                </Badge>
              </div>
              <Progress value={risk.value} className="mt-4" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
