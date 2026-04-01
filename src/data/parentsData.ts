import { format } from "date-fns";

export type ChildStatus = "INQUIRY" | "LEAD" | "TRIAL ARRANGED" | "TRIAL DONE" | "MISSED TRIAL" | "ENROLLED" | "CLOSED WON" | "LOST";
export type AIStatus = "active" | "admin" | "completed";

export const programs = [
  "Scratch","Basic Computer Minecraft","Basic Computer Roblox","Minecraft","Minecraft Level 2",
  "Minecraft Project 1","Minecraft Project 2","Minecraft Project 3","Minecraft Project 4","Minecraft Project 5",
  "Roblox","Roblox AI Debugging","Roblox Level 2","Roblox Project 1","Roblox Project 2",
  "Roblox Project 3","Roblox Project 4","Roblox Project 5","Website Design","Python","Crypto",
];

export const lessonDays = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

export interface Child {
  id: string;
  name: string;
  age: number;
  level: string;
  status: ChildStatus;
  trialDate?: string;
  trialTutor?: string;
  trialPassed?: boolean;
  trialOutcomeMarked?: boolean;
  hoursSinceTrial?: number;
  packageInterest?: string;
  lostReason?: string;
  enrolledDate?: string;
  handedOff?: boolean;
  program?: string;
  lessonDay?: string;
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
const childStatuses: ChildStatus[] = ["INQUIRY","LEAD","LEAD","LEAD","TRIAL ARRANGED","TRIAL DONE","MISSED TRIAL","ENROLLED","CLOSED WON","CLOSED WON","LOST"];
const aiStatuses: AIStatus[] = ["active","active","admin","completed"];
const admins = ["Sarah A.","James L.","Maria G.","David K."];
const tutors = ["Coach Ben","Coach Lily","Coach Arjun","Coach Mei","Coach Ryan","Coach Sofia","Coach Leo","Coach Hana"];
const levels = ["—","Beginner","Intermediate","Advanced"];
const packageInterests = ["8 lessons / month","4 lessons / month","Trial only","16 lessons / month","10 lessons / month"];
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

function hrsToLabel(hrs: number): string {
  if (hrs < 1) return "just now";
  if (hrs < 24) return `${hrs} hrs ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? "1 day ago" : `${days} days ago`;
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
        const dayOffset = randInt(-3, 10);
        const d = new Date(today);
        d.setDate(d.getDate() + dayOffset);
        child.trialDate = format(d, "EEE d MMM") + `, ${randInt(9, 16)}:00 ${randInt(0, 1) ? "AM" : "PM"}`;
        child.trialTutor = pick(tutors);
        child.trialPassed = dayOffset < 0;
        child.trialOutcomeMarked = dayOffset < 0 ? rand() > 0.5 : false;
      }

      if (childStatus === "TRIAL DONE") {
        const dayOffset = randInt(-10, -1);
        const d = new Date(today);
        d.setDate(d.getDate() + dayOffset);
        child.trialDate = format(d, "EEE d MMM") + `, ${randInt(9, 16)}:00 ${randInt(0, 1) ? "AM" : "PM"}`;
        child.trialTutor = pick(tutors);
        child.hoursSinceTrial = randInt(2, 96);
        child.packageInterest = pick(packageInterests);
      }

      if (childStatus === "ENROLLED" || childStatus === "CLOSED WON") {
        const dayOffset = randInt(-30, -5);
        const d = new Date(today);
        d.setDate(d.getDate() + dayOffset);
        child.trialDate = format(d, "EEE d MMM") + `, ${randInt(9, 16)}:00 ${randInt(0, 1) ? "AM" : "PM"}`;
        child.trialTutor = pick(tutors);
        child.packageInterest = pick(packageInterests);
        child.enrolledDate = `${randInt(1, 28)} Mar 2026`;
        child.handedOff = rand() > 0.5;
        child.program = pick(programs);
        child.lessonDay = pick(lessonDays);
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

    result.push({ id, name, phone, country, channel, source, assignedTo, aiAgent, lastContacted, lastContactedHrs, children, notes });
  }

  return result;
}

export const parents = generateParents();

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
