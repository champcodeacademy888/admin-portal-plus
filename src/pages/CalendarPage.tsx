import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { CalendarDays, ChevronDown, Clock3, Users } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { calendarRecords, type CalendarRecord } from "@/data/calendarData";

function CalendarBadge({ value, variant = "muted" }: { value: string; variant?: "muted" | "accent" | "secondary" }) {
  const styles = {
    muted: "bg-muted text-muted-foreground",
    accent: "bg-accent text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground",
  };

  return <span className={`inline-flex rounded-md px-2 py-1 text-[11px] font-medium ${styles[variant]}`}>{value}</span>;
}

const tutorOptions = Array.from(new Set(calendarRecords.map((record) => record.tutor))).sort();
const countryOptions = Array.from(new Set(calendarRecords.map((record) => record.country))).sort();

function formatCalendarDate(date: string) {
  return format(parseISO(`${date}T00:00:00`), "MMMM d, yyyy");
}

function getLessonVariant(lessonType: CalendarRecord["lessonType"]) {
  if (lessonType === "Trial") return "accent" as const;
  if (lessonType === "Paid Class") return "secondary" as const;
  return "muted" as const;
}

type TutorGroup = {
  tutorName: string;
  records: CalendarRecord[];
};

type DateGroup = {
  date: string;
  label: string;
  tutors: TutorGroup[];
};

function buildGroupedCalendar(records: CalendarRecord[]): DateGroup[] {
  const dateMap = new Map<string, CalendarRecord[]>();

  records.forEach((record) => {
    const existing = dateMap.get(record.date) ?? [];
    existing.push(record);
    dateMap.set(record.date, existing);
  });

  return Array.from(dateMap.entries())
    .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
    .map(([date, dateRecords]) => {
      const tutorMap = new Map<string, CalendarRecord[]>();

      dateRecords.forEach((record) => {
        const existing = tutorMap.get(record.tutor) ?? [];
        existing.push(record);
        tutorMap.set(record.tutor, existing);
      });

      return {
        date,
        label: formatCalendarDate(date),
        tutors: Array.from(tutorMap.entries())
          .sort(([tutorA], [tutorB]) => tutorA.localeCompare(tutorB))
          .map(([tutorName, tutorRecords]) => ({
            tutorName,
            records: tutorRecords.sort((recordA, recordB) => recordA.time.localeCompare(recordB.time)),
          })),
      };
    });
}

type SectionKey = "Trial" | "Paid Class" | "Mixed";

const sectionConfig: Array<{
  key: SectionKey;
  title: string;
  description: string;
  variant: "accent" | "secondary" | "muted";
}> = [
  { key: "Trial", title: "Trial Classes", description: "Upcoming and completed trial lesson slots.", variant: "accent" },
  { key: "Paid Class", title: "Paid Classes", description: "Booked enrolment lesson slots.", variant: "secondary" },
  { key: "Mixed", title: "Mixed Slots", description: "Shared slots containing both trial and paid students.", variant: "muted" },
];

export default function CalendarPage() {
  const [search, setSearch] = useState("");
  const [lessonType, setLessonType] = useState("all");
  const [sourcePage, setSourcePage] = useState("all");
  const [tutor, setTutor] = useState("all");
  const [country, setCountry] = useState("all");
  const [selectedRecord, setSelectedRecord] = useState<CalendarRecord | null>(null);

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
        ...record.studentList,
        ...record.parentContactList,
      ].some((value) => value.toLowerCase().includes(query));
    });
  }, [country, lessonType, search, sourcePage, tutor]);

  const summary = useMemo(() => ({
    total: filteredRecords.length,
    trials: filteredRecords.filter((record) => record.lessonType === "Trial").length,
    paid: filteredRecords.filter((record) => record.lessonType === "Paid Class").length,
    grouped: filteredRecords.filter((record) => record.studentCount > 1).length,
  }), [filteredRecords]);

  const sections = useMemo(() => sectionConfig
    .map((section) => ({
      ...section,
      records: filteredRecords.filter((record) => record.lessonType === section.key),
    }))
    .filter((section) => section.records.length > 0)
    .map((section) => ({
      ...section,
      groupedDates: buildGroupedCalendar(section.records),
    })), [filteredRecords]);

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Calendar"
          subtitle="A grouped lesson schedule linked to trial records in Leads and paid classes in Enrolments"
        />

        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border bg-muted/30 px-4 py-3">
            <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_repeat(4,minmax(160px,1fr))]">
              <div className="relative">
                <Clock3 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search student, tutor, program or parent..."
                  className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <Select value={lessonType} onValueChange={setLessonType}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Lesson Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Trial">Trial</SelectItem>
                  <SelectItem value="Paid Class">Paid Class</SelectItem>
                  <SelectItem value="Mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sourcePage} onValueChange={setSourcePage}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Linked To" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="Leads">Leads</SelectItem>
                  <SelectItem value="Enrolments">Enrolments</SelectItem>
                  <SelectItem value="Leads + Enrolments">Both</SelectItem>
                </SelectContent>
              </Select>

              <Select value={tutor} onValueChange={setTutor}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Tutor" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tutors</SelectItem>
                  {tutorOptions.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Country" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countryOptions.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-px border-b border-border bg-border md:grid-cols-4">
            {[
              { label: "Total Slots", value: summary.total },
              { label: "Trial Slots", value: summary.trials },
              { label: "Paid Slots", value: summary.paid },
              { label: "Group Classes", value: summary.grouped },
            ].map((item) => (
              <div key={item.label} className="bg-card px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{item.label}</div>
                <div className="mt-1 text-xl font-semibold text-foreground">{item.value}</div>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[1180px]">
              <div className="grid grid-cols-[180px_180px_140px_220px_220px_220px] border-b border-border bg-muted/40 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <div>SG Date Time</div>
                <div>Tutor</div>
                <div>Type</div>
                <div>Program</div>
                <div>Students</div>
                <div>Linked To</div>
              </div>

              {sections.length === 0 ? (
                <div className="px-6 py-16 text-center text-sm text-muted-foreground">No calendar records found for the selected filters.</div>
              ) : (
                sections.map((section) => (
                  <div key={section.key} className="border-b border-border last:border-b-0">
                    <div className="flex items-center justify-between gap-3 bg-muted/20 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <CalendarBadge value={section.title} variant={section.variant} />
                        <p className="text-sm text-muted-foreground">{section.description}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">{section.records.length} slot(s)</div>
                    </div>

                    {section.groupedDates.map((dateGroup) => (
                      <div key={dateGroup.date} className="border-t border-border first:border-t-0">
                        <div className="grid grid-cols-[180px_1fr] bg-accent/30 px-4 py-2">
                          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <CalendarDays size={15} className="text-muted-foreground" />
                            {dateGroup.label}
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            {dateGroup.tutors.reduce((total, tutorGroup) => total + tutorGroup.records.length, 0)} slot(s)
                          </div>
                        </div>

                        {dateGroup.tutors.map((tutorGroup) => (
                          <div key={`${section.key}-${dateGroup.date}-${tutorGroup.tutorName}`} className="border-t border-border/70 first:border-t-0">
                            <div className="grid grid-cols-[180px_1fr] bg-secondary/20 px-4 py-2">
                              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                <ChevronDown size={14} className="text-muted-foreground" />
                                {tutorGroup.tutorName}
                              </div>
                              <div className="text-right text-xs text-muted-foreground">{tutorGroup.records.length} class(es)</div>
                            </div>

                            {tutorGroup.records.map((record) => (
                              <button
                                key={record.id}
                                type="button"
                                onClick={() => setSelectedRecord(record)}
                                className="grid w-full grid-cols-[180px_180px_140px_220px_220px_220px] border-t border-border/60 px-4 py-3 text-left transition-colors hover:bg-muted/40"
                              >
                                <div className="pr-4 text-sm text-foreground">
                                  <div className="font-medium">{formatCalendarDate(record.date)}</div>
                                  <div className="text-muted-foreground">{record.time}</div>
                                </div>
                                <div className="pr-4 text-sm text-foreground">{record.tutor}</div>
                                <div className="pr-4"><CalendarBadge value={record.lessonType} variant={getLessonVariant(record.lessonType)} /></div>
                                <div className="pr-4 text-sm text-foreground">{record.program}</div>
                                <div className="pr-4 text-sm text-foreground">
                                  <div className="flex items-center gap-2 font-medium">
                                    <Users size={14} className="text-muted-foreground" />
                                    {record.studentCount} student{record.studentCount === 1 ? "" : "s"}
                                  </div>
                                  <div className="truncate text-muted-foreground">{record.students}</div>
                                </div>
                                <div className="pr-4 text-sm text-foreground">
                                  <div>{record.sourcePage}</div>
                                  <div className="truncate text-muted-foreground">{record.sourceStatus}</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={Boolean(selectedRecord)} onOpenChange={(open) => !open && setSelectedRecord(null)}>
        <DialogContent className="max-w-3xl">
          {selectedRecord && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedRecord.program}</DialogTitle>
                <DialogDescription>
                  {formatCalendarDate(selectedRecord.date)} · {selectedRecord.time} · {selectedRecord.tutor}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 md:grid-cols-4">
                {[
                  { label: "Lesson Type", value: selectedRecord.lessonType },
                  { label: "Country", value: selectedRecord.country },
                  { label: "Linked To", value: selectedRecord.sourcePage },
                  { label: "Status", value: selectedRecord.sourceStatus },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-border bg-card p-4">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{item.label}</div>
                    <div className="mt-1 text-sm font-medium text-foreground">{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-border overflow-hidden">
                <div className="grid grid-cols-[1.2fr_1fr] border-b border-border bg-muted/40 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <div>Students</div>
                  <div>Parent Contacts</div>
                </div>
                <div className="divide-y divide-border">
                  {Array.from({ length: Math.max(selectedRecord.studentList.length, selectedRecord.parentContactList.length) }).map((_, index) => (
                    <div key={`${selectedRecord.id}-${index}`} className="grid grid-cols-[1.2fr_1fr] px-4 py-3 text-sm">
                      <div className="text-foreground">{selectedRecord.studentList[index] ?? "—"}</div>
                      <div className="text-foreground">{selectedRecord.parentContactList[index] ?? "—"}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}