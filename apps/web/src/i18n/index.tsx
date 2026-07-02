import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type Locale = 'en' | 'th';
const STORAGE_KEY = 'homeroom.locale';

type Dict = Record<string, { en: string; th: string }>;

// Flat translation dictionary. Add keys here to translate more strings.
const DICT: Dict = {
  // brand / login
  'app.name': { en: 'Tam-Yang', th: 'Tam-Yang' },
  'login.headline': { en: 'Track homework, all in one place', th: 'ติดตามการบ้าน ในที่เดียว' },
  'login.sub': {
    en: "See what your kids have done, what's missing, with one shared class master list.",
    th: 'ดูว่าลูกทำการบ้านอะไรแล้ว ขาดอะไรบ้าง แชร์มาสเตอร์การบ้านกลางทั้งห้องเรียน',
  },
  'login.google': { en: 'Sign in with Google', th: 'เข้าสู่ระบบด้วย Google' },
  'login.googleOnly': { en: 'Sign in with a Google account only', th: 'เข้าสู่ระบบด้วยบัญชี Google เท่านั้น' },
  'login.demo': { en: 'Explore the demo (mock) →', th: 'เข้าชมตัวอย่าง (mock) →' },

  // roles
  'role.admin': { en: 'Admin', th: 'ผู้ดูแลระบบ' },
  'role.parent': { en: 'Parent', th: 'ผู้ปกครอง' },
  'role.child': { en: 'Student', th: 'นักเรียน' },
  'role.teacher': { en: 'Teacher', th: 'ครู' },

  // nav
  'nav.viewAs': { en: 'View as', th: 'ดูในบทบาท' },
  'nav.menu': { en: 'Menu', th: 'เมนู' },
  'nav.homework': { en: 'Homework', th: 'การบ้าน' },
  'nav.myHomework': { en: 'My homework', th: 'การบ้านของฉัน' },
  'nav.family': { en: 'Family', th: 'ครอบครัว' },
  'nav.myRequests': { en: 'My requests', th: 'คำขอของฉัน' },
  'nav.profile': { en: 'Profile', th: 'โปรไฟล์' },
  'nav.classOverview': { en: 'Class overview', th: 'ภาพรวมชั้น' },
  'nav.overview': { en: 'Overview', th: 'ภาพรวม' },
  'nav.assignments': { en: 'Assignment master', th: 'มาสเตอร์การบ้าน' },
  'nav.progress': { en: 'All progress', th: 'Progress รวม' },
  'nav.requests': { en: 'Requests', th: 'คำขอ' },
  'nav.audit': { en: 'Audit log', th: 'Audit Log' },
  'nav.teachers': { en: 'Teachers', th: 'ครูประจำชั้น' },
  'nav.families': { en: 'Families', th: 'ครอบครัว' },

  // status
  'status.not_started': { en: 'Not started', th: 'ยังไม่ทำ' },
  'status.done': { en: 'Done', th: 'ทำแล้ว' },
  'status.submitted': { en: 'Submitted', th: 'ส่งแล้ว' },

  // due
  'due.overdue': { en: 'Overdue', th: 'เลยกำหนด' },
  'due.today': { en: 'Due today', th: 'ครบกำหนดวันนี้' },
  'due.near': { en: 'Near due', th: 'ใกล้กำหนด' },

  // dashboard
  'dash.myHomework': { en: 'My homework', th: 'การบ้านของฉัน' },
  'dash.homeworkOf': { en: 'Homework of', th: 'การบ้านของ' },
  'dash.submittedOf': { en: 'Submitted', th: 'ส่งแล้ว' },
  'dash.tasks': { en: 'tasks', th: 'งาน' },
  'dash.filter.all': { en: 'All', th: 'ทั้งหมด' },
  'dash.filter.near': { en: 'Near due', th: 'ใกล้กำหนด' },
  'dash.filter.overdue': { en: 'Overdue', th: 'เลยกำหนด' },
  'dash.filter.submitted': { en: 'Submitted', th: 'ส่งแล้ว' },
  'dash.empty': { en: 'Nothing here. Try another filter.', th: 'ไม่มีรายการ ลองตัวกรองอื่น' },

  // detail
  'detail.back': { en: 'Back', th: 'กลับ' },
  'detail.assigned': { en: 'Assigned', th: 'วันสั่ง' },
  'detail.due': { en: 'Due', th: 'กำหนดส่ง' },
  'detail.class': { en: 'Class', th: 'ชั้นเรียน' },
  'detail.term': { en: 'Term', th: 'เทอม' },
  'detail.statusHeading': { en: 'Homework status', th: 'สถานะการบ้าน' },
  'detail.readonly': { en: "Read-only — teachers can't change status.", th: 'อ่านอย่างเดียว — ครูเปลี่ยนสถานะไม่ได้' },
  'detail.report': { en: 'Something looks wrong? Tell the admin', th: 'ข้อมูลผิด? แจ้งแอดมิน' },
  'detail.notFound': { en: 'Assignment not found', th: 'ไม่พบงานนี้' },

  // profile
  'profile.title': { en: 'Profile', th: 'โปรไฟล์' },
  'profile.role': { en: 'Role', th: 'บทบาท' },
  'profile.scope': { en: 'Family / class', th: 'ครอบครัว/ชั้น' },
  'profile.wholeSystem': { en: 'Whole system', th: 'ทั้งระบบ' },
  'profile.logout': { en: 'Sign out', th: 'ออกจากระบบ' },
  'profile.settings': { en: 'Settings', th: 'การตั้งค่า' },
  'profile.language': { en: 'Language', th: 'ภาษา' },

  // common
  'common.exampleUser': { en: 'Example user', th: 'ผู้ใช้ตัวอย่าง' },
};

interface I18n {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const Ctx = createContext<I18n | null>(null);

function readInitial(): Locale {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'en' || v === 'th') return v;
  } catch {
    /* ignore */
  }
  return 'en'; // default EN
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readInitial);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = l;
  }, []);

  const t = useCallback(
    (key: string) => {
      const entry = DICT[key];
      if (!entry) return key;
      return entry[locale];
    },
    [locale],
  );

  return <Ctx.Provider value={{ locale, setLocale, t }}>{children}</Ctx.Provider>;
}

export function useT(): I18n {
  const v = useContext(Ctx);
  if (!v) throw new Error('useT must be used within LocaleProvider');
  return v;
}
