interface LogoProps {
  height?: number;
  className?: string;
}

export function Logo({ height = 60, className = "" }: LogoProps) {
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ height: `${height}px` }}
    >
      <img
        src="/gbmx.png"
        alt="iMov Logo"
        className="h-full w-auto object-contain"
      />
    </div>
  );
}