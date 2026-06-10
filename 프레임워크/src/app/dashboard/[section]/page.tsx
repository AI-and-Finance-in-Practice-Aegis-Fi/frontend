import { DashboardShowcase } from "@/components/DashboardShowcase";

const sectionHrefMap: Record<string, string> = {
  analytics: "/dashboard/analytics",
  policies: "/dashboard/policies",
  expenses: "/dashboard/expenses",
  insights: "/dashboard/insights",
  settings: "/dashboard/settings",
};

type DashboardSectionPageProps = {
  params: Promise<{
    section: string;
  }>;
};

export default async function DashboardSectionPage({
  params,
}: DashboardSectionPageProps) {
  const { section } = await params;

  return (
    <DashboardShowcase activeHref={sectionHrefMap[section] ?? "/dashboard"} />
  );
}
