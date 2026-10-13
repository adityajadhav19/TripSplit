import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TripActionCard from "@/components/TripActionCard";

export default function Home() {
  return (

    <main className="relative flex min-h-screen flex-col overflow-x-hidden bg-slate-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-slate-50 to-slate-100 font-sans text-slate-900 selection:bg-emerald-200">
      
      {/* Inline styles for custom floating animations */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(var(--rotation)); }
          50% { transform: translateY(-15px) rotate(var(--rotation)); }
          100% { transform: translateY(0px) rotate(var(--rotation)); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .delay-1 { animation-delay: -1s; }
        .delay-2 { animation-delay: -2.5s; }
        .delay-3 { animation-delay: -4s; }
        .delay-4 { animation-delay: -1.5s; }
      `}</style>

      {/* Decorative Background Stickers */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div 
          className="animate-float absolute -left-4 top-32 flex size-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 sm:left-12 lg:left-24"
          style={{ "--rotation": "-12deg" } as React.CSSProperties}
          aria-hidden="true"
        >
          ✈️
        </div>
        <div 
          className="animate-float delay-1 absolute -right-6 top-48 flex size-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 sm:right-16 lg:right-32"
          style={{ "--rotation": "15deg" } as React.CSSProperties}
          aria-hidden="true"
        >
          🍕
        </div>
        <div 
          className="animate-float delay-2 absolute bottom-40 left-1/4 hidden size-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 md:flex"
          style={{ "--rotation": "-8deg" } as React.CSSProperties}
          aria-hidden="true"
        >
          💸
        </div>
        <div 
          className="animate-float delay-3 absolute bottom-32 right-12 hidden size-20 items-center justify-center rounded-3xl bg-white text-4xl shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 md:flex lg:right-24"
          style={{ "--rotation": "10deg" } as React.CSSProperties}
          aria-hidden="true"
        >
          🗺️
        </div>
        <div 
          className="animate-float delay-4 absolute bottom-64 right-1/3 hidden size-12 items-center justify-center rounded-xl bg-white text-xl shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 lg:flex"
          style={{ "--rotation": "-18deg" } as React.CSSProperties}
          aria-hidden="true"
        >
          🌴
        </div>
      </div>

      {/* Modular Navigation */}
      <Header />

      {/* Hero & Main Content */}
      <section className="relative z-10 mx-auto grid max-w-6xl flex-grow items-center gap-12 px-6 pb-24 pt-16 md:grid-cols-[1.1fr_0.9fr] md:gap-16 lg:pt-24">
        
        {/* Left Column: Copy & Value Prop */}
        <div className="flex flex-col justify-center">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm backdrop-blur-sm">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
            </span>
            Less calculating, more travelling
          </div>

          <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-6xl lg:text-[4rem]">
            Great trips. <br />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Zero money drama.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-600">
            Track what everyone spends, split expenses fairly among the people involved, and settle up smoothly when the vacation ends.
          </p>

          <div className="mt-10 flex flex-wrap gap-3 text-sm font-medium text-slate-700">
            <div className="flex items-center gap-2 rounded-lg bg-white/80 px-4 py-2.5 shadow-sm ring-1 ring-slate-200 backdrop-blur-sm">
              <span className="text-emerald-500">✓</span> No individual apps
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-white/80 px-4 py-2.5 shadow-sm ring-1 ring-slate-200 backdrop-blur-sm">
              <span className="text-emerald-500">✓</span> Flexible splits
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-white/80 px-4 py-2.5 shadow-sm ring-1 ring-slate-200 backdrop-blur-sm">
              <span className="text-emerald-500">✓</span> Private groups
            </div>
          </div>
        </div>

        {/* Modular Interactive Card Component */}
        <TripActionCard />
        
      </section>

      {/* Modular Footer */}
      <Footer />
      
    </main>
  );
}