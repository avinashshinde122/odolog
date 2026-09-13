import { useNavigate } from 'react-router-dom';

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function Header({ title, back, right }) {
  const navigate = useNavigate();
  return (
    <header className="flex items-center gap-2.5 px-4 py-3 bg-surface border-b border-line sticky top-0 z-10">
      {back ? (
        <button
          type="button"
          onClick={() => navigate(typeof back === 'string' ? back : -1)}
          className="p-1 text-ink"
          aria-label="Back"
        >
          <BackIcon />
        </button>
      ) : (
        <span className="w-6" />
      )}
      <h1 className="flex-1 font-display font-bold text-xl truncate">{title}</h1>
      {right || <span className="w-8" />}
    </header>
  );
}
