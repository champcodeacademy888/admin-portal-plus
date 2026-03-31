import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import FilterTabs from "@/components/FilterTabs";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Search } from "lucide-react";

const leads = [
  { name: "Asela Perera", status: "LEAD", country: "Sri Lanka", channel: "Wati", source: "Meta Ads (Facebook)", age: 10, level: "—", package: "recu4gJHXVGB0YWlf", lostReason: "—", created: "22 Jan 2026" },
  { name: "MA E Cuison", status: "LEAD", country: "Philippines", channel: "Fb", source: "Meta Ads (Facebook)", age: 11, level: "—", package: "—", lostReason: "—", created: "12 Feb 2026" },
  { name: "Sid Pelaez", status: "LEAD", country: "Philippines", channel: "Fb", source: "Meta Ads (Facebook)", age: 7, level: "—", package: "—", lostReason: "—", created: "16 Feb 2026" },
  { name: "Anna Salutan", status: "TRIAL ATTENDED", country: "Philippines", channel: "Fb", source: "Meta Ads (Facebook)", age: 7, level: "—", package: "—", lostReason: "Busy Schedule", created: "9 Jan 2026" },
  { name: "Facebook user", status: "LEAD", country: "Philippines", channel: "Fb", source: "Meta Ads (Facebook)", age: 12, level: "—", package: "—", lostReason: "—", created: "28 Feb 2026" },
  { name: "Leonard Bryan Tria Osi", status: "LEAD", country: "Philippines", channel: "Fb", source: "Meta Ads (Facebook)", age: 9, level: "—", package: "—", lostReason: "—", created: "23 Feb 2026" },
  { name: "Aileen Jereza Deloverges", status: "NO SHOW", country: "Philippines", channel: "Fb", source: "—", age: 8, level: "—", package: "—", lostReason: "—", created: "8 Jan 2026" },
  { name: "Trend Tech Services", status: "LEAD", country: "Malaysia", channel: "Wati", source: "Meta Ads (Whatsapp)", age: 11, level: "—", package: "—", lostReason: "—", created: "3 Feb 2026" },
  { name: "Daniella De vos", status: "LEAD", country: "Sri Lanka", channel: "Wati", source: "Meta Ads (Form)", age: 9, level: "—", package: "—", lostReason: "—", created: "20 Mar 2026" },
  { name: "Sad Summer", status: "NO SHOW", country: "Philippines", channel: "Fb", source: "Meta Ads (Facebook)", age: 8, level: "—", package: "—", lostReason: "—", created: "22 Dec 2025" },
];

const statusVariantMap: Record<string, "lead" | "trial_attended" | "noshow" | "enrolled" | "lost" | "cold" | "trial_arranged" | "inquiry"> = {
  "LEAD": "lead",
  "TRIAL ATTENDED": "trial_attended",
  "NO SHOW": "noshow",
  "ENROLLED": "enrolled",
  "LOST": "lost",
  "COLD": "cold",
  "TRIAL ARRANGED": "trial_arranged",
  "INQUIRY": "inquiry",
};

const tabs = [
  { label: "All", count: 24706 },
  { label: "Inquiry" },
  { label: "Lead" },
  { label: "Trial Arranged" },
  { label: "Trial Attended" },
  { label: "No Show" },
  { label: "Enrolled" },
  { label: "Lost" },
  { label: "Cold" },
];

const columns = [
  { key: "name", header: "Parent Name" },
  { key: "status", header: "Status", render: (r: typeof leads[0]) => <StatusBadge variant={statusVariantMap[r.status] || "lead"}>{r.status}</StatusBadge> },
  { key: "country", header: "Country" },
  { key: "channel", header: "Channel" },
  { key: "source", header: "Source" },
  { key: "age", header: "Age" },
  { key: "level", header: "Level" },
  { key: "package", header: "Package" },
  { key: "lostReason", header: "Lost Reason" },
  { key: "created", header: "Created" },
];

export default function LeadsPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      <PageHeader title="Leads" subtitle="Manage leads pipeline — inquiry to enrolment">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input className="pl-9 pr-4 py-2 border border-border rounded-lg text-sm bg-background placeholder:text-muted-foreground w-64" placeholder="Search leads..." />
        </div>
      </PageHeader>
      <FilterTabs tabs={tabs} activeIndex={activeTab} onChange={setActiveTab} />
      <DataTable columns={columns} data={leads} totalItems={24706} currentPage={1} totalPages={2471} />
    </div>
  );
}
