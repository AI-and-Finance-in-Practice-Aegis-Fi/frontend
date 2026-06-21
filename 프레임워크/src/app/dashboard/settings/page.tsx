import { getDashboardSummary, getPolicies } from "@/lib/api";

import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  try {
    const [summary, policies] = await Promise.all([getDashboardSummary(), getPolicies()]);
    return <SettingsClient departments={summary.department_budgets} policies={policies} />;
  } catch {
    return <SettingsClient departments={[]} policies={[]} />;
  }
}
