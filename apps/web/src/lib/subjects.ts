// Per-subject color + short label for subject badges (design prototype style)

const PALETTE: { bg: string; fg: string }[] = [
  { bg: '#ECEBFD', fg: '#463FBF' }, // indigo
  { bg: '#E7F4EE', fg: '#1F7D52' }, // green
  { bg: '#FDF0E1', fg: '#9A6B12' }, // amber
  { bg: '#FCE9EA', fg: '#C5363B' }, // red
  { bg: '#E6F1FB', fg: '#1E5FA8' }, // blue
  { bg: '#F3E9FB', fg: '#7A3FA8' }, // purple
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function subjectColor(subject: string): { bg: string; fg: string } {
  return PALETTE[hash(subject) % PALETTE.length]!;
}

/** Short 2-char label for a subject badge. */
export function subjectShort(subject: string): string {
  const t = subject.trim();
  return t.slice(0, 2);
}
