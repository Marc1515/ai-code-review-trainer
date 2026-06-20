import { cn } from "@/shared/lib/utils";

interface AnimatedDotBackgroundProps {
  className?: string;
}

export function AnimatedDotBackground({ className }: AnimatedDotBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={{
        maskImage: "radial-gradient(ellipse 75% 85% at 50% 55%, black 40%, transparent 95%)",
        WebkitMaskImage: "radial-gradient(ellipse 75% 85% at 50% 55%, black 40%, transparent 95%)",
      }}
    >
      {/* Primary dot grid — slow forward drift, data-stream feel */}
      <div
        className="animate-dot-drift absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, var(--dot-primary) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />
      {/* Accent dot grid — counter-drift, creates parallax depth */}
      <div
        className="animate-dot-reverse absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, var(--dot-secondary) 1.5px, transparent 1.5px)",
          backgroundSize: "52px 52px",
        }}
      />
      {/* Ambient glow — slow orbital shift anchored at headline region */}
      <div
        className="animate-dot-glow absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 65% at 35% 50%, var(--dot-glow) 0%, transparent 75%)",
          transformOrigin: "35% 50%",
        }}
      />
    </div>
  );
}
