import { DueState, ProgressStatus } from '@homework-tracker/shared-types';

/** Difference in whole days between due date and "today" (due - today). */
export function daysUntil(due: string, today: Date = new Date()): number {
  const d = new Date(due + 'T00:00:00');
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((d.getTime() - t.getTime()) / 86_400_000);
}

/**
 * Notification state (US-012):
 * - submitted → none
 * - today > due → overdue
 * - today == due → due_today
 * - within 2 days before due → near
 * - otherwise → none
 */
export function computeDueState(
  dueDate: string,
  status: ProgressStatus,
  today: Date = new Date(),
): DueState {
  if (status === ProgressStatus.Submitted) return DueState.None;
  const diff = daysUntil(dueDate, today);
  if (diff < 0) return DueState.Overdue;
  if (diff === 0) return DueState.DueToday;
  if (diff <= 2) return DueState.Near;
  return DueState.None;
}

export const STATUS_LABEL: Record<ProgressStatus, string> = {
  not_started: 'Not started',
  done: 'Done',
  submitted: 'Submitted',
};

/** Cycle Not started → Done → Submitted → Not started. */
export function nextStatus(s: ProgressStatus): ProgressStatus {
  if (s === ProgressStatus.NotStarted) return ProgressStatus.Done;
  if (s === ProgressStatus.Done) return ProgressStatus.Submitted;
  return ProgressStatus.NotStarted;
}

/** Format ISO date string as "3 Jul" for display. */
function fmtDate(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/** Human due label — always shows real date/month for easy reading. */
export function dueLabel(
  dueDate: string,
  state: DueState,
  _locale: 'en' | 'th' = 'en',
  today: Date = new Date(),
): string {
  const diff = daysUntil(dueDate, today);
  const dateStr = fmtDate(dueDate);

  if (state === DueState.Overdue) {
    const n = Math.abs(diff);
    return `Overdue ${n}d · ${dateStr}`;
  }
  if (state === DueState.DueToday) return `Due today · ${dateStr}`;
  if (state === DueState.Near) return `${dateStr} (${diff}d left)`;
  return `Due ${dateStr}`;
}
