import { cn } from "@/shared/lib/utils";

interface AnimatedDotBackgroundProps {
  className?: string;
}

export function AnimatedDotBackground({ className }: AnimatedDotBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {/* Primary dot grid — slow diagonal drift */}
      <div
        className="animate-dot-drift absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, var(--dot-primary) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          maskImage: "radial-gradient(ellipse 90% 80% at 35% 55%, black 30%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 80% at 35% 55%, black 30%, transparent 85%)",
        }}
      />
      {/* Secondary accent grid — larger spacing, gentle pulse */}
      <div
        className="animate-dot-pulse absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, var(--dot-secondary) 1.5px, transparent 1.5px)",
          backgroundSize: "52px 52px",
          maskImage: "radial-gradient(ellipse 65% 60% at 30% 50%, black 15%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 65% 60% at 30% 50%, black 15%, transparent 75%)",
        }}
      />
      {/* Ambient glow — brand accent emanating from the headline area */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 65% at 30% 50%, var(--dot-glow) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
