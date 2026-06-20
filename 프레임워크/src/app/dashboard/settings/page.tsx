import { getDashboardSummary } from "@/lib/api";

import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  try {
    const summary = await getDashboardSummary();
    return <SettingsClient departments={summary.department_budgets} policies={[]} />;
  } catch {
    return <SettingsClient departments={[]} policies={[]} />;
  }
}
