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
    <section className="relative mb-5 overflow-hidden rounded-[20px] border border-white/[0.09] bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.18),transparent_34%),linear-gradient(135deg,#101B2E_0%,#0B1424_100%)] shadow-[0_22px_64px_rgba(0,0,0,0.24)]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/60 to-transparent" />
      <div className="flex flex-col gap-5 px-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <div className="flex min-w-0 items-start gap-4">
          <div className="hidden h-12 w-[142px] shrink-0 items-center rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 sm:flex">
            <img src="/brand/goknur-white.svg" alt="Göknur" className="h-auto w-full" />
          </div>
          <div className="min-w-0">
            <div className="inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-[10px] font-semibold tracking-[0.14em] text-blue-200">
              {eyebrow}
            </div>
            <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-white md:text-[32px]">
              {title}
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-400">
              {description}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
          {meta && (
            <div className="rounded-xl border border-white/10 bg-black/10 px-3 py-2 text-xs text-slate-400">
              {meta}
            </div>
          )}
          {navItems.map((item) => (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 ${
                tones[item.tone ?? "neutral"]
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
