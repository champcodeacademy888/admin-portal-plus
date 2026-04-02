import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { calendarRecords, type CalendarRecord } from "@/data/calendarData";

function CalendarBadge({ value, variant = "muted" }: { value: string; variant?: "muted" | "accent" | "secondary" }) {
  const styles = {
    muted: "bg-muted text-muted-foreground",
    accent: "bg-accent text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground",
  };

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[variant]}`}>{value}</span>;
}

const tutorOptions = Array.from(new Set(calendarRecords.map((record) => record.tutor))).sort();
const countryOptions = Array.from(new Set(calendarRecords.map((record) => record.country))).sort();

const columns = [
  { key: "date", header: "Date" },
  { key: "time", header: "Time" },
  { key: "day", header: "Day" },
  { key: "tutor", header: "Tutor" },
  {
    key: "lessonType",
    header: "Lesson Type",
    render: (record: CalendarRecord) => (
      <CalendarBadge value={record.lessonType} variant={record.lessonType === "Trial" ? "accent" : record.lessonType === "Paid Class" ? "secondary" : "muted"} />
    ),
  },
  {
    key: "students",
    header: "Students",
    render: (record: CalendarRecord) => (
      <div>
        <div className="font-medium text-foreground">{record.students}</div>
        <div className="text-xs text-muted-foreground">{record.studentCount} student{record.studentCount === 1 ? "" : "s"}</div>
      </div>
    ),
  },
  { key: "program", header: "Program" },
  { key: "country", header: "Country" },
  {
    key: "sourcePage",
    header: "Linked To",
    render: (record: CalendarRecord) => <CalendarBadge value={record.sourcePage} />,
  },
  { key: "sourceStatus", header: "Source Status" },
];

export default function CalendarPage() {
  const [search, setSearch] = useState("");
  const [lessonType, setLessonType] = useState("all");
  const [sourcePage, setSourcePage] = useState("all");
  const [tutor, setTutor] = useState("all");
  const [country, setCountry] = useState("all");

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return calendarRecords.filter((record) => {
      if (lessonType !== "all" && record.lessonType !== lessonType) return false;
      if (sourcePage !== "all" && record.sourcePage !== sourcePage) return false;
      if (tutor !== "all" && record.tutor !== tutor) return false;
      if (country !== "all" && record.country !== country) return false;

      if (!query) return true;

      return [
        record.date,
        record.time,
        record.day,
        record.tutor,
        record.lessonType,
        record.students,
        record.program,
        record.country,
        record.sourcePage,
        record.sourceStatus,
      ].some((value) => value.toLowerCase().includes(query));
    });
  }, [country, lessonType, search, sourcePage, tutor]);

  const trialCount = calendarRecords.filter((record) => record.lessonType === "Trial").length;
  const paidCount = calendarRecords.filter((record) => record.lessonType === "Paid Class").length;
  const groupCount = calendarRecords.filter((record) => record.studentCount > 1).length;

  return (
    <div>
      <PageHeader
        title="Calendar"
        subtitle="300 lesson slots linked to trial records in Leads and paid classes in Enrolments"
      />

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Total Slots</div>
          <div className="mt-2 text-2xl font-semibold text-foreground">{calendarRecords.length}</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Trial Slots</div>
          <div className="mt-2 text-2xl font-semibold text-foreground">{trialCount}</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Paid Class Slots</div>
          <div className="mt-2 text-2xl font-semibold text-foreground">{paidCount}</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Group Lessons</div>
          <div className="mt-2 text-2xl font-semibold text-foreground">{groupCount}</div>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative w-full xl:max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tutor, student, program or status..."
            className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:flex">
          <Select value={lessonType} onValueChange={setLessonType}>
            <SelectTrigger className="w-full xl:w-40"><SelectValue placeholder="Lesson Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Trial">Trial</SelectItem>
              <SelectItem value="Paid Class">Paid Class</SelectItem>
              <SelectItem value="Mixed">Mixed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sourcePage} onValueChange={setSourcePage}>
            <SelectTrigger className="w-full xl:w-44"><SelectValue placeholder="Linked To" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="Leads">Leads</SelectItem>
              <SelectItem value="Enrolments">Enrolments</SelectItem>
              <SelectItem value="Leads + Enrolments">Both</SelectItem>
            </SelectContent>
          </Select>

          <Select value={tutor} onValueChange={setTutor}>
            <SelectTrigger className="w-full xl:w-44"><SelectValue placeholder="Tutor" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tutors</SelectItem>
              {tutorOptions.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger className="w-full xl:w-44"><SelectValue placeholder="Country" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countryOptions.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable columns={columns as any} data={filteredRecords as any} totalItems={filteredRecords.length} />
    </div>
  );
}