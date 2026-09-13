import { daysBetween, formatDate } from './format.js';

// Derives a due-for-service badge from a vehicle's most recent log.
// level is one of: 'neutral' (nothing logged / no reminder set),
// 'good' (on track), 'warn' (due soon), 'bad' (overdue).
export function dueStatus(latestLog, today = new Date()) {
  if (!latestLog) return { level: 'neutral', text: 'No service logged yet' };

  const kmLeft = latestLog.nextKm != null ? latestLog.nextKm - latestLog.km : null;
  const daysLeft = latestLog.nextDate ? daysBetween(today, new Date(latestLog.nextDate)) : null;

  if ((kmLeft != null && kmLeft <= 0) || (daysLeft != null && daysLeft <= 0)) {
    return { level: 'bad', text: 'Overdue for service' };
  }

  if ((kmLeft != null && kmLeft <= 1000) || (daysLeft != null && daysLeft <= 30)) {
    const bits = [];
    if (kmLeft != null) bits.push(`${kmLeft.toLocaleString('en-IN')} km`);
    if (latestLog.nextDate) bits.push(`by ${formatDate(latestLog.nextDate)}`);
    return { level: 'warn', text: `Due soon — ${bits.join(' or ')}` };
  }

  if (kmLeft == null && daysLeft == null) {
    return { level: 'neutral', text: 'No reminder set' };
  }

  const bits = [];
  if (kmLeft != null) bits.push(`~${kmLeft.toLocaleString('en-IN')} km`);
  if (latestLog.nextDate) bits.push(`by ${formatDate(latestLog.nextDate)}`);
  return { level: 'good', text: `On track — next service in ${bits.join(' or ')}` };
}
