import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { format, parseISO } from "date-fns";
import PageHeader from "@/components/PageHeader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

function formatCalendarDate(date: string) {
  return format(parseISO(`${date}T00:00:00`), "EEEE, d MMM yyyy");
}

function buildGroupedCalendar(records: CalendarRecord[]) {
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
      ].some((value) => value.toLowerCase().includes(query));
    });
  }, [country, lessonType, search, sourcePage, tutor]);

  const trialCount = calendarRecords.filter((record) => record.lessonType === "Trial").length;
  const paidCount = calendarRecords.filter((record) => record.lessonType === "Paid Class").length;
  const groupCount = calendarRecords.filter((record) => record.studentCount > 1).length;

  const sections = useMemo(() => {
    const trialRecords = filteredRecords.filter((record) => record.lessonType === "Trial");
    const paidRecords = filteredRecords.filter((record) => record.lessonType === "Paid Class");
    const mixedRecords = filteredRecords.filter((record) => record.lessonType === "Mixed");

    return [
      {
        key: "trial",
        title: "Trial Classes",
        description: "Grouped by date first, then by tutor.",
        badgeVariant: "accent" as const,
        records: trialRecords,
      },
      {
        key: "paid",
        title: "Paid Classes",
        description: "Grouped by date first, then by tutor.",
        badgeVariant: "secondary" as const,
        records: paidRecords,
      },
      {
        key: "mixed",
        title: "Mixed Slots",
        description: "Slots that combine trial and paid students.",
        badgeVariant: "muted" as const,
        records: mixedRecords,
      },
    ]
      .filter((section) => section.records.length > 0)
      .map((section) => ({
        ...section,
        groupedDates: buildGroupedCalendar(section.records),
      }));
  }, [filteredRecords]);

  return (
    <>
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

      <div className="space-y-6">
        {sections.length === 0 ? (
          <div className="rounded-xl border border-border bg-card px-6 py-16 text-center text-sm text-muted-foreground">
            No calendar records found for the selected filters.
          </div>
        ) : (
          sections.map((section) => (
            <section key={section.key} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-col gap-3 border-b border-border pb-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
                    <CalendarBadge value={`${section.records.length} slots`} variant={section.badgeVariant} />
                  </div>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </div>
              </div>

              <div className="mt-5 space-y-6">
                {section.groupedDates.map((dateGroup) => (
                  <div key={dateGroup.date} className="space-y-4">
                    <div className="flex items-center justify-between border-b border-dashed border-border pb-2">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">{dateGroup.label}</h3>
                      <span className="text-xs text-muted-foreground">
                        {dateGroup.tutors.reduce((total, tutorGroup) => total + tutorGroup.records.length, 0)} slot(s)
                      </span>
                    </div>

                    <div className="space-y-4">
                      {dateGroup.tutors.map((tutorGroup) => (
                        <div key={`${dateGroup.date}-${tutorGroup.tutorName}`} className="space-y-3">
                          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <Users size={16} className="text-muted-foreground" />
                            <span>{tutorGroup.tutorName}</span>
                            <span className="text-xs font-normal text-muted-foreground">{tutorGroup.records.length} slot(s)</span>
                          </div>

                          <div className="grid gap-3 xl:grid-cols-2">
                            {tutorGroup.records.map((record) => (
                              <button
                                key={record.id}
                                type="button"
                                onClick={() => setSelectedRecord(record)}
                                className="rounded-xl border border-border bg-background p-4 text-left transition-colors hover:bg-muted"
                              >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div>
                                    <div className="text-base font-semibold text-foreground">{record.time}</div>
                                    <div className="mt-1 text-sm text-muted-foreground">{record.program}</div>
                                  </div>
                                  <CalendarBadge
                                    value={record.lessonType}
                                    variant={record.lessonType === "Trial" ? "accent" : record.lessonType === "Paid Class" ? "secondary" : "muted"}
                                  />
                                </div>

                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                  <div>
                                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Students</div>
                                    <div className="mt-1 text-sm font-medium text-foreground">{record.studentCount} student{record.studentCount === 1 ? "" : "s"}</div>
                                    <div className="mt-1 text-xs text-muted-foreground">{record.students}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Linked To</div>
                                    <div className="mt-1 text-sm font-medium text-foreground">{record.sourcePage}</div>
                                    <div className="mt-1 text-xs text-muted-foreground">{record.sourceStatus}</div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      <Dialog open={Boolean(selectedRecord)} onOpenChange={(open) => !open && setSelectedRecord(null)}>
        <DialogContent className="max-w-2xl">
          {selectedRecord && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedRecord.lessonType} Class Details</DialogTitle>
                <DialogDescription>
                  {formatCalendarDate(selectedRecord.date)} · {selectedRecord.time} · {selectedRecord.tutor}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Tutor</div>
                  <div className="mt-1 text-sm font-medium text-foreground">{selectedRecord.tutor}</div>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Lesson Type</div>
                  <div className="mt-1 text-sm font-medium text-foreground">{selectedRecord.lessonType}</div>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Program</div>
                  <div className="mt-1 text-sm font-medium text-foreground">{selectedRecord.program}</div>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Country</div>
                  <div className="mt-1 text-sm font-medium text-foreground">{selectedRecord.country}</div>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Linked Source</div>
                  <div className="mt-1 text-sm font-medium text-foreground">{selectedRecord.sourcePage}</div>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Source Status</div>
                  <div className="mt-1 text-sm font-medium text-foreground">{selectedRecord.sourceStatus}</div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Students</div>
                  <div className="mt-3 space-y-2">
                    {selectedRecord.studentList.map((student) => (
                      <div key={student} className="rounded-lg bg-muted px-3 py-2 text-sm text-foreground">
                        {student}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Parent Contacts</div>
                  <div className="mt-3 space-y-2">
                    {selectedRecord.parentContactList.map((parent) => (
                      <div key={parent} className="rounded-lg bg-muted px-3 py-2 text-sm text-foreground">
                        {parent}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}