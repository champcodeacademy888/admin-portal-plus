import { useState } from "react";
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

const data: AttendanceRow[] = [
  // Regular & makeup classes
  { student: "Ethan Tan", date: "27 Mar, 15:20", type: "REGULAR", outcome: "ATTENDED", tutor: "Arun Sharma", country: "SG", class: "Python L1 — Sat 10:00", notes: "Good progress" },
  { student: "Chloe Lim", date: "26 Mar, 15:20", type: "REGULAR", outcome: "ATTENDED", tutor: "Rizal Hakim", country: "MY", class: "Scratch L0 — Sun 14:00", notes: "Completed module" },
  { student: "Arjun Menon", date: "25 Mar, 15:20", type: "REGULAR", outcome: "ABSENT", tutor: "Maria Santos", country: "PH", class: "Web L2 — Wed 16:30", notes: "—" },
  { student: "Sofia Reyes", date: "24 Mar, 15:20", type: "REGULAR", outcome: "ATTENDED", tutor: "Dewi Putri", country: "ID", class: "Python L2 — Mon 15:00", notes: "Excellent work" },
  { student: "Daniel Wong", date: "23 Mar, 15:20", type: "REGULAR", outcome: "NO SHOW", tutor: "Fatima Al-Hassan", country: "AE", class: "Scratch L1 — Tue 10:00", notes: "—" },
  { student: "Ethan Tan", date: "20 Mar, 15:20", type: "MAKEUP", outcome: "ATTENDED", tutor: "Arun Sharma", country: "SG", class: "Python L1 — Sat 10:00", notes: "Makeup for 13 Mar" },
  // Trial classes
  { student: "Priya Nair", date: "28 Mar, 10:00", type: "TRIAL", outcome: "ATTENDED", tutor: "Alex Lim", country: "SG", class: "Python L1 — Sat 10:00", notes: "Very engaged" },
  { student: "James Wong", date: "20 Mar, 16:30", type: "TRIAL", outcome: "NO SHOW", tutor: "Alex Lim", country: "HK", class: "Web L2 — Wed 16:30", notes: "Reschedule requested" },
  { student: "Aisha Rahman", date: "22 Mar, 14:00", type: "TRIAL", outcome: "ATTENDED", tutor: "Jamie Koh", country: "MY", class: "Scratch L0 — Sun 14:00", notes: "Parent interested" },
  { student: "Liam Fernando", date: "19 Mar, 10:00", type: "TRIAL", outcome: "ABSENT", tutor: "Maria Santos", country: "LK", class: "Python L1 — Sat 10:00", notes: "Family emergency" },
  { student: "Mei Chen", date: "25 Mar, 16:30", type: "TRIAL", outcome: "ATTENDED", tutor: "Dewi Putri", country: "HK", class: "Web L2 — Wed 16:30", notes: "Great first class" },
];

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
