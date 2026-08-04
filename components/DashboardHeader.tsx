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
  primary: "bg-blue-600 text-white hover:bg-blue-500",
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
    <section className="mb-5 overflow-hidden rounded-[20px] border border-white/[0.09] bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.17),transparent_36%),linear-gradient(135deg,#101B2E_0%,#0B1424_100%)] shadow-[0_18px_50px_rgba(0,0,0,0.2)]">
      <div className="flex flex-col gap-5 px-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
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
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
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
