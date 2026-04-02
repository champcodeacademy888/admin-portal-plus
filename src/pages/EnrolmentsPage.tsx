import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import FilterTabs from "@/components/FilterTabs";
import { Search, Phone, MessageCircle, Eye, Filter, Minimize2, Maximize2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getChildrenByStatus, countryFlags, programs, lessonDays, type ChildWithParent } from "@/data/parentsData";
import { cn } from "@/lib/utils";

const enrolledChildren = getChildrenByStatus("ENROLLED", "CLOSED WON").filter(
  c => c.packageInterest !== "Trial only"
);

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

const enrolmentStatusVariantMap: Record<string, Parameters<typeof StatusBadge>[0]["variant"]> = {
  Enrolled: "enrolled",
  Paused: "pending",
  "Pending Pause": "pending",
  "Pending Complete": "upcoming",
  Complete: "completed",
  "To Confirm": "scheduled",
};

const programStatusVariantMap: Record<string, Parameters<typeof StatusBadge>[0]["variant"]> = {
  Transferred: "upcoming",
  Complete: "completed",
  Incomplete: "pending",
};

const columns = [
  {
    key: "student", header: "Student", render: (r: ChildWithParent) => (
      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground font-mono">{r.id}</span>
          <span className="font-medium">{r.name}</span>
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
  {
    key: "programStatus", header: "Program Status", render: (r: ChildWithParent) => {
      const value = r.programStatus || "Incomplete";
      return <StatusBadge variant={programStatusVariantMap[value]}>{value}</StatusBadge>;
    },
  },
  {
    key: "enrolmentStatus", header: "Enrolment Status", render: (r: ChildWithParent) => {
      const value = r.enrolmentStatus || "Enrolled";
      return <StatusBadge variant={enrolmentStatusVariantMap[value]}>{value}</StatusBadge>;
    },
  },
  {
    key: "program", header: "Program", render: (r: ChildWithParent) => (
      <span className="text-sm">{r.program || "—"}</span>
    ),
  },
  {
    key: "lessonDay", header: "Lesson Day", render: (r: ChildWithParent) => (
      <span className="text-sm">{r.lessonDay || "—"}</span>
    ),
  },
  {
    key: "tutor", header: "Tutor", render: (r: ChildWithParent) => (
      <span className="text-sm">{r.tutor || "—"}</span>
    ),
  },
  {
    key: "lessonStartDate", header: "Lesson Start Date", render: (r: ChildWithParent) => (
      <span className="text-sm">{r.lessonStartDate || "—"}</span>
    ),
  },
  {
    key: "lessonPauseDate", header: "Lesson Pause Date", render: (r: ChildWithParent) => (
      <span className="text-sm">{
        r.enrolmentStatus === "Paused" || r.enrolmentStatus === "Pending Pause"
          ? r.lessonPauseDate || "—"
          : "—"
      }</span>
    ),
  },
  {
    key: "lessonsCompleted", header: "Lessons Completed", render: (r: ChildWithParent) => (
      <span className="text-sm">{r.lessonsCompleted ?? "—"}</span>
    ),
  },
  {
    key: "psid", header: "PSID", render: (r: ChildWithParent) => (
      <span className="text-xs text-muted-foreground font-mono">{r.parent.psid || "—"}</span>
    ),
  },
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

const statusTabs = [
  { label: "All", statuses: ["Enrolled", "Paused", "Pending Pause", "Pending Complete", "Complete", "To Confirm"] },
  { label: "Enrolled", statuses: ["Enrolled"] },
  { label: "Paused", statuses: ["Paused"] },
  { label: "Pending Pause", statuses: ["Pending Pause"] },
  { label: "Pending Complete", statuses: ["Pending Complete"] },
  { label: "Complete", statuses: ["Complete"] },
  { label: "To Confirm", statuses: ["To Confirm"] },
];

export default function EnrolmentsPage() {
  const [search, setSearch] = useState("");
  const [selectedChild, setSelectedChild] = useState<ChildWithParent | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [programFilter, setProgramFilter] = useState<string>("all");
  const [dayFilter, setDayFilter] = useState<string>("all");
  const [compact, setCompact] = useState(true);

  const filtered = enrolledChildren.filter(c => {
    const tab = statusTabs[activeTab];
    if (!tab.statuses.includes(c.enrolmentStatus || "Enrolled")) return false;
    if (programFilter !== "all" && c.program !== programFilter) return false;
    if (dayFilter !== "all" && c.lessonDay !== dayFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.parent.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
    }
    return true;
  });

  const tabs = statusTabs.map(t => ({
    label: t.label,
    count: enrolledChildren.filter(c => t.statuses.includes(c.enrolmentStatus || "Enrolled")).length,
  }));

  const effectiveColumnKeys = compact
    ? new Set(["student", "enrolmentStatus", "program", "tutor", "lessonStartDate", "lessonPauseDate", "lessonsCompleted", "country", "channel", "actions"])
    : null;

  const filteredColumns = effectiveColumnKeys
    ? columns.filter(column => effectiveColumnKeys.has(column.key))
    : columns;

  return (
    <div>
      <PageHeader title="Enrolments" subtitle={`${enrolledChildren.length} enrolled students`}>
        <div className="flex items-center gap-3">
          <Select value={programFilter} onValueChange={setProgramFilter}>
            <SelectTrigger className="w-48 text-sm">
              <Filter size={14} className="mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="All Programs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Programs</SelectItem>
              {programs.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={dayFilter} onValueChange={setDayFilter}>
            <SelectTrigger className="w-40 text-sm">
              <SelectValue placeholder="All Days" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Days</SelectItem>
              {lessonDays.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              className="pl-9 pr-4 py-2 border border-border rounded-lg text-sm bg-background placeholder:text-muted-foreground w-64"
              placeholder="Search enrolments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setCompact(!compact)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm transition-colors",
              compact ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted text-muted-foreground"
            )}
            title={compact ? "Standard view" : "Compact view"}
          >
            {compact ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
            {compact ? "Standard" : "Compact"}
          </button>
        </div>
      </PageHeader>

      <FilterTabs tabs={tabs} activeIndex={activeTab} onChange={setActiveTab} />

      <div className={compact ? "[&_td]:py-1.5 [&_th]:py-2" : ""}>
        <DataTable
          columns={filteredColumns as any}
          data={filtered as any}
          totalItems={filtered.length}
          onRowClick={(row) => { setSelectedChild(row as unknown as ChildWithParent); setPanelOpen(true); }}
        />
      </div>

      <Sheet open={panelOpen} onOpenChange={setPanelOpen}>
        <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto p-0">
          {selectedChild && (
            <div className="flex flex-col h-full">
              <SheetHeader className="px-6 py-5 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-mono">{selectedChild.id}</span>
                  <SheetTitle className="text-lg">{selectedChild.name}</SheetTitle>
                  <StatusBadge variant={enrolmentStatusVariantMap[selectedChild.enrolmentStatus || "Enrolled"]}>{selectedChild.enrolmentStatus || "Enrolled"}</StatusBadge>
                </div>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground text-xs block mb-1">Age</span><span>{selectedChild.age}</span></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Level</span><span>{selectedChild.level}</span></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Program Status</span><span>{selectedChild.programStatus || "Incomplete"}</span></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Enrolment Status</span><span>{selectedChild.enrolmentStatus || "Enrolled"}</span></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Program</span><span>{selectedChild.program || "—"}</span></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Lesson Day</span><span>{selectedChild.lessonDay || "—"}</span></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Tutor</span><span>{selectedChild.tutor || "—"}</span></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Lesson Start Date</span><span>{selectedChild.lessonStartDate || "—"}</span></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Lesson Pause Date</span><span>{selectedChild.enrolmentStatus === "Paused" || selectedChild.enrolmentStatus === "Pending Pause" ? selectedChild.lessonPauseDate || "—" : "—"}</span></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Package</span><span>{selectedChild.packageInterest || "—"}</span></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Lessons Completed</span><span>{selectedChild.lessonsCompleted ?? "—"}</span></div>
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
