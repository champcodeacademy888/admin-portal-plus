import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import FilterTabs from "@/components/FilterTabs";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";

const trials = [
  { lead: "Priya Nair", class: "Python L1 — Sat 10:00", scheduled: "28 Mar 2026, 10:00", country: "SG", channel: "Whatsapp", tutor: "Alex Lim", outcome: "UPCOMING", notes: "Parent prefers weekend" },
  { lead: "Sofia Reyes", class: "Scratch L0 — Sun 14:00", scheduled: "22 Mar 2026, 14:00", country: "PH", channel: "Messenger", tutor: "Jamie Koh", outcome: "ATTENDED", notes: "Very engaged" },
  { lead: "James Wong", class: "Web L2 — Wed 16:30", scheduled: "20 Mar 2026, 16:30", country: "HK", channel: "Whatsapp", tutor: "Alex Lim", outcome: "NO SHOW", notes: "Reschedule requested" },
];

const variantMap: Record<string, "upcoming" | "attended" | "noshow"> = {
  "UPCOMING": "upcoming", "ATTENDED": "attended", "NO SHOW": "noshow",
};

const tabs = [
  { label: "All", count: 30 }, { label: "Upcoming", count: 13 }, { label: "Attended", count: 12 }, { label: "No Show", count: 5 },
];

const columns = [
  { key: "lead", header: "Lead" },
  { key: "class", header: "Class" },
  { key: "scheduled", header: "Scheduled" },
  { key: "country", header: "Country" },
  { key: "channel", header: "Channel" },
  { key: "tutor", header: "Tutor" },
  { key: "outcome", header: "Outcome", render: (r: typeof trials[0]) => <StatusBadge variant={variantMap[r.outcome]}>{r.outcome}</StatusBadge> },
  { key: "notes", header: "Notes" },
];

export default function TrialsPage() {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <div>
      <PageHeader title="Trials" subtitle="Manage trial classes and outcomes" />
      <FilterTabs tabs={tabs} activeIndex={activeTab} onChange={setActiveTab} />
      <DataTable columns={columns} data={trials} totalItems={3} />
    </div>
  );
}
