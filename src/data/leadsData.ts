import { format } from "date-fns";

type AIStatus = "active" | "admin" | "completed";
type LeadStatus = "LEAD" | "TRIAL ATTENDED" | "NO SHOW" | "ENROLLED" | "LOST" | "COLD" | "TRIAL ARRANGED" | "INQUIRY";

export interface Lead {
  name: string;
  status: LeadStatus;
  country: string;
  channel: "WhatsApp" | "Messenger";
  source: string;
  age: number;
  level: string;
  lastContacted: string;
  lastContactedHrs: number;
  aiAgent: AIStatus;
  assignedTo: string;
  phone: string;
  notes: { text: string; time: string }[];
  trialDate?: string;
  trialPassed?: boolean;
  trialOutcomeMarked?: boolean;
  hoursSinceTrial?: number;
  packageInterest?: string;
  lostReason?: string;
  reengagementDate?: string;
  handedOff?: boolean;
}

const today = new Date();
const todayStr = format(today, "EEE d MMM");

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

const countries = ["Philippines","Singapore","Malaysia","Sri Lanka","UAE","Hong Kong","Indonesia"];
const channels: ("WhatsApp" | "Messenger")[] = ["WhatsApp","Messenger"];
const sources = ["Meta Ads (Facebook)","Meta Ads (WhatsApp)","Meta Ads (Form)","Referral","Website","Instagram","Google Ads"];
const statuses: LeadStatus[] = ["INQUIRY","LEAD","LEAD","LEAD","TRIAL ARRANGED","TRIAL ATTENDED","NO SHOW","ENROLLED","LOST","COLD"];
const aiStatuses: AIStatus[] = ["active","active","admin","completed"];
const admins = ["Sarah A.","James L.","Maria G.","David K."];
const levels = ["—","Beginner","Intermediate","Advanced"];
const packageInterests = ["8 lessons / month","4 lessons / month","Trial only","16 lessons / month","10 lessons / month"];
const lostReasons = ["Price","Timing","Chose competitor","Not interested","No response"];
const noteTexts = [
  "Parent interested in weekend classes","Trial went well, follow up for enrollment",
  "No show - tried calling twice","Rescheduling pending","Enrolled in 8-lesson package",
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

function generateLeads(): Lead[] {
  const result: Lead[] = [];

  for (let i = 0; i < 200; i++) {
    const firstName = pick(firstNames);
    const lastName = pick(lastNames);
    const name = `${firstName} ${lastName}`;
    const status = pick(statuses);
    const country = pick(countries);
    const channel = pick(channels);
    const source = pick(sources);
    const age = randInt(6, 15);
    const aiAgent = pick(aiStatuses);
    const assignedTo = pick(admins);
    const lastContactedHrs = randInt(0, 168);
    const lastContacted = hrsToLabel(lastContactedHrs);
    const level = status === "LEAD" || status === "INQUIRY" ? "—" : pick(levels);
    const phoneCountryCodes: Record<string, string> = {
      "Philippines": "+63","Singapore": "+65","Malaysia": "+60","Sri Lanka": "+94",
      "UAE": "+971","Hong Kong": "+852","Indonesia": "+62",
    };
    const phone = `${phoneCountryCodes[country]} ${randInt(900,999)} ${randInt(100,999)} ${randInt(1000,9999)}`;

    const noteCount = randInt(0, 3);
    const notes: { text: string; time: string }[] = [];
    for (let n = 0; n < noteCount; n++) {
      notes.push({
        text: pick(noteTexts),
        time: `${randInt(1, 30)} Mar 2026, ${randInt(8, 17)}:${String(randInt(0, 59)).padStart(2, "0")} ${randInt(0, 1) ? "AM" : "PM"}`,
      });
    }

    const lead: Lead = {
      name, status, country, channel, source, age, level,
      lastContacted, lastContactedHrs, aiAgent, assignedTo, phone, notes,
    };

    if (status === "TRIAL ARRANGED") {
      const dayOffset = randInt(-3, 10);
      const d = new Date(today);
      d.setDate(d.getDate() + dayOffset);
      lead.trialDate = format(d, "EEE d MMM") + `, ${randInt(9, 16)}:00 ${randInt(0, 1) ? "AM" : "PM"}`;
      lead.trialPassed = dayOffset < 0;
      lead.trialOutcomeMarked = dayOffset < 0 ? rand() > 0.5 : false;
    }

    if (status === "TRIAL ATTENDED") {
      lead.hoursSinceTrial = randInt(2, 96);
      lead.packageInterest = pick(packageInterests);
    }

    if (status === "ENROLLED") {
      lead.packageInterest = pick(packageInterests);
      lead.handedOff = rand() > 0.5;
    }

    if (status === "LOST") {
      lead.lostReason = pick(lostReasons);
    }

    result.push(lead);
  }

  return result;
}

export const leads = generateLeads();
export const todayFormatted = todayStr;
