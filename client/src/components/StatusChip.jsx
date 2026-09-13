const LEVEL_CLASSES = {
  good: 'bg-good-tint text-good',
  warn: 'bg-warn-tint text-warn',
  bad: 'bg-bad-tint text-bad',
  neutral: 'bg-line text-ink-muted',
};

export function StatusChip({ level, text, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${LEVEL_CLASSES[level]} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
      {text}
    </span>
  );
}
