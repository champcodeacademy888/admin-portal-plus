import { useState, useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import { Search } from "lucide-react";
import { tutors, tutorCountryFlags } from "@/data/tutorsData";

export default function TutorsPage() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return tutors;
    const s = search.toLowerCase();
    return tutors.filter(t => t.name.toLowerCase().includes(s) || t.country.toLowerCase().includes(s));
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
              <th className="px-4 py-2.5 font-medium text-muted-foreground">Tutor Name</th>
              <th className="px-4 py-2.5 font-medium text-muted-foreground">Contact Number</th>
              <th className="px-4 py-2.5 font-medium text-muted-foreground">Email</th>
            </tr>
          </thead>
          <tbody>
            {grouped.map(([country, countryTutors]) => (
              <> 
                <tr key={`group-${country}`} className="bg-primary/5 border-t border-border">
                  <td colSpan={3} className="px-4 py-2 font-semibold text-sm">
                    {tutorCountryFlags[country] || ""} {country}
                  </td>
                </tr>
                {countryTutors.map((tutor, idx) => (
                  <tr key={tutor.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5 font-medium">{tutor.name}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{tutor.contactNumber}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{tutor.email}</td>
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
