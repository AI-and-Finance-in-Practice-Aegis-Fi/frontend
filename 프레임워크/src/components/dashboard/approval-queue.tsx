import { ArrowRight, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const approvals = [
  {
    vendor: "Datadog",
    owner: "Engineering",
    amount: "$12,800",
    status: "Renewal",
  },
  {
    vendor: "HubSpot",
    owner: "Revenue",
    amount: "$8,420",
    status: "Policy check",
  },
  {
    vendor: "AWS Marketplace",
    owner: "Platform",
    amount: "$23,100",
    status: "Variance",
  },
];

export function ApprovalQueue() {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Approval queue</CardTitle>
          <CardDescription>High-value requests awaiting CFO review</CardDescription>
        </div>
        <Button variant="outline" size="sm">
          <Clock />
          SLA view
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="border-b border-border text-muted-foreground">
              <tr>
                <th className="py-3 pr-4 font-medium">Vendor</th>
                <th className="py-3 pr-4 font-medium">Owner</th>
                <th className="py-3 pr-4 font-medium">Amount</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {approvals.map((approval) => (
                <tr key={approval.vendor} className="border-b border-border last:border-0">
                  <td className="py-4 pr-4 font-medium">{approval.vendor}</td>
                  <td className="py-4 pr-4 text-muted-foreground">{approval.owner}</td>
                  <td className="py-4 pr-4">{approval.amount}</td>
                  <td className="py-4 pr-4">
                    <Badge variant="outline">{approval.status}</Badge>
                  </td>
                  <td className="py-4 text-right">
                    <Button variant="ghost" size="sm">
                      Review
                      <ArrowRight />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
