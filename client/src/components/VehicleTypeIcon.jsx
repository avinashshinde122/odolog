const PATHS = {
  scooter: (
    <>
      <circle cx="6" cy="18" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="18" cy="18" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M6 18h5l1.5-5H16m-4.5 5L14 8h3.5M8 8h3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  bike: (
    <>
      <circle cx="5.5" cy="17" r="3" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="18.5" cy="17" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M5.5 17 10 9h5l3.5 8M10 9 8 6h3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  car: (
    <>
      <path
        d="M4 16V12l2-4.5A2 2 0 0 1 7.8 6.5h8.4A2 2 0 0 1 18 7.5L20 12v4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <rect x="3" y="16" width="18" height="3.2" rx="1.2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="7.5" cy="19.2" r="1.3" fill="currentColor" />
      <circle cx="16.5" cy="19.2" r="1.3" fill="currentColor" />
    </>
  ),
};

export function VehicleTypeIcon({ type, className = 'w-9 h-9' }) {
  return (
    <span className={`${className} rounded-xl bg-accent-tint text-accent-ink flex items-center justify-center shrink-0`}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        {PATHS[type] || PATHS.scooter}
      </svg>
    </span>
  );
}
