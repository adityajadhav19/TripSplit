
const CREATOR_NAME = "Aditya Jadhav";
const CREATOR_URL = "https://github.com/adityajadhav19";

export default function Footer() {
  return (
    <footer className="relative z-10 mt-auto border-t border-zinc-200/70 bg-white/60 px-4 py-8 backdrop-blur-sm sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
          {/* Brand and tagline */}
          <div>
            <a
              href="/"
              className="text-lg font-extrabold tracking-tight text-zinc-900"
            >
              trip<span className="text-emerald-700">split</span>
            </a>
            <p className="mt-1 text-sm text-zinc-500">
              Spend together. Settle fairly.
            </p>
          </div>

          {/* Creator credit and support */}
          <div className="flex flex-col items-center gap-3 sm:items-end">
            <p className="text-sm text-zinc-500">
              Made with care by{" "}
              <a
                href={CREATOR_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-zinc-800 underline decoration-emerald-400 underline-offset-4 transition-colors hover:text-emerald-700"
              >
                {CREATOR_NAME}
              </a>
            </p>

            <a
              href={CREATOR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-zinc-800 transition-colors hover:text-emerald-700"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-4"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 .75a11.25 11.25 0 0 0-3.56 21.92c.56.1.77-.24.77-.54v-2.1c-3.14.68-3.8-1.33-3.8-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.73 1.16 1.73 1.16 1 .1.76 2.12 3.15 1.58.1-.73.39-1.23.7-1.52-2.51-.29-5.15-1.26-5.15-5.6 0-1.24.44-2.25 1.16-3.04-.12-.29-.5-1.44.11-3 0 0 .95-.3 3.1 1.16a10.8 10.8 0 0 1 5.64 0c2.15-1.46 3.1-1.16 3.1-1.16.61 1.56.23 2.71.11 3 .72.79 1.16 1.8 1.16 3.04 0 4.35-2.65 5.3-5.17 5.59.41.36.77 1.04.77 2.1v3.12c0 .3.2.65.78.54A11.25 11.25 0 0 0 12 .75Z"
                />
              </svg>
              {CREATOR_NAME}
            </a>
          </div>
        </div>

        <div className="my-6 border-t border-zinc-200/70" />

        <div className="flex flex-col items-center justify-between gap-2 text-xs text-zinc-400 sm:flex-row">
          <p>
            &copy; 2026 TripSplit. All rights reserved.
          </p>
          <p>Made for better trips and happier groups.</p>
        </div>
      </div>
    </footer>
  );
}