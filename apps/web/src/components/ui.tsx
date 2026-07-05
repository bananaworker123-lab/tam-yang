import type { ReactNode } from 'react';
import { DueState, ProgressStatus } from '@homework-tracker/shared-types';
import { subjectColor, subjectShort } from '../lib/subjects';
import { useT } from '../i18n';

/** Pulsing placeholder bar for skeleton loading states. */
export function SkeletonLine({ className = '' }: { className?: string }) {
  return <div className={`h-4 bg-line rounded animate-pulse ${className}`} />;
}

/** Full-card skeleton that mimics a homework/assignment row. */
export function SkeletonCard() {
  return (
    <div className="bg-white border border-line rounded-[18px] px-4 py-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-line flex-none" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 bg-line rounded w-3/4" />
          <div className="h-3 bg-line rounded w-1/2" />
          <div className="h-7 w-24 bg-line rounded-full mt-2" />
        </div>
      </div>
    </div>
  );
}

/** Generic spinner, used inline (not full-page block). */
export function Spinner({ size = 6 }: { size?: number }) {
  return (
    <div
      className={`w-${size} h-${size} rounded-full border-2 border-accent border-t-transparent animate-spin flex-none`}
    />
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`bg-white border border-line rounded-[18px] p-4 shadow-[0_1px_2px_rgba(28,27,41,.04)] ${className}`}
    >
      {children}
    </div>
  );
}

/** Colored square badge with subject initials (design prototype style). */
export function SubjectBadge({ subject, size = 'md' }: { subject: string; size?: 'md' | 'lg' }) {
  const c = subjectColor(subject);
  const dim = size === 'lg' ? 'w-12 h-12 text-base rounded-2xl' : 'w-11 h-11 text-sm rounded-xl';
  return (
    <span
      className={`inline-flex items-center justify-center font-display font-extrabold flex-none ${dim}`}
      style={{ background: c.bg, color: c.fg }}
    >
      {subjectShort(subject)}
    </span>
  );
}

/** Due chip with calendar icon, colored by due state. */
export function DueChip({ label, due }: { label: string; due: DueState }) {
  const map: Record<string, string> = {
    none: 'bg-bg text-muted',
    near: 'bg-status-done/20 text-[#8A5D0E]',
    due_today: 'bg-[#EBA53A] text-white',
    overdue: 'bg-status-overdue/12 text-status-overdue',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-xs font-bold whitespace-nowrap ${map[due] ?? map.none}`}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4.5" width="18" height="17" rx="2.5" /><path d="M3 9h18M8 2.5v4M16 2.5v4" /></svg>
      {label}
    </span>
  );
}

export function Avatar({ initials, className = '' }: { initials: string; className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center w-9 h-9 rounded-full bg-accent-soft text-accent-ink font-bold text-xs flex-none ${className}`}
    >
      {initials}
    </span>
  );
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  className = '',
  type = 'button',
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void | Promise<void>;
  variant?: 'primary' | 'ghost' | 'danger';
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}) {
  const styles: Record<string, string> = {
    primary: 'bg-accent text-white hover:opacity-90 shadow-sm',
    ghost: 'bg-white border border-line text-muted hover:text-ink',
    danger: 'bg-white border border-line text-status-overdue hover:bg-red-50',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`h-11 px-4 rounded-xl font-semibold text-sm transition active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

const STATUS_PILL: Record<ProgressStatus, string> = {
  not_started: 'bg-status-notstarted/30 text-ink',
  working_on:  'bg-[#7EC8E3]/20 text-[#1A6B8A]',
  done: 'bg-status-done/20 text-[#9A6B12]',
  submitted: 'bg-status-submitted/15 text-[#1F7D52]',
};

export function StatusPill({
  status,
  dueState,
  onClick,
  disabled,
}: {
  status: ProgressStatus;
  dueState?: DueState;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const { t } = useT();
  const dot: Record<ProgressStatus, string> = {
    not_started: 'bg-status-notstarted',
    working_on:  'bg-[#7EC8E3]',
    done: 'bg-status-done',
    submitted: 'bg-status-submitted',
  };
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-2 h-8 px-3 rounded-full text-xs font-bold transition active:scale-95 disabled:opacity-100 disabled:cursor-default ${STATUS_PILL[status]}`}
    >
      <span className={`w-2 h-2 rounded-full ${dot[status]}`} />
      {t(`status.${status}`)}
      {dueState && dueState !== 'none' && status !== 'submitted' ? (
        <DueBadge due={dueState} />
      ) : null}
    </button>
  );
}

export function DueBadge({ due }: { due: DueState }) {  if (due === DueState.None) return null;
  const map: Record<string, { label: string; cls: string }> = {
    near: { label: 'Due soon', cls: 'bg-status-done/30 text-[#8A5D0E]' },
    due_today: { label: 'Due today', cls: 'bg-[#EBA53A] text-white' },
    overdue: { label: 'Overdue', cls: 'bg-status-overdue text-white' },
  };
  const m = map[due];
  if (!m) return null;
  return <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${m.cls}`}>{m.label}</span>;
}

export function StatusBanner({
  kind,
  children,
}: {
  kind: 'info' | 'error' | 'loading';
  children: ReactNode;
}) {
  const cls =
    kind === 'error'
      ? 'bg-red-50 text-status-overdue border-red-100'
      : kind === 'loading'
        ? 'bg-accent-soft text-accent-ink border-transparent'
        : 'bg-accent-soft text-accent-ink border-transparent';
  return <div className={`rounded-2xl border px-4 py-3 text-sm ${cls}`}>{children}</div>;
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="text-center py-12 px-6">
      <div className="text-faint font-semibold">{title}</div>
      {hint ? <div className="text-faint text-sm mt-1">{hint}</div> : null}
    </div>
  );
}

export function PageHeader({
  kicker,
  title,
  sub,
}: {
  kicker?: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="mb-4">
      {kicker ? (
        <div className="text-[11px] font-extrabold tracking-widest text-accent uppercase">
          {kicker}
        </div>
      ) : null}
      <h1 className="font-display font-bold text-2xl text-ink leading-tight">{title}</h1>
      {sub ? <div className="text-muted text-sm mt-1">{sub}</div> : null}
    </div>
  );
}

const SEG_ACTIVE: Record<ProgressStatus, string> = {
  not_started: 'bg-status-notstarted/40 text-ink',
  working_on:  'bg-[#38BDF8]/20 text-[#0369A1]',
  done: 'bg-status-done/25 text-[#8A5D0E]',
  submitted: 'bg-status-submitted/20 text-[#1F7D52]',
};
const SEG_DOT: Record<ProgressStatus, string> = {
  not_started: 'bg-status-notstarted',
  working_on:  'bg-[#38BDF8]',
  done: 'bg-status-done',
  submitted: 'bg-status-submitted',
};

/** 4-segment status selector: Not started / Working on / Done / Submitted. */
export function StatusSegment({
  value,
  onChange,
  disabled,
}: {
  value: ProgressStatus;
  onChange?: (s: ProgressStatus) => void;
  disabled?: boolean;
}) {
  const options: ProgressStatus[] = [
    ProgressStatus.NotStarted,
    ProgressStatus.WorkingOn,
    ProgressStatus.Done,
    ProgressStatus.Submitted,
  ];
  const { t } = useT();
  return (
    <div className="flex gap-2">
      {options.map((s) => {
        const active = s === value;
        return (
          <button
            key={s}
            type="button"
            disabled={disabled}
            onClick={() => onChange?.(s)}
            className={`flex-1 flex items-center justify-center h-10 rounded-xl text-xs font-bold transition active:scale-[.98] disabled:opacity-100 ${
              active ? SEG_ACTIVE[s] : 'bg-bg text-faint'
            }`}
          >
            {t(`status.${s}`)}
          </button>
        );
      })}
    </div>
  );
}
