import { format } from "date-fns";
import { packages as packageCatalog } from "@/data/packagesCatalog";

export type ChildStatus = "INQUIRY" | "LEAD" | "TRIAL ARRANGED" | "TRIAL DONE" | "MISSED TRIAL" | "PENDING PAYMENT" | "PAYMENT FAILED" | "ENROLLED" | "CLOSED WON" | "LOST";
export type AIStatus = "active" | "admin" | "completed";

export const programs = [
  "Scratch","Basic Computer Minecraft","Basic Computer Roblox","Minecraft",
  "Minecraft Project 1","Minecraft Project 2","Minecraft Project 3","Minecraft Project 4","Minecraft Project 5",
  "Roblox","Roblox AI Debugging","Roblox Project 1","Roblox Project 2",
  "Roblox Project 3","Roblox Project 4","Roblox Project 5","Website Design","Python","Crypto",
];

export const lessonDays = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

export interface Child {
  id: string;
  name: string;
  age: number;
  level: string;
  status: ChildStatus;
  programStatus?: "Transferred" | "Complete" | "Incomplete";
  enrolmentStatus?: "Enrolled" | "Paused" | "Pending Pause" | "Pending Complete" | "Complete" | "To Confirm";
  trialDate?: string;
  trialTutor?: string;
  trialPassed?: boolean;
  trialOutcomeMarked?: boolean;
  hoursSinceTrial?: number;
  packageInterest?: string;
  studentPackageId?: string;
  studentPackageName?: string;
  lostReason?: string;
  enrolledDate?: string;
  program?: string;
  lessonDay?: string;
  tutor?: string;
  lessonStartDate?: string;
  lessonPauseDate?: string;
  lessonsCompleted?: number;
}

export interface Parent {
  id: string;
  name: string;
  phone: string;
  psid?: string;
  country: string;
  channel: "WhatsApp" | "Messenger";
  source: string;
  assignedTo: string;
  aiAgent: AIStatus;
  lastContacted: string;
  lastContactedHrs: number;
  children: Child[];
  notes: { text: string; time: string }[];
  reengagementDate?: string;
}

const today = new Date();
export const todayFormatted = format(today, "EEE d MMM");

const firstNames = [
  "Asela","Maria","Sid","Anna","Leonard","Aileen","Daniella","Mike","Priya","Ravi",
  "Jessica","Ahmad","Carlos","Sofia","Yuki","Wei","Fatima","Omar","Liam","Chloe",
  "Arun","Mei","Jasmine","Ethan","Zara","Noel","Rina","Tariq","Isla","Ben",
  "Amara","Jin","Rosa","Hugo","Layla","Kai","Siti","Arjun","Nina","Felix",
  "Hana","Leo","Devi","Marco","Aisha","Ryan","Lucia","Raj","Emma","Dina",
  "Kenji","Anya","Paulo","Mira","Hassan","Eva","Vikram","Lena","Ali","Grace",
  "Tao","Carmen","Finn","Nadia","Sam","Tanya","Ivan","Suki","Diego","Lily",
  "Rohan","Petra","Abel","Maya","Chen","Gina","Faris","Jade","Yusuf","Elin",
  "Kian","Vera","Dante","Suki","Zain","Iris","Joel","Tina","Axel","Nora",
  "Hans","Lina","Rico","Farah","Elias","Pia","Neil","Aya","Max","Sera"
];

const lastNames = [
  "Perera","Cuison","Pelaez","Salutan","Osi","Deloverges","De Vos","Chen","Nair","Kumar",
  "Tan","Rizal","Garcia","Santos","Tanaka","Wong","Al-Rashid","Ibrahim","O'Brien","Ng",
  "Sharma","Lin","Kaur","Goh","Hassan","Cruz","Putri","Menon","Campbell","Lee",
  "Osei","Park","Flores","Weber","Khalil","Nakamura","Rahman","Singh","Larsson","Kim",
  "Patel","Fernandez","Yamamoto","Lim","Costa","Gupta","Torres","Huang","Ali","Reyes",
  "Jansen","Mendoza","Sato","Choi","Rivera","Das","Moreno","Suzuki","Ahmad","Lopez",
  "Schmidt","Ramos","Takahashi","Chua","Guerrero","Rao","Herrera","Watanabe","Malik","Diaz"
];

const childFirstNames = [
  "Aiden","Sophia","Liam","Emma","Noah","Mia","Lucas","Ava","Ethan","Chloe",
  "Oliver","Isla","Zara","Leo","Maya","Kai","Aria","Ryan","Luna","Adam",
  "Hana","Yuki","Arjun","Sara","Ravi","Noor","Zain","Lily","Finn","Jade",
];

const countries = ["Philippines","Singapore","Malaysia","Sri Lanka","UAE","Hong Kong","Indonesia"];
const channels: ("WhatsApp" | "Messenger")[] = ["WhatsApp","Messenger"];
const sources = ["Meta Ads (Facebook)","Meta Ads (WhatsApp)","Meta Ads (Form)","Referral","Website","Instagram","Google Ads"];
const childStatuses: ChildStatus[] = ["INQUIRY","LEAD","LEAD","LEAD","TRIAL ARRANGED","TRIAL DONE","MISSED TRIAL","PENDING PAYMENT","PENDING PAYMENT","PAYMENT FAILED","ENROLLED","CLOSED WON","CLOSED WON","LOST"];
const aiStatuses: AIStatus[] = ["active","active","admin","completed"];
const admins = ["Sarah A.","James L.","Maria G.","David K."];
const tutors = ["Coach Ben","Coach Lily","Coach Arjun","Coach Mei","Coach Ryan","Coach Sofia","Coach Leo","Coach Hana"];
const levels = ["—","Beginner","Intermediate","Advanced"];
const packageInterests = ["8 lessons / month","4 lessons / month","Trial only","16 lessons / month","10 lessons / month"];
const programStatuses: Array<Child["programStatus"]> = ["Transferred", "Complete", "Incomplete"];
const enrolmentStatuses: Array<NonNullable<Child["enrolmentStatus"]>> = ["Enrolled", "Paused", "Pending Pause", "Pending Complete", "Complete", "To Confirm"];
const maxLessonsByProgram: Record<string, number> = {
  "Scratch": 22,
  "Basic Computer Minecraft": 3,
  "Basic Computer Roblox": 3,
  "Minecraft": 23,
  "Minecraft Project 1": 10,
  "Minecraft Project 2": 10,
  "Minecraft Project 3": 10,
  "Minecraft Project 4": 10,
  "Minecraft Project 5": 10,
  "Roblox": 23,
  "Roblox AI Debugging": 6,
  "Roblox Project 1": 10,
  "Roblox Project 2": 10,
  "Roblox Project 3": 10,
  "Roblox Project 4": 10,
  "Roblox Project 5": 10,
  "Website Design": 18,
  "Python": 16,
  "Crypto": 6,
};
const lostReasons = ["Price","Timing","Chose competitor","Not interested","No response"];
const noteTexts = [
  "Parent interested in weekend classes","Trial went well, follow up for enrollment",
  "Missed trial - tried calling twice","Rescheduling pending","Enrolled in 8-lesson package",
  "Price too high","Wants to start next month","Asked about sibling discount",
  "Prefers weekday mornings","Interested in Minecraft coding","Wants trial before committing",
  "Called and left voicemail","Responded to follow-up","Waiting for school term to end",
  "Compared with other academies","Very enthusiastic after trial","Needs to check schedule",
  "Parent travelling, will confirm later","Requested class demo video","Asked about curriculum details",
];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seededRandom(42);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const randInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;

function getMaxLessons(program?: string) {
  return program ? maxLessonsByProgram[program] ?? 10 : 10;
}

function getLessonsCompleted(program: string | undefined, enrolmentStatus: Child["enrolmentStatus"]) {
  const maxLessons = getMaxLessons(program);

  switch (enrolmentStatus) {
    case "Complete":
      return maxLessons;
    case "Pending Complete":
      return Math.max(0, maxLessons - randInt(0, 2));
    case "To Confirm":
      return randInt(0, Math.min(2, maxLessons));
    default:
      return randInt(0, Math.max(0, maxLessons - 1));
  }
}

function getLessonPauseDate(enrolmentStatus: Child["enrolmentStatus"]) {
  if (enrolmentStatus === "Paused") {
    const date = new Date(today);
    date.setDate(date.getDate() - randInt(1, 21));
    return format(date, "d MMM yyyy");
  }

  if (enrolmentStatus === "Pending Pause") {
    const date = new Date(today);
    date.setDate(date.getDate() + randInt(1, 14));
    return format(date, "d MMM yyyy");
  }

  return undefined;
}

function hrsToLabel(hrs: number): string {
  if (hrs < 1) return "just now";
  if (hrs < 24) return `${hrs} hrs ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}

type TrialSlot = {
  trialDate: string;
  trialTutor: string;
  trialPassed?: boolean;
  trialOutcomeMarked?: boolean;
  hoursSinceTrial?: number;
};

function createTrialSlotPool(status: "TRIAL ARRANGED" | "TRIAL DONE", count: number): TrialSlot[] {
  return Array.from({ length: count }, () => {
    const date = new Date(today);

    if (status === "TRIAL ARRANGED") {
      const dayOffset = randInt(-3, 10);
      date.setDate(date.getDate() + dayOffset);

      return {
        trialDate: format(date, "EEE d MMM") + `, ${randInt(9, 16)}:00 ${randInt(0, 1) ? "AM" : "PM"}`,
        trialTutor: pick(tutors),
        trialPassed: dayOffset < 0,
        trialOutcomeMarked: dayOffset < 0 ? rand() > 0.5 : false,
      };
    }

    const dayOffset = randInt(-10, -1);
    date.setDate(date.getDate() + dayOffset);

    return {
      trialDate: format(date, "EEE d MMM") + `, ${randInt(9, 16)}:00 ${randInt(0, 1) ? "AM" : "PM"}`,
      trialTutor: pick(tutors),
      hoursSinceTrial: randInt(2, 96),
    };
  });
}

const arrangedTrialSlotPool = createTrialSlotPool("TRIAL ARRANGED", 18);
const completedTrialSlotPool = createTrialSlotPool("TRIAL DONE", 16);

function getTrialSlot(status: "TRIAL ARRANGED" | "TRIAL DONE"): TrialSlot {
  const useSharedSlot = rand() < 0.72;

  if (useSharedSlot) {
    return status === "TRIAL ARRANGED"
      ? pick(arrangedTrialSlotPool)
      : pick(completedTrialSlotPool);
  }

  return createTrialSlotPool(status, 1)[0];
}

function normalizePackageCountry(country: string) {
  if (country === "UAE") return "Dubai";
  return country;
}

function getMatchingPackages(country: string) {
  const normalizedCountry = normalizePackageCountry(country);
  return packageCatalog.filter((pkg) => pkg.active && pkg.country === normalizedCountry);
}

function attachStudentPackage(child: Child, country: string) {
  const matchingPackages = getMatchingPackages(country);
  if (matchingPackages.length === 0) return;

  const selectedPackage = pick(matchingPackages);
  child.studentPackageId = `SP-${selectedPackage.id}`;
  child.studentPackageName = selectedPackage.name;
}

function generateParents(): Parent[] {
  const result: Parent[] = [];
  let childIdCounter = 10000;

  for (let i = 0; i < 200; i++) {
    const id = `#P${61000 + i}`;
    const firstName = pick(firstNames);
    const lastName = pick(lastNames);
    const name = `${firstName} ${lastName}`;
    const country = pick(countries);
    const channel = pick(channels);
    const source = pick(sources);
    const aiAgent = pick(aiStatuses);
    const assignedTo = pick(admins);
    const lastContactedHrs = randInt(0, 168);
    const lastContacted = hrsToLabel(lastContactedHrs);
    const phoneCountryCodes: Record<string, string> = {
      "Philippines": "+63","Singapore": "+65","Malaysia": "+60","Sri Lanka": "+94",
      "UAE": "+971","Hong Kong": "+852","Indonesia": "+62",
    };
    const phone = `${phoneCountryCodes[country]} ${randInt(900,999)} ${randInt(100,999)} ${randInt(1000,9999)}`;

    // Generate 1-3 children per parent, each with their own status
    const childCount = randInt(1, 3);
    const children: Child[] = [];
    for (let c = 0; c < childCount; c++) {
      const childAge = randInt(6, 15);
      const childStatus = pick(childStatuses);
      const childLevel = childStatus === "LEAD" || childStatus === "INQUIRY" ? "—" : pick(levels);
      const child: Child = {
        id: `#S${childIdCounter++}`,
        name: `${pick(childFirstNames)} ${lastName}`,
        age: childAge,
        level: childLevel,
        status: childStatus,
      };

      if (childStatus === "TRIAL ARRANGED") {
        const trialSlot = getTrialSlot("TRIAL ARRANGED");
        child.trialDate = trialSlot.trialDate;
        child.trialTutor = trialSlot.trialTutor;
        child.trialPassed = trialSlot.trialPassed;
        child.trialOutcomeMarked = trialSlot.trialOutcomeMarked;
      }

      if (childStatus === "TRIAL DONE" || childStatus === "PENDING PAYMENT" || childStatus === "PAYMENT FAILED") {
        const trialSlot = getTrialSlot("TRIAL DONE");
        child.trialDate = trialSlot.trialDate;
        child.trialTutor = trialSlot.trialTutor;
        child.hoursSinceTrial = trialSlot.hoursSinceTrial;
        child.packageInterest = pick(packageInterests);

        if (childStatus === "PENDING PAYMENT" || childStatus === "PAYMENT FAILED") {
          attachStudentPackage(child, country);
        }
      }

      if (childStatus === "ENROLLED" || childStatus === "CLOSED WON") {
        const dayOffset = randInt(-30, -5);
        const d = new Date(today);
        const lessonStart = new Date(d);
        const enrolmentStatus = pick(enrolmentStatuses);
        const program = pick(programs);
        lessonStart.setDate(lessonStart.getDate() + randInt(1, 14));
        d.setDate(d.getDate() + dayOffset);
        child.trialDate = format(d, "EEE d MMM") + `, ${randInt(9, 16)}:00 ${randInt(0, 1) ? "AM" : "PM"}`;
        child.trialTutor = pick(tutors);
        child.packageInterest = pick(packageInterests);
        child.enrolledDate = `${randInt(1, 28)} Mar 2026`;
        child.program = program;
        child.lessonDay = pick(lessonDays);
        child.tutor = pick(tutors);
        child.lessonStartDate = format(lessonStart, "d MMM yyyy");
        child.enrolmentStatus = enrolmentStatus;
        child.lessonPauseDate = getLessonPauseDate(enrolmentStatus);
        child.lessonsCompleted = getLessonsCompleted(program, enrolmentStatus);
        child.programStatus = enrolmentStatus === "Complete" ? "Complete" : (pick(programStatuses) ?? "Incomplete");

        if (childStatus === "CLOSED WON") {
          attachStudentPackage(child, country);
        }
      }

      if (childStatus === "LOST") {
        child.lostReason = pick(lostReasons);
      }

      children.push(child);
    }

    const noteCount = randInt(0, 3);
    const notes: { text: string; time: string }[] = [];
    for (let n = 0; n < noteCount; n++) {
      notes.push({
        text: pick(noteTexts),
        time: `${randInt(1, 30)} Mar 2026, ${randInt(8, 17)}:${String(randInt(0, 59)).padStart(2, "0")} ${randInt(0, 1) ? "AM" : "PM"}`,
      });
    }

    const psid = channel === "Messenger" ? `${randInt(1000000000, 9999999999)}` : undefined;
    result.push({ id, name, phone, psid, country, channel, source, assignedTo, aiAgent, lastContacted, lastContactedHrs, children, notes });
  }

  return result;
}

function generateAdditionalEnrolmentParents(): Parent[] {
  const result: Parent[] = [];
  let childIdCounter = 20000;
  const recordsPerStatus = 50;

  enrolmentStatuses.forEach((enrolmentStatus, statusIndex) => {
    for (let i = 0; i < recordsPerStatus; i++) {
      const lastName = pick(lastNames);
      const country = pick(countries);
      const channel = pick(channels);
      const program = programs[(statusIndex * recordsPerStatus + i) % programs.length];
      const lessonDay = lessonDays[(statusIndex * recordsPerStatus + i) % lessonDays.length];
      const parentId = `#P${70000 + statusIndex * recordsPerStatus + i}`;
      const childStatus: ChildStatus = rand() > 0.5 ? "ENROLLED" : "CLOSED WON";
      const phoneCountryCodes: Record<string, string> = {
        "Philippines": "+63","Singapore": "+65","Malaysia": "+60","Sri Lanka": "+94",
        "UAE": "+971","Hong Kong": "+852","Indonesia": "+62",
      };

      const child: Child = {
        id: `#S${childIdCounter++}`,
        name: `${pick(childFirstNames)} ${lastName}`,
        age: randInt(6, 16),
        level: pick(levels.filter(level => level !== "—")),
        status: childStatus,
        programStatus: pick(programStatuses) ?? "Incomplete",
        enrolmentStatus,
        trialDate: `${format(new Date(2026, 2, randInt(1, 28)), "EEE d MMM")}, ${randInt(9, 16)}:00 ${randInt(0, 1) ? "AM" : "PM"}`,
        trialTutor: pick(tutors),
        packageInterest: pick(packageInterests.filter(pkg => pkg !== "Trial only")),
        enrolledDate: `${randInt(1, 28)} Mar 2026`,
        program,
        lessonDay,
        tutor: pick(tutors),
        lessonStartDate: `${randInt(1, 28)} Apr 2026`,
        lessonPauseDate: getLessonPauseDate(enrolmentStatus),
        lessonsCompleted: getLessonsCompleted(program, enrolmentStatus),
      };

      if (enrolmentStatus === "Complete") {
        child.programStatus = "Complete";
      }

      result.push({
        id: parentId,
        name: `${pick(firstNames)} ${lastName}`,
        phone: `${phoneCountryCodes[country]} ${randInt(900, 999)} ${randInt(100, 999)} ${randInt(1000, 9999)}`,
        psid: channel === "Messenger" ? `${randInt(1000000000, 9999999999)}` : undefined,
        country,
        channel,
        source: pick(sources),
        assignedTo: pick(admins),
        aiAgent: pick(aiStatuses),
        lastContacted: hrsToLabel(randInt(1, 72)),
        lastContactedHrs: randInt(1, 72),
        children: [child],
        notes: [
          {
            text: `Enrolment status updated to ${enrolmentStatus}`,
            time: `${randInt(1, 30)} Mar 2026, ${randInt(8, 17)}:${String(randInt(0, 59)).padStart(2, "0")} ${randInt(0, 1) ? "AM" : "PM"}`,
          },
        ],
      });
    }
  });

  return result;
}

export const parents = [...generateParents(), ...generateAdditionalEnrolmentParents()];

// Helper: get all children across all parents as flat list with parent reference
export interface ChildWithParent extends Child {
  parent: Parent;
}

export function getAllChildren(): ChildWithParent[] {
  return parents.flatMap(p => p.children.map(c => ({ ...c, parent: p })));
}

export function getChildrenByStatus(...statuses: ChildStatus[]): ChildWithParent[] {
  return getAllChildren().filter(c => statuses.includes(c.status));
}

export const countryFlags: Record<string, string> = {
  "Singapore": "🇸🇬", "Malaysia": "🇲🇾", "Philippines": "🇵🇭", "Indonesia": "🇮🇩",
  "UAE": "🇦🇪", "Hong Kong": "🇭🇰", "Sri Lanka": "🇱🇰",
};
