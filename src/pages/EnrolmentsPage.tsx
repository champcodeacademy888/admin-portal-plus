import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { packages } from "@/pages/PackagesPage";
import { Search, Phone, MessageCircle, Eye, ArrowRight } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { getChildrenByStatus, countryFlags, type ChildWithParent } from "@/data/parentsData";

const enrolledChildren = getChildrenByStatus("ENROLLED");

function ChannelIcon({ channel }: { channel: string }) {
  if (channel === "WhatsApp") return (
    <span className="inline-flex items-center gap-1.5 text-success text-xs font-medium">
      <Phone size={14} /> WhatsApp
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 text-info text-xs font-medium">
      <MessageCircle size={14} /> Messenger
    </span>
  );
}

const columns = [
  {
    key: "student", header: "Student", render: (r: ChildWithParent) => (
      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground font-mono">{r.id}</span>
          <span className="font-medium">{r.name}</span>
          {r.handedOff && <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-success/15 text-success">Handed Off</span>}
        </div>
        <div className="text-[11px] text-muted-foreground mt-0.5">Age {r.age} · {r.level}</div>
      </div>
    ),
  },
  {
    key: "parent", header: "Parent", render: (r: ChildWithParent) => (
      <div>
        <span className="text-[11px] text-muted-foreground font-mono mr-1">{r.parent.id}</span>
        <span className="font-medium">{r.parent.name}</span>
      </div>
    ),
  },
  { key: "status", header: "Status", render: () => <StatusBadge variant="enrolled">ENROLLED</StatusBadge> },
  { key: "country", header: "Country", render: (r: ChildWithParent) => <span>{countryFlags[r.parent.country] || "🌍"} {r.parent.country}</span> },
  { key: "channel", header: "Channel", render: (r: ChildWithParent) => <ChannelIcon channel={r.parent.channel} /> },
  {
    key: "package", header: "Package", render: (r: ChildWithParent) => (
      <span className="text-sm">{r.packageInterest || "—"}</span>
    ),
  },
  { key: "enrolled", header: "Enrolled", render: (r: ChildWithParent) => <span>{r.enrolledDate || "—"}</span> },
  {
    key: "actions", header: "", render: (r: ChildWithParent) => (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <button className="p-1.5 rounded-md hover:bg-muted text-success" title="WhatsApp"><Phone size={15} /></button>
        <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground" title="View"><Eye size={15} /></button>
      </div>
    ),
  },
];

export default function EnrolmentsPage() {
  const [search, setSearch] = useState("");
  const [selectedChild, setSelectedChild] = useState<ChildWithParent | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const filtered = enrolledChildren.filter(c =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.parent.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Enrolments" subtitle="Students who have been enrolled">
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
      <DataTable
        columns={columns as any}
        data={filtered as any}
        totalItems={filtered.length}
        onRowClick={(row) => { setSelectedChild(row as unknown as ChildWithParent); setPanelOpen(true); }}
      />

      <Sheet open={panelOpen} onOpenChange={setPanelOpen}>
        <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto p-0">
          {selectedChild && (
            <div className="flex flex-col h-full">
              <SheetHeader className="px-6 py-5 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-mono">{selectedChild.id}</span>
                  <SheetTitle className="text-lg">{selectedChild.name}</SheetTitle>
                  <StatusBadge variant="enrolled">ENROLLED</StatusBadge>
                </div>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground text-xs block mb-1">Age</span><span>{selectedChild.age}</span></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Level</span><span>{selectedChild.level}</span></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Package</span><span>{selectedChild.packageInterest || "—"}</span></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Enrolled</span><span>{selectedChild.enrolledDate || "—"}</span></div>
                </div>
                <div className="border-t border-border pt-4">
                  <h3 className="text-sm font-semibold mb-2">Parent</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-muted-foreground text-xs block mb-1">Name</span><span className="font-medium">{selectedChild.parent.name}</span></div>
                    <div><span className="text-muted-foreground text-xs block mb-1">Phone</span><span>{selectedChild.parent.phone}</span></div>
                    <div><span className="text-muted-foreground text-xs block mb-1">Country</span><span>{countryFlags[selectedChild.parent.country] || "🌍"} {selectedChild.parent.country}</span></div>
                    <div><span className="text-muted-foreground text-xs block mb-1">Channel</span><ChannelIcon channel={selectedChild.parent.channel} /></div>
                  </div>
                </div>
              </div>
              <div className="border-t border-border px-6 py-4">
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2.5 border border-success text-success rounded-lg text-sm font-medium hover:bg-success/10 flex items-center justify-center gap-1.5">
                    <Phone size={14} /> WhatsApp
                  </button>
                  <button className="flex-1 px-4 py-2.5 border border-info text-info rounded-lg text-sm font-medium hover:bg-info/10 flex items-center justify-center gap-1.5">
                    <MessageCircle size={14} /> Messenger
                  </button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
