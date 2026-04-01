import { useState, useMemo } from "react";
import { format, parse, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import PageHeader from "@/components/PageHeader";
import FilterTabs from "@/components/FilterTabs";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";

const countryFlags: Record<string, string> = {
  SG: "🇸🇬", MY: "🇲🇾", PH: "🇵🇭", ID: "🇮🇩", AE: "🇦🇪", HK: "🇭🇰", LK: "🇱🇰",
};

type AttendanceRow = {
  student: string;
  date: string;
  type: "REGULAR" | "MAKEUP" | "TRIAL";
  outcome: "ATTENDED" | "ABSENT" | "NO SHOW";
  tutor: string;
  country: string;
  class: string;
  notes: string;
};

const students = ["Ethan Tan","Chloe Lim","Arjun Menon","Sofia Reyes","Daniel Wong","Priya Nair","James Wong","Aisha Rahman","Liam Fernando","Mei Chen","Noah Lee","Isla Ng","Zara Kaur","Leo Santos","Maya Patel","Kai Nakamura","Aria Flores","Ryan Kim","Luna Hassan","Adam Cruz","Hana Suzuki","Yuki Park","Sara Das","Noor Ali","Zain Ramos","Lily Huang","Finn Weber","Jade Choi","Oliver Tan","Emma Lim"];
const tutors = ["Arun Sharma","Rizal Hakim","Maria Santos","Dewi Putri","Fatima Al-Hassan","Alex Lim","Jamie Koh","Chen Wei","Priya Menon","Tom Garcia"];
const countryCodes = ["SG","MY","PH","ID","AE","HK","LK"];
const classes = ["Python L1 — Sat 10:00","Scratch L0 — Sun 14:00","Web L2 — Wed 16:30","Python L2 — Mon 15:00","Scratch L1 — Tue 10:00","Minecraft L1 — Thu 14:00","Roblox L1 — Fri 16:00","Python L3 — Sat 11:00","Scratch L2 — Sun 10:00","Crypto L1 — Wed 14:00"];
const types: ("REGULAR" | "MAKEUP" | "TRIAL")[] = ["REGULAR","REGULAR","REGULAR","REGULAR","REGULAR","MAKEUP","MAKEUP","TRIAL","TRIAL","TRIAL"];
const outcomes: ("ATTENDED" | "ABSENT" | "NO SHOW")[] = ["ATTENDED","ATTENDED","ATTENDED","ATTENDED","ATTENDED","ATTENDED","ABSENT","ABSENT","NO SHOW","NO SHOW"];
const noteOptions = ["Good progress","Completed module","Excellent work","Needs review","—","Makeup for missed class","Very engaged","Parent interested","Great first class","Reschedule requested","Struggling with concepts","Ahead of schedule","—","Collaborative session","First time absent"];

function seededRand(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

const aRand = seededRand(99);
const aPick = <T,>(arr: T[]): T => arr[Math.floor(aRand() * arr.length)];

const data: AttendanceRow[] = Array.from({ length: 110 }, (_, i) => {
  const day = 1 + Math.floor(aRand() * 31);
  const hour = 9 + Math.floor(aRand() * 9);
  const min = Math.floor(aRand() * 4) * 15;
  return {
    student: aPick(students),
    date: `${day} Mar, ${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`,
    type: aPick(types),
    outcome: aPick(outcomes),
    tutor: aPick(tutors),
    country: aPick(countryCodes),
    class: aPick(classes),
    notes: aPick(noteOptions),
  };
});

const typeVariantMap: Record<string, "makeup" | "regular" | "trial_arranged"> = {
  MAKEUP: "makeup",
  REGULAR: "regular",
  TRIAL: "trial_arranged",
};

const allCount = data.length;
const attendedCount = data.filter(r => r.outcome === "ATTENDED").length;
const absentCount = data.filter(r => r.outcome === "ABSENT").length;
const noShowCount = data.filter(r => r.outcome === "NO SHOW").length;
const trialCount = data.filter(r => r.type === "TRIAL").length;

const tabs = [
  { label: "All", count: allCount },
  { label: "Attended", count: attendedCount },
  { label: "Absent", count: absentCount },
  { label: "No Show", count: noShowCount },
  { label: "Trials", count: trialCount },
];

const tabFilterFn = (tab: number) => (row: AttendanceRow) => {
  switch (tab) {
    case 1: return row.outcome === "ATTENDED";
    case 2: return row.outcome === "ABSENT";
    case 3: return row.outcome === "NO SHOW";
    case 4: return row.type === "TRIAL";
    default: return true;
  }
};

const columns = [
  { key: "student", header: "Student" },
  { key: "date", header: "Date" },
  { key: "class", header: "Class" },
  {
    key: "type",
    header: "Type",
    render: (r: AttendanceRow) => (
      <StatusBadge variant={typeVariantMap[r.type]}>
        {r.type}
      </StatusBadge>
    ),
  },
  {
    key: "outcome",
    header: "Outcome",
    render: (r: AttendanceRow) => (
      <span
        className={`font-semibold text-sm ${
          r.outcome === "ATTENDED"
            ? "text-success"
            : r.outcome === "ABSENT"
            ? "text-destructive"
            : "text-muted-foreground"
        }`}
      >
        {r.outcome}
      </span>
    ),
  },
  { key: "tutor", header: "Tutor" },
  {
    key: "country",
    header: "Country",
    render: (r: AttendanceRow) => (
      <span>{countryFlags[r.country] || ""} {r.country}</span>
    ),
  },
  { key: "notes", header: "Notes" },
];

function parseDateStr(dateStr: string): Date | null {
  // dateStr like "27 Mar, 15:20" — parse just the date part
  const parts = dateStr.split(",")[0].trim();
  const d = parse(parts + " 2026", "d MMM yyyy", new Date());
  return isValid(d) ? d : null;
}

function isSameDay(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState(0);
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

  const filtered = data.filter(r => {
    if (!tabFilterFn(activeTab)(r)) return false;
    if (dateFilter) {
      const rowDate = parseDateStr(r.date);
      if (!rowDate || !isSameDay(rowDate, dateFilter)) return false;
    }
    return true;
  });

  return (
    <div>
      <PageHeader title="Attendance" subtitle="Mark and review class & trial attendance">
        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[200px] justify-start text-left font-normal",
                  !dateFilter && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFilter ? format(dateFilter, "PPP") : "Filter by date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateFilter}
                onSelect={setDateFilter}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          {dateFilter && (
            <Button variant="ghost" size="sm" onClick={() => setDateFilter(undefined)} className="text-muted-foreground">
              Clear
            </Button>
          )}
        </div>
      </PageHeader>
      <FilterTabs tabs={tabs} activeIndex={activeTab} onChange={setActiveTab} />
      <DataTable columns={columns} data={filtered} totalItems={filtered.length} />
    </div>
  );
}
