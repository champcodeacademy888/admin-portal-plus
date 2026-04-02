import { useState, useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import { Search } from "lucide-react";
import { tutors, tutorCountryFlags } from "@/data/tutorsData";
import { calendarRecords } from "@/data/calendarData";
import { getAllChildren } from "@/data/parentsData";

export default function TutorsPage() {
  const [search, setSearch] = useState("");

  const allChildren = useMemo(() => getAllChildren(), []);

  const tutorStats = useMemo(() => {
    return tutors.map(tutor => {
      const calendarSessions = calendarRecords.filter(r => r.tutor === tutor.name);
      const paidSessions = calendarSessions.filter(r => r.lessonType === "Paid Class" || r.lessonType === "Mixed");
      const trialSessions = calendarSessions.filter(r => r.lessonType === "Trial");
      const enrolledStudents = allChildren.filter(c => c.tutor === tutor.name && c.enrolmentStatus === "Enrolled");
      const trialStudents = allChildren.filter(c => c.trialTutor === tutor.name);
      return { ...tutor, paidSessions: paidSessions.length, trialSessions: trialSessions.length, enrolledStudents: enrolledStudents.length, trialStudents: trialStudents.length };
    });
  }, [allChildren]);

  const filtered = useMemo(() => {
    if (!search) return tutorStats;
    const s = search.toLowerCase();
    return tutorStats.filter(t => t.name.toLowerCase().includes(s) || t.country.toLowerCase().includes(s));
  }, [search, tutorStats]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    filtered.forEach(t => {
      const arr = map.get(t.country) || [];
      arr.push(t);
      map.set(t.country, arr);
    });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div>
      <PageHeader title="Tutors" subtitle={`${tutors.length} tutors across ${new Set(tutors.map(t => t.country)).size} countries`} />

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tutors..."
            className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="border border-border rounded-xl overflow-hidden bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-left">
              <th className="px-4 py-2.5 font-medium text-muted-foreground w-12">#</th>
              <th className="px-4 py-2.5 font-medium text-muted-foreground">Tutor Name</th>
              <th className="px-4 py-2.5 font-medium text-muted-foreground">Contact Number</th>
              <th className="px-4 py-2.5 font-medium text-muted-foreground">Email</th>
              <th className="px-4 py-2.5 font-medium text-muted-foreground text-center">Paid Sessions</th>
              <th className="px-4 py-2.5 font-medium text-muted-foreground text-center">Trial Sessions</th>
            </tr>
          </thead>
          <tbody>
            {grouped.map(([country, countryTutors]) => (
              <> 
                <tr key={`group-${country}`} className="bg-primary/5 border-t border-border">
                  <td colSpan={9} className="px-4 py-2 font-semibold text-sm">
                    {tutorCountryFlags[country] || ""} {country}
                  </td>
                </tr>
                {countryTutors.map((tutor, idx) => (
                  <tr key={tutor.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5 text-muted-foreground">{tutor.id}</td>
                    <td className="px-4 py-2.5 font-medium">{tutor.name}</td>
                    <td className="px-4 py-2.5 text-center">
                      {tutor.isSingaporeTrial && <span className="text-success">✓</span>}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{tutor.contactNumber}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{tutor.email}</td>
                    <td className="px-4 py-2.5 text-center">{tutor.enrolledStudents || "—"}</td>
                    <td className="px-4 py-2.5 text-center">{tutor.trialStudents || "—"}</td>
                    <td className="px-4 py-2.5 text-center">{tutor.paidSessions || "—"}</td>
                    <td className="px-4 py-2.5 text-center">{tutor.trialSessions || "—"}</td>
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
