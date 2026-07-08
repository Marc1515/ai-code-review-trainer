import { cn } from "@/shared/lib/utils";

interface BackgroundBeamsProps {
  className?: string;
}

const BEAM_PATHS = [
  "M-120 720 C 220 500, 320 160, 760 110 C 980 85, 1160 130, 1560 -80",
  "M-80 820 C 220 680, 380 310, 760 245 C 1030 198, 1210 240, 1510 70",
  "M-160 520 C 120 430, 320 315, 610 360 C 880 402, 1040 565, 1480 460",
  "M120 980 C 360 750, 410 470, 760 420 C 1010 384, 1200 470, 1540 300",
  "M420 960 C 520 735, 620 615, 850 560 C 1060 510, 1230 575, 1510 520",
] as const;

const HIGHLIGHT_DELAYS = ["0s", "-3.8s", "-7.4s", "-11.2s", "-15s"] as const;

export function BackgroundBeams({ className }: BackgroundBeamsProps) {
  return (
    <div
      aria-hidden="true"
      data-background-beams
      className={cn("pointer-events-none absolute inset-0 z-0 overflow-hidden", className)}
    >
      <div className="fixed inset-x-0 top-14 h-[min(780px,calc(100vh-3.5rem))] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_35%_20%,rgba(20,184,166,0.12),transparent_40%),radial-gradient(ellipse_at_75%_35%,rgba(14,165,233,0.1),transparent_42%),linear-gradient(to_bottom,rgba(250,250,250,0.35),rgba(250,250,250,0.78))] dark:bg-[radial-gradient(ellipse_at_35%_20%,rgba(20,184,166,0.18),transparent_42%),radial-gradient(ellipse_at_75%_35%,rgba(34,211,238,0.12),transparent_44%),linear-gradient(to_bottom,rgba(9,9,11,0.25),rgba(9,9,11,0.88))]" />

        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full"
        >
          <defs>
            <linearGradient id="background-beam-stroke" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--background-beam-start)" stopOpacity="0" />
              <stop offset="38%" stopColor="var(--background-beam-mid)" />
              <stop offset="72%" stopColor="var(--background-beam-end)" />
              <stop offset="100%" stopColor="var(--background-beam-end)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="background-beam-highlight" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--background-beam-hot)" stopOpacity="0" />
              <stop offset="45%" stopColor="var(--background-beam-hot)" />
              <stop offset="100%" stopColor="var(--background-beam-hot)" stopOpacity="0" />
            </linearGradient>
            <filter id="background-beam-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="10" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g fill="none">
            {BEAM_PATHS.map((path, index) => (
              <path
                key={`beam-glow-${path}`}
                d={path}
                stroke="url(#background-beam-stroke)"
                strokeWidth={index === 0 ? 2.5 : 1.8}
                strokeOpacity="var(--background-beam-glow-opacity)"
                filter="url(#background-beam-glow)"
              />
            ))}

            {BEAM_PATHS.map((path, index) => (
              <path
                key={`beam-base-${path}`}
                d={path}
                stroke="url(#background-beam-stroke)"
                strokeWidth={index === 0 ? 1.35 : 1}
                strokeOpacity="var(--background-beam-opacity)"
              />
            ))}

            {BEAM_PATHS.map((path, index) => (
              <path
                key={`beam-highlight-${path}`}
                d={path}
                className="background-beam-highlight"
                style={{ animationDelay: HIGHLIGHT_DELAYS[index] }}
                stroke="url(#background-beam-highlight)"
                strokeWidth={index === 0 ? 2.2 : 1.7}
                pathLength="1"
              />
            ))}
          </g>
        </svg>

        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-zinc-50 dark:to-zinc-950" />
      </div>

      <style>{`
        [data-background-beams] {
          --background-beam-start: rgba(15, 23, 42, 0.02);
          --background-beam-mid: rgba(13, 148, 136, 0.18);
          --background-beam-end: rgba(14, 165, 233, 0.12);
          --background-beam-hot: rgba(13, 148, 136, 0.32);
          --background-beam-opacity: 0.28;
          --background-beam-glow-opacity: 0.1;
        }

        .dark [data-background-beams] {
          --background-beam-start: rgba(20, 184, 166, 0.04);
          --background-beam-mid: rgba(20, 184, 166, 0.28);
          --background-beam-end: rgba(34, 211, 238, 0.2);
          --background-beam-hot: rgba(45, 212, 191, 0.5);
          --background-beam-opacity: 0.34;
          --background-beam-glow-opacity: 0.14;
        }

        .background-beam-highlight {
          stroke-dasharray: 0.08 0.92;
          stroke-dashoffset: 1;
          opacity: 0;
          animation: background-beam-flow 18s ease-in-out infinite;
        }

        @keyframes background-beam-flow {
          0% {
            stroke-dashoffset: 1;
            opacity: 0;
          }
          12% {
            opacity: 0.46;
          }
          48% {
            opacity: 0.18;
          }
          100% {
            stroke-dashoffset: -1;
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .background-beam-highlight {
            animation: none;
            stroke-dashoffset: 0.35;
            opacity: 0.18;
          }
        }
      `}</style>
    </div>
  );
}
