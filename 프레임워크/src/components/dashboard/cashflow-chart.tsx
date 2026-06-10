"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const data = [
  { month: "Jan", cash: 820, burn: 132 },
  { month: "Feb", cash: 776, burn: 128 },
  { month: "Mar", cash: 732, burn: 119 },
  { month: "Apr", cash: 748, burn: 112 },
  { month: "May", cash: 781, burn: 106 },
  { month: "Jun", cash: 812, burn: 101 },
];

export function CashflowChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cash position</CardTitle>
        <CardDescription>Cash balance and monthly burn trend</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: -18, right: 8 }}>
              <defs>
                <linearGradient id="cash" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#0f766e" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}k`} />
              <Tooltip formatter={(value: number) => `$${value}k`} />
              <Area
                type="monotone"
                dataKey="cash"
                stroke="#0f766e"
                strokeWidth={2}
                fill="url(#cash)"
              />
              <Area
                type="monotone"
                dataKey="burn"
                stroke="#d97706"
                strokeWidth={2}
                fill="transparent"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
