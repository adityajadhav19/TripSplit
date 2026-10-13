export default function Header() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/75 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="/" className="text-xl font-extrabold tracking-tight text-slate-800 transition-transform hover:scale-105">
          trip<span className="text-emerald-600">split</span>
        </a>
        <span className="hidden rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 shadow-sm sm:block">
          For Friends & Travel
        </span>
      </div>
    </nav>
  );
}