import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import FilterTabs from "@/components/FilterTabs";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";

const data = [
  { student: "Ethan Tan", date: "27 Mar, 15:20", type: "MAKEUP", outcome: "ATTENDED", tutor: "Arun Sharma", country: "SG", notes: "Good progress" },
  { student: "Chloe Lim", date: "26 Mar, 15:20", type: "REGULAR", outcome: "ATTENDED", tutor: "Rizal Hakim", country: "MY", notes: "Completed module" },
  { student: "Arjun Menon", date: "25 Mar, 15:20", type: "REGULAR", outcome: "ABSENT", tutor: "Maria Santos", country: "PH", notes: "—" },
  { student: "Sofia Reyes", date: "24 Mar, 15:20", type: "REGULAR", outcome: "ATTENDED", tutor: "Dewi Putri", country: "ID", notes: "Excellent work" },
  { student: "Daniel Wong", date: "23 Mar, 15:20", type: "REGULAR", outcome: "NO SHOW", tutor: "Fatima Al-Hassan", country: "AE", notes: "—" },
];

const outcomeMap: Record<string, "attended" | "absent" | "noshow"> = { ATTENDED: "attended", ABSENT: "absent", "NO SHOW": "noshow" };
const typeMap: Record<string, "makeup" | "regular"> = { MAKEUP: "makeup", REGULAR: "regular" };

const tabs = [
  { label: "All", count: 60 }, { label: "Attended", count: 46 }, { label: "Absent", count: 13 }, { label: "No Show", count: 1 },
];

const columns = [
  { key: "student", header: "Student" },
  { key: "date", header: "Date" },
  { key: "type", header: "Type", render: (r: typeof data[0]) => <StatusBadge variant={typeMap[r.type]}>{r.type}</StatusBadge> },
  { key: "outcome", header: "Outcome", render: (r: typeof data[0]) => <span className={`font-semibold text-sm ${r.outcome === "ATTENDED" ? "text-success" : r.outcome === "ABSENT" ? "text-destructive" : "text-muted-foreground"}`}>{r.outcome}</span> },
  { key: "tutor", header: "Tutor" },
  { key: "country", header: "Country" },
  { key: "notes", header: "Notes" },
];

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <div>
      <PageHeader title="Attendance" subtitle="Mark and review class attendance" />
      <FilterTabs tabs={tabs} activeIndex={activeTab} onChange={setActiveTab} />
      <DataTable columns={columns} data={data} totalItems={5} />
    </div>
  );
}
