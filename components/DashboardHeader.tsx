import Link from "next/link";

type NavItem = {
  href: string;
  label: string;
  tone?: "primary" | "success" | "neutral";
};

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  meta?: string;
  navItems?: NavItem[];
};

const tones = {
  primary: "bg-blue-600 text-white shadow-[0_10px_24px_rgba(37,99,235,0.24)] hover:bg-blue-500",
  success:
    "border border-emerald-400/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15",
  neutral:
    "border border-white/10 bg-white/[0.045] text-slate-300 hover:bg-white/[0.08]",
};

export default function DashboardHeader({
  eyebrow,
  title,
  description,
  meta,
  navItems = [],
}: Props) {
  return (
    <section className="relative mb-3 overflow-hidden rounded-2xl border border-white/[0.09] bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.18),transparent_34%),linear-gradient(135deg,#101B2E_0%,#0B1424_100%)] shadow-[0_22px_64px_rgba(0,0,0,0.24)] sm:mb-5 sm:rounded-[20px]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/60 to-transparent" />
      <div className="flex flex-col gap-4 px-4 py-4 sm:gap-5 sm:px-5 sm:py-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <div className="flex min-w-0 items-start gap-4">
          <div className="hidden h-12 w-[142px] shrink-0 items-center rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 sm:flex">
            <img src="/brand/goknur-white.svg" alt="Göknur" className="h-auto w-full" />
          </div>
          <div className="min-w-0">
            <div className="inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-2.5 py-1 text-[9px] font-semibold tracking-[0.13em] text-blue-200 sm:px-3 sm:text-[10px] sm:tracking-[0.14em]">
              {eyebrow}
            </div>
            <h1 className="mt-2 text-[25px] font-semibold leading-tight tracking-[-0.04em] text-white sm:text-[28px] md:text-[32px]">
              {title}
            </h1>
            <p className="mt-1.5 max-w-2xl text-[12px] leading-5 text-slate-400 sm:text-sm sm:leading-6">
              {description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center lg:justify-end">
          {meta && (
            <div className="col-span-2 rounded-lg border border-white/10 bg-black/10 px-3 py-2 text-[11px] text-slate-400 sm:col-span-1 sm:rounded-xl sm:text-xs">
              {meta}
            </div>
          )}
          {navItems.map((item, index) => (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              className={`flex min-h-10 items-center justify-center rounded-lg px-3 py-2 text-center text-[12px] font-semibold transition duration-200 hover:-translate-y-0.5 sm:min-h-0 sm:rounded-xl sm:px-4 sm:text-sm ${
                navItems.length % 2 === 1 && index === navItems.length - 1 ? "col-span-2 sm:col-span-1" : ""
              } ${tones[item.tone ?? "neutral"]}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
