export function formatMoney(amount) {
  return `₹ ${Number(amount || 0).toLocaleString('en-IN')}`;
}

export function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function daysBetween(a, b) {
  return Math.round((b - a) / 86400000);
}

// Vehicle type -> plate string, e.g. "MH12AH4521" -> "MH 12 AH4521"
export function formatPlate(plate) {
  const clean = (plate || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  return `${clean.slice(0, 2)} ${clean.slice(2, 4)} ${clean.slice(4)}`.trim();
}
