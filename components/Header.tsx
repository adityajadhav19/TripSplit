export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/70 bg-[#f7f7f4]/90 backdrop-blur-xl">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6"
      >
        <a
          href="/"
          aria-label="TripSplit home"
          className="shrink-0 text-xl font-extrabold tracking-tight text-zinc-900 transition-colors duration-200 hover:text-emerald-800 sm:text-2xl"
        >
          trip<span className="text-emerald-700">split</span>
        </a>

        <span className="rounded-full border border-emerald-100 bg-emerald-50/80 px-2.5 py-1.5 text-center text-[9px] font-semibold uppercase tracking-wider text-emerald-800 sm:px-4 sm:text-xs">
          For Friends &amp; Travel
        </span>
      </nav>
    </header>
  );
}