export default function Symbols({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 210 55"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      aria-hidden="true"
    >
      <circle cx="27" cy="27.5" r="22" />
      <path d="M105 5 130 49H80Z" />
      <path d="M160 6H204V49H160Z" />
    </svg>
  );
}
