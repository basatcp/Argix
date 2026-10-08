/** A wide, faint diagonal band of light crossing the section once every `every` seconds. */
export function LightSweep({ every = 13, opacity = 0.05, angle = 18 }: { every?: number; opacity?: number; angle?: number }) {
  return (
    <div className="bg-layer absolute inset-0 overflow-hidden">
      <div
        className="bg-sweep absolute -inset-y-1/4 w-[38%]"
        style={{
          animationDuration: `${every}s`,
          background: `linear-gradient(90deg, transparent, rgba(125,211,252,${opacity}) 50%, transparent)`,
          transform: `translateX(-120%) skewX(-${angle}deg)`,
        }}
      />
    </div>
  );
}
