import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { packages } from "@/pages/PackagesPage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

const countryFlags: Record<string, string> = {
  "SG": "🇸🇬", "MY": "🇲🇾", "PH": "🇵🇭", "AE": "🇦🇪", "AU": "🇦🇺", "LK": "🇱🇰", "HK": "🇭🇰",
};

const packageOptions = packages.filter(p => p.active).map(p => ({ id: p.id, label: `${p.name} (${p.currency} ${p.totalAmount.toLocaleString()})` }));

const data = [
  { name: "Ethan Goh", status: "ENROLLED", country: "MY", channel: "Whatsapp", age: 10, level: "Intermediate", packageId: 18, package: "MY 8 weeks with RM 10 deposit", enrolled: "15 Mar 2026", handedOff: true },
  { name: "Chloe Ng", status: "ENROLLED", country: "SG", channel: "Messenger", age: 9, level: "Beginner", packageId: 12, package: "SG 8 weeks ($40)", enrolled: "12 Mar 2026", handedOff: true },
  { name: "Ravi Menon", status: "ENROLLED", country: "PH", channel: "Whatsapp", age: 11, level: "Advanced", packageId: 1, package: "PH 8 weeks", enrolled: "08 Mar 2026", handedOff: false },
  { name: "Mike Chen", status: "ENROLLED", country: "SG", channel: "Whatsapp", age: 10, level: "Advanced", packageId: 12, package: "SG 8 weeks ($40)", enrolled: "30 Mar 2026", handedOff: false },
];

const columns = [
  { key: "name", header: "Name", render: (r: typeof data[0]) => <span className="font-medium">{r.name}</span> },
  { key: "status", header: "Status", render: (r: typeof data[0]) => (
    <div className="flex items-center gap-1.5">
      <StatusBadge variant="enrolled">{r.status}</StatusBadge>
      {r.handedOff && <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-success/15 text-success">Handed Off</span>}
    </div>
  )},
  { key: "country", header: "Country", render: (r: typeof data[0]) => <span>{countryFlags[r.country] || "🌍"} {r.country}</span> },
  { key: "channel", header: "Channel" },
  { key: "age", header: "Age" },
  { key: "level", header: "Level" },
  { key: "package", header: "Package", render: (r: typeof data[0]) => {
    const pkg = packages.find(p => p.id === r.packageId);
    return (
      <div>
        <span className="font-medium text-sm">{r.package}</span>
        {pkg && <span className="block text-xs text-muted-foreground">{pkg.currency} {pkg.totalAmount.toLocaleString()} · {pkg.numberOfLessons} lessons</span>}
      </div>
    );
  }},
  { key: "enrolled", header: "Enrolled" },
];

export default function EnrolmentsPage() {
  const [search, setSearch] = useState("");

  const filtered = data.filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.package.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader title="Enrolments" subtitle="Recently converted leads">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            className="pl-9 pr-4 py-2 border border-border rounded-lg text-sm bg-background placeholder:text-muted-foreground w-64"
            placeholder="Search enrolments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </PageHeader>
      <DataTable columns={columns as any} data={filtered as any} totalItems={filtered.length} />
    </div>
  );
}
