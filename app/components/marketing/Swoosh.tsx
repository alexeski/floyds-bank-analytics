/** Large decorative curves used behind dark green hero sections. */
export default function Swoosh({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1200 600"
      preserveAspectRatio="xMidYMid slice"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    >
      <path
        d="M620 600C700 380 900 180 1200 120V600Z"
        className="fill-brand-800"
      />
      <path
        d="M820 600C880 450 1020 330 1200 290V600Z"
        className="fill-brand-700"
      />
      <path
        d="M560 600C660 330 900 110 1200 40"
        fill="none"
        className="stroke-brand-500"
        strokeWidth="3"
      />
    </svg>
  );
}
