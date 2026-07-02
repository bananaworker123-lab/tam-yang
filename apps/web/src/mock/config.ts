export interface ClassConfig { id: string; name: string; }
export interface TermConfig { id: string; name: string; }
export interface SubjectConfig { id: string; name: string; short: string; }

export const CLASSES: ClassConfig[] = [
  { id: 'm1', name: 'M.1' },
  { id: 'm2', name: 'M.2' },
  { id: 'm3', name: 'M.3' },
  { id: 'm4', name: 'M.4' },
  { id: 'm5', name: 'M.5' },
  { id: 'm6', name: 'M.6' },
];

export const TERMS: TermConfig[] = [
  { id: 't1', name: 'Term 1' },
  { id: 't2', name: 'Term 2' },
];

export const SUBJECTS: SubjectConfig[] = [
  { id: 'math',   name: 'Mathematics',    short: 'MA' },
  { id: 'eng',    name: 'English',        short: 'EN' },
  { id: 'sci',    name: 'Science',        short: 'SC' },
  { id: 'hist',   name: 'History',        short: 'HI' },
  { id: 'geo',    name: 'Geography',      short: 'GE' },
  { id: 'art',    name: 'Art',            short: 'AR' },
  { id: 'pe',     name: 'P.E.',           short: 'PE' },
  { id: 'music',  name: 'Music',          short: 'MU' },
  { id: 'thai',   name: 'Thai',           short: 'TH' },
  { id: 'social', name: 'Social Studies', short: 'SS' },
];

// Defaults — overridden by Settings in the UI
export const CURRENT_CLASS_ID = 'm1';
export const CURRENT_TERM_ID  = 't1';
