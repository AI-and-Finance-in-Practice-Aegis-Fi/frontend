import { Footer } from "./Footer";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

type DashboardShellProps = {
  activeHref: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

export function DashboardShell({
  activeHref,
  title,
  description,
  children,
}: DashboardShellProps) {
  return (
    <main className="min-h-screen bg-[#050608] text-[#f8f8df]">
      <div className="mx-auto grid min-h-screen w-full max-w-[1440px] lg:grid-cols-[280px_minmax(0,1fr)]">
        <Sidebar activeHref={activeHref} />
        <section className="bg-[#070a10]">
          <div className="px-5 py-6 sm:px-8 lg:px-10">
            <Topbar title={title} description={description} />
            {children}
          </div>
          <Footer />
        </section>
      </div>
    </main>
  );
}
