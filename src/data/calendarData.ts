import { addDays, addWeeks, format, isValid, parse } from "date-fns";
import { getAllChildren } from "@/data/parentsData";

export interface CalendarRecord {
  id: string;
  date: string;
  time: string;
  day: string;
  tutor: string;
  lessonType: "Trial" | "Paid Class" | "Mixed";
  sourcePage: "Leads" | "Enrolments" | "Leads + Enrolments";
  sourceStatus: string;
  program: string;
  country: string;
  studentCount: number;
  students: string;
  studentList: string[];
  parentContacts: string;
  parentContactList: string[];
  timestamp: number;
}

type RawCalendarSession = {
  timestamp: number;
  date: string;
  time: string;
  day: string;
  tutor: string;
  lessonType: "Trial" | "Paid Class";
  sourcePage: "Leads" | "Enrolments";
  sourceStatus: string;
  program: string;
  country: string;
  student: string;
  parent: string;
};

const TRIAL_STATUSES = new Set(["TRIAL ARRANGED", "TRIAL DONE", "PENDING PAYMENT", "PAYMENT FAILED"]);
const PAID_STATUSES = new Set(["ENROLLED", "CLOSED WON"]);
const MONTH_INDEX: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};
const LESSON_DAY_INDEX: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};
const TIME_SLOTS = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "19:00"];
const REFERENCE_WEEK_START = new Date(2026, 3, 5);

function hashValue(input: string) {
  return input.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
}

function parseTrialDateTime(value?: string) {
  if (!value) return null;

  const match = value.match(/^[A-Za-z]{3}\s+(\d{1,2})\s+([A-Za-z]{3}),\s+(\d{1,2}):(\d{2})\s+(AM|PM)$/);
  if (!match) return null;

  const [, day, monthLabel, hourLabel, minuteLabel, meridiem] = match;
  const month = MONTH_INDEX[monthLabel];
  if (month === undefined) return null;

  let hour = Number(hourLabel);
  const minute = Number(minuteLabel);

  if (meridiem === "PM" && hour < 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;

  const date = new Date(2026, month, Number(day), hour, minute);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getNextLessonDate(startDateLabel?: string, lessonDay?: string) {
  if (!startDateLabel || !lessonDay) return null;

  const parsed = parse(startDateLabel, "d MMM yyyy", new Date(2026, 0, 1));
  if (!isValid(parsed)) return null;

  const targetDay = LESSON_DAY_INDEX[lessonDay];
  if (targetDay === undefined) return null;

  const nextDate = new Date(parsed);
  while (nextDate.getDay() !== targetDay) {
    nextDate.setDate(nextDate.getDate() + 1);
  }

  return nextDate;
}

function createSession(date: Date, hourAndMinute: string) {
  const [hours, minutes] = hourAndMinute.split(":").map(Number);
  const session = new Date(date);
  session.setHours(hours, minutes, 0, 0);
  return session;
}

function getSharedLessonDate(lessonDay: string, weekOffset: number) {
  const targetDay = LESSON_DAY_INDEX[lessonDay];
  if (targetDay === undefined) return null;

  const date = new Date(REFERENCE_WEEK_START);
  while (date.getDay() !== targetDay) {
    date.setDate(date.getDate() + 1);
  }

  return addWeeks(date, weekOffset);
}

function buildTrialSessions(): RawCalendarSession[] {
  return getAllChildren()
    .filter((child) => TRIAL_STATUSES.has(child.status) && child.trialDate && child.trialTutor)
    .flatMap((child) => {
      const date = parseTrialDateTime(child.trialDate);
      if (!date) return [];

      return [{
        timestamp: date.getTime(),
        date: format(date, "yyyy-MM-dd"),
        time: format(date, "HH:mm"),
        day: format(date, "EEEE"),
        tutor: child.trialTutor!,
        lessonType: "Trial" as const,
        sourcePage: "Leads" as const,
        sourceStatus: child.status,
        program: child.program || child.packageInterest || "Trial Class",
        country: child.parent.country,
        student: child.name,
        parent: child.parent.name,
      }];
    });
}

function buildPaidSessions(): RawCalendarSession[] {
  return getAllChildren()
    .filter((child) => PAID_STATUSES.has(child.status) && child.lessonDay && child.tutor && child.lessonStartDate && child.program)
    .flatMap((child) => {
      const firstLessonDate = getNextLessonDate(child.lessonStartDate, child.lessonDay);
      const slot = TIME_SLOTS[hashValue(`${child.tutor}-${child.lessonDay}`) % TIME_SLOTS.length];
      const sharedWeekOffset = hashValue(`${child.program}-${child.parent.country}`) % 6;

      return Array.from({ length: 2 }).reduce<RawCalendarSession[]>((sessions, _, index) => {
        const sharedLessonDate = getSharedLessonDate(child.lessonDay!, sharedWeekOffset + index);
        const lessonDate = sharedLessonDate ?? (firstLessonDate ? addWeeks(firstLessonDate, index) : null);
        if (!lessonDate) return sessions;

        const session = createSession(lessonDate, slot);

        sessions.push({
          timestamp: session.getTime(),
          date: format(session, "yyyy-MM-dd"),
          time: format(session, "HH:mm"),
          day: format(session, "EEEE"),
          tutor: child.tutor!,
          lessonType: "Paid Class" as const,
          sourcePage: "Enrolments" as const,
          sourceStatus: child.enrolmentStatus || child.status,
          program: child.program!,
          country: child.parent.country,
          student: child.name,
          parent: child.parent.name,
        });

        return sessions;
      }, []);
    });
}

function formatJoined(values: string[], fallback: string) {
  const unique = [...new Set(values.filter(Boolean))];
  if (unique.length === 0) return fallback;
  if (unique.length === 1) return unique[0];
  if (unique.length === 2) return `${unique[0]} / ${unique[1]}`;
  return `${unique[0]} +${unique.length - 1} more`;
}

function buildCalendarRecords() {
  const sessions = [...buildTrialSessions(), ...buildPaidSessions()];
  const grouped = new Map<string, RawCalendarSession[]>();

  sessions.forEach((session) => {
    const key = `${session.date}__${session.time}__${session.tutor}`;
    const existing = grouped.get(key) ?? [];
    existing.push(session);
    grouped.set(key, existing);
  });

  return Array.from(grouped.entries())
    .map(([key, slotSessions], index): CalendarRecord => {
      const first = slotSessions[0];
      const lessonTypes = [...new Set(slotSessions.map((session) => session.lessonType))];
      const sourcePages = [...new Set(slotSessions.map((session) => session.sourcePage))];
      const statuses = [...new Set(slotSessions.map((session) => session.sourceStatus))].sort();
      const programs = [...new Set(slotSessions.map((session) => session.program))].sort();
      const countries = [...new Set(slotSessions.map((session) => session.country))].sort();
      const students = slotSessions.map((session) => session.student).sort();
      const parents = slotSessions.map((session) => session.parent).sort();

      return {
        id: `CAL-${index + 1}-${key.replace(/[^\w]/g, "")}`,
        date: first.date,
        time: first.time,
        day: first.day,
        tutor: first.tutor,
        lessonType: lessonTypes.length === 1 ? lessonTypes[0] : "Mixed",
        sourcePage: sourcePages.length === 1 ? sourcePages[0] : "Leads + Enrolments",
        sourceStatus: statuses.join(", "),
        program: programs.length === 1 ? programs[0] : `${programs[0]} +${programs.length - 1} more`,
        country: formatJoined(countries, "Multiple Countries"),
        studentCount: slotSessions.length,
        students: formatJoined(students, "—"),
        studentList: [...new Set(students)],
        parentContacts: formatJoined(parents, "—"),
        parentContactList: [...new Set(parents)],
        timestamp: first.timestamp,
      };
    })
    .sort((recordA, recordB) => recordB.timestamp - recordA.timestamp || recordA.tutor.localeCompare(recordB.tutor));
}

function interleaveRecords(buckets: CalendarRecord[][], limit = Number.POSITIVE_INFINITY) {
  const validBuckets = buckets.filter((bucket) => bucket.length > 0);
  if (validBuckets.length === 0) return [];

  const result: CalendarRecord[] = [];
  const longestBucket = Math.max(...validBuckets.map((bucket) => bucket.length));

  for (let index = 0; index < longestBucket && result.length < limit; index += 1) {
    validBuckets.forEach((bucket) => {
      const record = bucket[index];
      if (record && result.length < limit) {
        result.push(record);
      }
    });
  }

  return result;
}

function ensureThreeHundredRecords(records: CalendarRecord[]) {
  const orderedRecords = interleaveRecords([
    records.filter((record) => record.lessonType === "Trial"),
    records.filter((record) => record.lessonType === "Paid Class"),
    records.filter((record) => record.lessonType === "Mixed"),
  ]);

  if (orderedRecords.length >= 300) return orderedRecords.slice(0, 300);
  if (records.length === 0) return [];

  const baseRecords = orderedRecords.length > 0 ? orderedRecords : records;
  const extended = [...baseRecords];
  let index = 0;

  while (extended.length < 300) {
    const baseRecord = baseRecords[index % baseRecords.length];
    const shiftedDate = addDays(new Date(baseRecord.timestamp), Math.floor(index / baseRecords.length) + 1);

    extended.push({
      ...baseRecord,
      id: `${baseRecord.id}-X${index + 1}`,
      date: format(shiftedDate, "yyyy-MM-dd"),
      time: format(shiftedDate, "HH:mm"),
      day: format(shiftedDate, "EEEE"),
      timestamp: shiftedDate.getTime(),
    });

    index += 1;
  }

  return extended.slice(0, 300);
}

export const calendarRecords = ensureThreeHundredRecords(buildCalendarRecords());

export function getTutorAvailableSlots(tutor: string): { date: string; time: string; label: string }[] {
  const tutorRecords = calendarRecords.filter(r => r.tutor === tutor);
  const dateSet = new Set<string>();
  tutorRecords.forEach(r => {
    dateSet.add(r.date);
  });
  // For each date the tutor has classes, offer time slots around their schedule
  const slots: { date: string; time: string; label: string }[] = [];
  const allTimes = ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00"];
  const formatLabel = (dateStr: string, time: string) => {
    const parsed = parse(dateStr, "yyyy-MM-dd", new Date());
    return `${format(parsed, "d MMM yyyy")} ${time}`;
  };
  dateSet.forEach(dateStr => {
    const busyTimes = new Set(tutorRecords.filter(r => r.date === dateStr).map(r => r.time));
    allTimes.forEach(t => {
      if (!busyTimes.has(t)) {
        slots.push({ date: dateStr, time: t, label: formatLabel(dateStr, t) });
      }
    });
  });
  // Also add some future dates where tutor has no classes yet
  const today = new Date();
  for (let i = 1; i <= 30; i++) {
    const d = addDays(today, i);
    const ds = format(d, "yyyy-MM-dd");
    if (!dateSet.has(ds)) {
      ["10:00","14:00","16:00"].forEach(t => {
        slots.push({ date: ds, time: t, label: `${format(d, "d MMM yyyy")} at ${t}` });
      });
    }
  }
  // Sort by date then time
  slots.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  return slots;
}