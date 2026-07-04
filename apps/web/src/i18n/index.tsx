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
  'status.working_on': { en: 'Working on', th: 'กำลังทำ' },
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
  'profile.share': { en: 'Share App', th: 'แชร์แอป' },
  'profile.shareDesc': { en: 'Invite others to use Tam-Yang', th: 'ชวนคนอื่นมาใช้ Tam-Yang' },
  'profile.copyUrl': { en: 'Copy URL', th: 'คัดลอกลิงก์' },
  'profile.copied': { en: 'Copied!', th: 'คัดลอกแล้ว!' },

  // nav extras
  'nav.class': { en: 'Class', th: 'ชั้นเรียน' },
  'nav.switchTo': { en: 'Switch to', th: 'สลับเป็น' },
  'nav.switchToAdmin': { en: 'Switch to Admin', th: 'สลับเป็น Admin' },

  // login
  'login.sub2': { en: 'One shared master list for the whole class. Each family tracks their own children.', th: 'มาสเตอร์การบ้านกลางสำหรับทั้งห้อง แต่ละครอบครัวติดตามของลูกตัวเอง' },

  // dashboard extras
  'dash.filter.todo': { en: 'To do', th: 'ต้องทำ' },
  'dash.todo': { en: 'to do', th: 'ต้องทำ' },
  'dash.notStarted': { en: 'not started', th: 'ยังไม่เริ่ม' },
  'dash.workingOn': { en: 'working on', th: 'กำลังทำ' },
  'dash.submittedCount': { en: 'submitted', th: 'ส่งแล้ว' },
  'dash.overdueCount': { en: 'overdue', th: 'เลยกำหนด' },
  'dash.nothingHere': { en: 'Nothing here 🎉', th: 'ไม่มีงานแล้ว 🎉' },
  'dash.noAssignments': { en: 'No assignments for', th: 'ไม่มีงานสำหรับ' },
  'dash.noAssignmentsHint': { en: 'Admin → Config to change active class/term', th: 'Admin → Config เพื่อเปลี่ยนชั้น/เทอม' },
  'dash.myHomeworkLabel': { en: 'My homework', th: 'การบ้านของฉัน' },
  'dash.homeworkOf2': { en: 'Homework ·', th: 'การบ้าน ·' },
  'dash.submittedOf2': { en: 'Submitted', th: 'ส่งแล้ว' },

  // profile extras
  'profile.joined': { en: 'Joined', th: 'เข้าร่วมแล้ว' },
  'profile.notJoined': { en: 'Not joined', th: 'ยังไม่เข้าร่วม' },
  'profile.family': { en: 'Family', th: 'ครอบครัว' },
  'profile.signOut': { en: 'Sign out', th: 'ออกจากระบบ' },

  // family
  'family.title': { en: 'Family', th: 'ครอบครัว' },
  'family.sub': { en: 'Members & invites', th: 'สมาชิกและคำเชิญ' },
  'family.members': { en: 'Members', th: 'สมาชิก' },
  'family.noMembers': { en: 'No members yet', th: 'ยังไม่มีสมาชิก' },
  'family.inviteTitle': { en: 'Invite a member', th: 'เชิญสมาชิก' },
  'family.inviteHint': { en: 'Generate a QR code for a new member to scan', th: 'สร้าง QR code แล้วให้สมาชิกใหม่สแกน' },
  'family.generateQr': { en: 'Generate QR code', th: 'สร้าง QR code' },
  'family.generating': { en: 'Generating…', th: 'กำลังสร้าง…' },
  'family.scanTitle': { en: 'Scan to join', th: 'สแกนเพื่อเข้าร่วม' },
  'family.scanHint': { en: 'Scan QR with your phone camera\nthen Sign in with Google to join', th: 'สแกน QR ด้วยกล้องโทรศัพท์\nแล้ว Sign in with Google เพื่อเข้า family' },
  'family.copyLink': { en: 'Copy invite link', th: 'คัดลอกลิงก์เชิญ' },
  'family.copied': { en: 'Copied!', th: 'คัดลอกแล้ว!' },
  'family.removeTitle': { en: 'Remove member?', th: 'ลบสมาชิก?' },
  'family.removeHint': { en: 'Cannot be undone.', th: 'ไม่สามารถย้อนกลับได้' },
  'family.removing': { en: 'Removing…', th: 'กำลังลบ…' },
  'family.remove': { en: 'Remove', th: 'ลบ' },
  'family.cancel': { en: 'Cancel', th: 'ยกเลิก' },
  'family.save': { en: 'Save', th: 'บันทึก' },
  'family.roleParent': { en: 'Parent', th: 'ผู้ปกครอง' },
  'family.roleChild': { en: 'Child', th: 'เด็ก' },
  'family.roleLabel': { en: 'Role:', th: 'บทบาท:' },

  // assignment detail
  'detail.dueOverdue': { en: 'Overdue ·', th: 'เลยกำหนด ·' },
  'detail.dueToday': { en: 'Due today ·', th: 'ครบกำหนดวันนี้ ·' },
  'detail.dueSoon': { en: 'Due soon ·', th: 'ใกล้กำหนด ·' },
  'detail.dueOn': { en: 'Due', th: 'กำหนดส่ง' },
  'detail.submittedCheck': { en: 'Submitted ✓', th: 'ส่งแล้ว ✓' },
  'detail.notFoundFull': { en: 'Assignment not found. It may have been removed.', th: 'ไม่พบงานนี้ อาจถูกลบไปแล้ว' },
  'detail.readonlyFull': { en: "Read-only — teachers can't change status.", th: 'อ่านอย่างเดียว — ครูเปลี่ยนสถานะไม่ได้' },

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
