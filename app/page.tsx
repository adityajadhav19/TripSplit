import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TripActionCard from "@/components/TripActionCard";

const contourPaths = [
  "M-100 120 C 40 40, 100 220, 250 140 S 440 40, 560 150 S 750 240, 900 130",
  "M-100 145 C 40 65, 100 245, 250 165 S 440 65, 560 175 S 750 265, 900 155",
  "M-100 170 C 40 90, 100 270, 250 190 S 440 90, 560 200 S 750 290, 900 180",
  "M-100 195 C 40 115, 100 295, 250 215 S 440 115, 560 225 S 750 315, 900 205",
  "M-100 220 C 40 140, 100 320, 250 240 S 440 140, 560 250 S 750 340, 900 230",
];

function TravelBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {/* Soft ambient color */}
      <div className="absolute -left-48 top-44 size-[28rem] rounded-full bg-emerald-200/20 blur-[100px]" />
      <div className="absolute -right-48 top-[28rem] size-[30rem] rounded-full bg-teal-200/20 blur-[110px]" />
      <div className="absolute bottom-0 left-1/3 size-80 rounded-full bg-lime-100/20 blur-[100px]" />

      {/* Topographic contours */}
      <svg
        viewBox="0 0 1440 1100"
        preserveAspectRatio="xMidYMin slice"
        className="absolute inset-0 h-full w-full opacity-25 sm:opacity-40 lg:opacity-60"
        fill="none"
      >
        <g stroke="#A7BFAF" strokeWidth="0.8" opacity="0.45">
          {contourPaths.map((path, index) => (
            <path
              key={`left-${index}`}
              d={path}
              transform={`translate(-180 ${index * 22 + 80}) scale(1.2 1.2)`}
            />
          ))}

          {contourPaths.map((path, index) => (
            <path
              key={`right-${index}`}
              d={path}
              transform={`translate(800 ${index * 24 + 250}) scale(0.95 1.2)`}
            />
          ))}

          {contourPaths.slice(0, 3).map((path, index) => (
            <path
              key={`bottom-${index}`}
              d={path}
              transform={`translate(150 ${index * 24 + 780}) scale(1.3 0.85)`}
            />
          ))}
        </g>

        {/* Curved route connecting trip stops */}
        <g
          stroke="#059669"
          strokeWidth="1.4"
          strokeDasharray="5 9"
          strokeLinecap="round"
          opacity="0.48"
        >
          <path d="M-40 570 C 100 480, 145 720, 280 650 S 470 540, 590 650" />
          <path d="M850 260 C 1000 170, 1060 340, 1190 270 S 1350 180, 1490 300" />
          <path d="M-50 930 C 120 850, 170 1030, 330 960 S 530 900, 650 1030" />
        </g>

        {/* Route stops */}
        <g fill="#059669" opacity="0.75">
          <circle cx="105" cy="522" r="4" />
          <circle cx="280" cy="650" r="4" />
          <circle cx="590" cy="650" r="4" />
          <circle cx="850" cy="260" r="4" />
          <circle cx="1190" cy="270" r="4" />
          <circle cx="1400" cy="230" r="4" />
          <circle cx="330" cy="960" r="4" />
          <circle cx="650" cy="1030" r="4" />
        </g>
      </svg>

      {/* Subtle decorative geography */}
      <div className="absolute -left-20 top-[38%] hidden size-64 rounded-full border border-emerald-700/[0.07] md:block" />
      <div className="absolute -left-12 top-[39%] hidden size-48 rounded-full border border-emerald-700/[0.08] md:block" />
      <div className="absolute -left-4 top-[40%] hidden size-32 rounded-full border border-emerald-700/[0.09] md:block" />

      <div className="absolute -right-20 top-[16%] hidden size-72 rounded-full border border-emerald-700/[0.07] md:block" />
      <div className="absolute -right-12 top-[18%] hidden size-56 rounded-full border border-emerald-700/[0.08] md:block" />

      {/* Floating expense card: dining */}
      <div className="absolute left-5 top-44 hidden -rotate-6 items-center gap-3 rounded-2xl border border-white/80 bg-white/90 p-3.5 shadow-lg shadow-emerald-950/[0.06] backdrop-blur-sm transition-transform duration-500 hover:-translate-y-1 hover:rotate-0 lg:flex xl:left-[7%]">
        <div className="flex size-11 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
          <svg viewBox="0 0 24 24" className="size-5" fill="none">
            <path
              d="M7 3v7M4 3v4a3 3 0 0 0 6 0V3M7 10v11M16 3v18M16 3c3 3 4 7 0 10"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <p className="text-[10px] font-medium text-zinc-500">Dinner</p>
          <p className="text-sm font-bold text-zinc-800">Shared expense</p>
          <p className="mt-0.5 text-[10px] text-emerald-700">Split with friends</p>
        </div>
      </div>

      {/* Floating expense card: accommodation */}
      <div className="absolute right-5 top-40 hidden rotate-6 items-center gap-3 rounded-2xl border border-white/80 bg-white/90 p-3.5 shadow-lg shadow-emerald-950/[0.06] backdrop-blur-sm transition-transform duration-500 hover:-translate-y-1 hover:rotate-0 lg:flex xl:right-[7%]">
        <div className="flex size-11 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
          <svg viewBox="0 0 24 24" className="size-5" fill="none">
            <path
              d="M3 19V6m0 10h18v3M3 10h7a4 4 0 0 1 4 4v2m0-4h4a3 3 0 0 1 3 3v1M7 10V7h3v3"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <p className="text-[10px] font-medium text-zinc-500">Stay together</p>
          <p className="text-sm font-bold text-zinc-800">Shared costs</p>
          <p className="mt-0.5 text-[10px] text-emerald-700">Everyone accounted for</p>
        </div>
      </div>

      {/* Floating settlement card */}
      <div className="absolute bottom-32 left-[5%] hidden -rotate-3 items-center gap-3 rounded-2xl border border-white/80 bg-white/90 p-3.5 shadow-lg shadow-emerald-950/[0.06] backdrop-blur-sm transition-transform duration-500 hover:-translate-y-1 hover:rotate-0 lg:flex">
        <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          <svg viewBox="0 0 24 24" className="size-5" fill="none">
            <path
              d="m5 12 4 4L19 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <p className="text-[10px] font-medium text-zinc-500">Trip settlement</p>
          <p className="text-sm font-bold text-zinc-800">All balanced</p>
        </div>
      </div>

      {/* Small map marker */}
      <div className="absolute bottom-36 right-[8%] hidden items-center justify-center lg:flex">
        <div className="flex size-12 items-center justify-center rounded-2xl border border-emerald-100 bg-white/80 text-emerald-700 shadow-lg shadow-emerald-950/[0.05]">
          <svg viewBox="0 0 24 24" className="size-6" fill="none">
            <path
              d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.7" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-x-clip bg-[#f7f7f4] font-sans text-zinc-900 selection:bg-emerald-200">
      <style>{`
        @keyframes gentle-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        @media (prefers-reduced-motion: no-preference) {
          .gentle-float {
            animation: gentle-float 7s ease-in-out infinite;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            scroll-behavior: auto !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <TravelBackground />

      <div className="relative z-10">
        <Header />
      </div>

      {/* Hero */}
      <section className="relative z-10 mx-auto grid w-full max-w-6xl flex-grow grid-cols-1 items-center gap-8 px-4 pb-10 pt-10 sm:gap-10 sm:px-6 sm:pb-16 sm:pt-14 lg:grid-cols-[1.05fr_0.95fr] md:gap-10 lg:gap-16 lg:pb-24 lg:pt-20">
        <div className="flex min-w-0 flex-col justify-center">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/90 px-4 py-2 text-sm font-semibold text-emerald-800 shadow-sm backdrop-blur-sm">
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-emerald-600"
            />
            Less calculating, more travelling
          </div>

          <h1 className="text-[2.5rem] font-extrabold leading-[1.08] tracking-tight text-zinc-900 min-[420px]:text-5xl sm:text-6xl lg:text-[4rem]">
            Great trips.
            <br />
            <span className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Zero money drama.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-7 text-zinc-600 sm:text-lg sm:leading-relaxed">
            Track what everyone spends, split expenses fairly among the people
            involved, and settle up smoothly when the vacation ends.
          </p>

          <div className="mt-7 flex flex-wrap gap-2.5 text-xs font-medium text-zinc-700 sm:mt-10 sm:gap-3 sm:text-sm">
            {[
              "No individual apps",
              "Flexible splits",
              "Private groups",
            ].map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2 rounded-xl border border-zinc-200/80 bg-white/85 px-4 py-2.5 shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/80 hover:shadow-md"
              >
                <span
                  className="font-bold text-emerald-700"
                  aria-hidden="true"
                >
                  ✓
                </span>
                {feature}
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-w-0">
          <TripActionCard />
        </div>
      </section>

      <div className="relative z-10">
        <Footer />
      </div>
    </main>
  );
}