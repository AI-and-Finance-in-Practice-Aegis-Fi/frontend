const productLinks = ["Features", "Analytics", "AI Insights", "Pricing"];
const companyLinks = ["About", "Contact", "Security", "Careers"];

export function Footer() {
  return (
    <footer className="mt-8 border-t border-white/[0.08] bg-[#050608] px-5 py-10 sm:px-8 lg:px-10">
      <div className="grid gap-10 lg:grid-cols-[1fr_0.6fr]">
        <div>
          <h2 className="text-2xl font-black tracking-[0.08em] text-[#fbfbdc]">Aegis-Fi</h2>
          <p className="mt-6 max-w-md text-sm leading-7 text-zinc-500">
            AI-powered financial operations platform
            <br />
            for modern enterprise teams.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <h3 className="text-xs font-bold text-[#fbfbdc]">Product</h3>
            <div className="mt-4 grid gap-2 text-sm text-zinc-500">
              {productLinks.map((item) => (
                <a key={item} href="#" className="hover:text-[#fbfbdc]">
                  {item}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#fbfbdc]">Company</h3>
            <div className="mt-4 grid gap-2 text-sm text-zinc-500">
              {companyLinks.map((item) => (
                <a key={item} href="#" className="hover:text-[#fbfbdc]">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 border-t border-white/20 pt-4">
        <p className="text-xs text-zinc-600">© 2026 Aegis-Fi. All rights reserved.</p>
      </div>
    </footer>
  );
}
