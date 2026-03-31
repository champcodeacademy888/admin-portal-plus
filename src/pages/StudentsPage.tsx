import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import FilterTabs from "@/components/FilterTabs";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Search } from "lucide-react";

const students = [
  { student: "Lucas Ho", status: "ACTIVE", country: "SG", class: "Python L2", age: 10, level: "Intermediate", teacher: "Alex Lim", lessonsLeft: "4/11", lessonsPercent: 36, expiry: "12 Jun 2026", churnReason: "—" },
  { student: "Emma Chen", status: "ACTIVE", country: "HK", class: "Web L1", age: 12, level: "Beginner", teacher: "Jamie Koh", lessonsLeft: "7/17", lessonsPercent: 41, expiry: "01 Aug 2026", churnReason: "—" },
  { student: "Noah Patel", status: "ACTIVE", country: "MY", class: "Scratch L0", age: 7, level: "Beginner", teacher: "Sam Ong", lessonsLeft: "1/5", lessonsPercent: 20, expiry: "20 Apr 2026", churnReason: "—" },
  { student: "Isla Bautista", status: "CHURNED", country: "PH", class: "Python L1", age: 9, level: "Beginner", teacher: "Alex Lim", lessonsLeft: "8/8", lessonsPercent: 100, expiry: "02 Feb 2026", churnReason: "Schedule conflict" },
  { student: "Marcus Teo", status: "RETURN", country: "SG", class: "Web L2", age: 11, level: "Intermediate", teacher: "Jamie Koh", lessonsLeft: "2/12", lessonsPercent: 17, expiry: "30 Sep 2026", churnReason: "—" },
];

const statusMap: Record<string, "active" | "churned" | "return"> = { ACTIVE: "active", CHURNED: "churned", RETURN: "return" };

const tabs = [
  { label: "All", count: 40 }, { label: "Active", count: 30 }, { label: "Churned", count: 6 }, { label: "Return", count: 4 },
];

function LessonsBar({ percent, label }: { percent: number; label: string }) {
  const color = percent >= 80 ? "bg-success" : percent >= 40 ? "bg-warning" : "bg-destructive";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }} />
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

const columns = [
  { key: "student", header: "Student" },
  { key: "status", header: "Status", render: (r: typeof students[0]) => <StatusBadge variant={statusMap[r.status]}>{r.status}</StatusBadge> },
  { key: "country", header: "Country" },
  { key: "class", header: "Class" },
  { key: "age", header: "Age" },
  { key: "level", header: "Level" },
  { key: "teacher", header: "Teacher" },
  { key: "lessonsLeft", header: "Lessons Left", render: (r: typeof students[0]) => <LessonsBar percent={r.lessonsPercent} label={r.lessonsLeft} /> },
  { key: "expiry", header: "Expiry" },
  { key: "churnReason", header: "Churn Reason" },
];

export default function StudentsPage() {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <div>
      <PageHeader title="Students" subtitle="Manage enrolled students">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input className="pl-9 pr-4 py-2 border border-border rounded-lg text-sm bg-background placeholder:text-muted-foreground w-64" placeholder="Search students..." />
        </div>
      </PageHeader>
      <FilterTabs tabs={tabs} activeIndex={activeTab} onChange={setActiveTab} />
      <DataTable columns={columns} data={students} totalItems={5} />
    </div>
  );
}
