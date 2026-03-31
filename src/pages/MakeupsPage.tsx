import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import FilterTabs from "@/components/FilterTabs";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";

const data = [
  { student: "Ethan Tan", class: "Scratch", status: "SCHEDULED", reason: "Sick", originalDate: "17 Mar 2026", makeupDate: "28 Mar 2026", tutor: "Arun Sharma", country: "SG" },
  { student: "Chloe Lim", class: "Python", status: "SCHEDULED", reason: "Family event", originalDate: "15 Mar 2026", makeupDate: "30 Mar 2026", tutor: "Rizal Hakim", country: "MY" },
  { student: "Arjun Menon", class: "Web Development", status: "SCHEDULED", reason: "School exam", originalDate: "13 Mar 2026", makeupDate: "1 Apr 2026", tutor: "Maria Santos", country: "PH" },
  { student: "Sofia Reyes", class: "Game Design", status: "SCHEDULED", reason: "Holiday", originalDate: "11 Mar 2026", makeupDate: "3 Apr 2026", tutor: "Dewi Putri", country: "ID" },
  { student: "Daniel Wong", class: "Roblox", status: "SCHEDULED", reason: "Schedule conflict", originalDate: "9 Mar 2026", makeupDate: "5 Apr 2026", tutor: "Fatima Al-Hassan", country: "AE" },
  { student: "Aisha Rahman", class: "App Development", status: "COMPLETED", reason: "Sick", originalDate: "7 Mar 2026", makeupDate: "15 Mar 2026", tutor: "Jason Lau", country: "HK" },
  { student: "Lucas Ng", class: "Scratch", status: "COMPLETED", reason: "Family event", originalDate: "5 Mar 2026", makeupDate: "13 Mar 2026", tutor: "Nuwan Perera", country: "LK" },
  { student: "Priya Sharma", class: "Python", status: "COMPLETED", reason: "School exam", originalDate: "3 Mar 2026", makeupDate: "11 Mar 2026", tutor: "Mei Ling Tan", country: "SG" },
  { student: "Ryan Chong", class: "Web Development", status: "COMPLETED", reason: "Holiday", originalDate: "1 Mar 2026", makeupDate: "9 Mar 2026", tutor: "Rizal Hakim", country: "MY" },
  { student: "Hannah Goh", class: "Python", status: "PENDING", reason: "Travel", originalDate: "28 Feb 2026", makeupDate: "—", tutor: "Mei Ling Tan", country: "HK" },
];

const statusMap: Record<string, "scheduled" | "completed" | "pending"> = { SCHEDULED: "scheduled", COMPLETED: "completed", PENDING: "pending" };

const tabs = [
  { label: "All", count: 15 }, { label: "Scheduled", count: 5 }, { label: "Completed", count: 5 }, { label: "Pending", count: 3 }, { label: "No Show", count: 2 },
];

const columns = [
  { key: "student", header: "Student" },
  { key: "class", header: "Class" },
  { key: "status", header: "Status", render: (r: typeof data[0]) => <StatusBadge variant={statusMap[r.status]}>{r.status}</StatusBadge> },
  { key: "reason", header: "Reason" },
  { key: "originalDate", header: "Original Date" },
  { key: "makeupDate", header: "Makeup Date" },
  { key: "tutor", header: "Tutor" },
  { key: "country", header: "Country" },
];

export default function MakeupsPage() {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <div>
      <PageHeader title="Makeups" subtitle="Manage makeup class requests and scheduling" />
      <FilterTabs tabs={tabs} activeIndex={activeTab} onChange={setActiveTab} />
      <DataTable columns={columns} data={data} totalItems={15} currentPage={1} totalPages={2} />
    </div>
  );
}
