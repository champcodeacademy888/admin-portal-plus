import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import FilterTabs from "@/components/FilterTabs";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Search, MessageCircle, Eye, MoreHorizontal, X, Phone, SlidersHorizontal, AlertTriangle, Calendar, ArrowRight, Download, Users, TrendingUp, LayoutGrid, List, Columns3 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { parents, countryFlags, todayFormatted, type Parent, type ChildWithParent, type ChildStatus, type AIStatus, getAllChildren } from "@/data/parentsData";

const today = new Date();
const todayStr = todayFormatted;

const LOST_REASONS = ["Price", "Timing", "Chose competitor", "Not interested", "No response", "Other"];

// Lead statuses (pre-enrollment pipeline)
const leadStatuses: ChildStatus[] = ["INQUIRY", "LEAD", "TRIAL ARRANGED", "TRIAL DONE", "MISSED TRIAL", "CLOSED WON", "LOST"];

// Get all children in lead pipeline stages
const allLeadChildren = getAllChildren().filter(c => leadStatuses.includes(c.status));

const needsAttention = (c: ChildWithParent) =>
  (c.parent.channel === "Messenger" && c.parent.lastContactedHrs >= 20) ||
  (c.status === "TRIAL DONE" && (c.hoursSinceTrial ?? c.parent.lastContactedHrs) >= 24) ||
  (c.status === "MISSED TRIAL") ||
  (c.status === "TRIAL ARRANGED" && c.trialPassed && !c.trialOutcomeMarked) ||
  (c.parent.reengagementDate && new Date(c.parent.reengagementDate) <= today);

const needsAttentionCount = allLeadChildren.filter(needsAttention).length;

const statusVariantMap: Record<string, string> = {
  "LEAD": "lead", "TRIAL DONE": "trial_attended", "MISSED TRIAL": "noshow",
  "ENROLLED": "enrolled", "CLOSED WON": "closed_won", "LOST": "lost",
  "TRIAL ARRANGED": "trial_arranged", "INQUIRY": "inquiry",
};

const tabs = [
  { label: "All", count: allLeadChildren.length },
  { label: "Needs Attention", badgeCount: needsAttentionCount, badgeColor: "bg-destructive" },
  { label: "Inquiry" }, { label: "Lead" }, { label: "Trial Arranged" },
  { label: "Trial Done" }, { label: "Missed Trial" }, { label: "Closed Won" },
  { label: "Lost" },
];

const statusFilterMap: Record<string, string> = {
  "Inquiry": "INQUIRY", "Lead": "LEAD", "Trial Arranged": "TRIAL ARRANGED",
  "Trial Done": "TRIAL DONE", "Missed Trial": "MISSED TRIAL", "Closed Won": "CLOSED WON",
  "Lost": "LOST",
};

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

function AIStatusBadge({ status }: { status: AIStatus }) {
  const styles = {
    active: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
    admin: "bg-info/15 text-info",
    completed: "bg-muted text-muted-foreground",
  };
  const labels = { active: "Active", admin: "Admin", completed: "Completed" };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}>{labels[status]}</span>;
}

function FollowUpBadge({ hoursSinceTrial }: { hoursSinceTrial: number }) {
  if (hoursSinceTrial < 12) return <span className="ml-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-warning/15 text-warning">Follow up due</span>;
  if (hoursSinceTrial <= 24) return <span className="ml-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-orange-500/15 text-orange-600">Follow up soon</span>;
  return <span className="ml-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-destructive/15 text-destructive">Overdue</span>;
}

function ConversionStatsBar() {
  const total = allLeadChildren.length;
  const inquiries = allLeadChildren.filter(l => l.status === "INQUIRY").length;
  const leadsCount = allLeadChildren.filter(l => l.status === "LEAD").length;
  const trialArranged = allLeadChildren.filter(l => l.status === "TRIAL ARRANGED").length;
  const trialDone = allLeadChildren.filter(l => l.status === "TRIAL DONE").length;
  // Enrolled children from all parents
  const enrolled = getAllChildren().filter(c => c.status === "ENROLLED").length;

  const inquiryToLead = inquiries + leadsCount > 0 ? Math.round((leadsCount / (inquiries + leadsCount)) * 100) : 0;
  const leadToTrial = leadsCount + trialArranged > 0 ? Math.round((trialArranged / (leadsCount + trialArranged)) * 100) : 0;
  const trialToEnrolled = trialDone + enrolled > 0 ? Math.round((enrolled / (trialDone + enrolled)) * 100) : 0;

  const stats = [
    { label: "Total Leads", value: total, icon: Users },
    { label: "Inquiry → Lead", value: `${inquiryToLead}%`, icon: TrendingUp },
    { label: "Lead → Trial", value: `${leadToTrial}%`, icon: TrendingUp },
    { label: "Trial → Enrolled", value: `${trialToEnrolled}%`, icon: TrendingUp },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {stats.map((s) => (
        <div key={s.label} className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <s.icon size={18} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-lg font-bold text-foreground">{s.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

const kanbanStatuses: ChildStatus[] = ["INQUIRY", "LEAD", "TRIAL ARRANGED", "TRIAL DONE", "MISSED TRIAL", "CLOSED WON", "LOST"];
const kanbanColors: Record<string, string> = {
  "INQUIRY": "border-t-info", "LEAD": "border-t-primary", "TRIAL ARRANGED": "border-t-warning",
  "TRIAL DONE": "border-t-purple-500", "MISSED TRIAL": "border-t-destructive",
  "CLOSED WON": "border-t-success", "LOST": "border-t-muted-foreground",
};

function KanbanView({ leads, onLeadClick }: { leads: ChildWithParent[]; onLeadClick: (lead: ChildWithParent) => void }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {kanbanStatuses.map((status) => {
        const statusLeads = leads.filter(l => l.status === status);
        return (
          <div key={status} className="min-w-[220px] w-[220px] shrink-0">
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{status}</h3>
              <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">{statusLeads.length}</span>
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {statusLeads.length === 0 && (
                <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">No leads</div>
              )}
              {statusLeads.slice(0, 50).map((lead, i) => (
                <div
                  key={i}
                  onClick={() => onLeadClick(lead)}
                  className={cn(
                    "rounded-lg border border-border bg-card p-3 cursor-pointer hover:shadow-md transition-shadow border-t-[3px]",
                    kanbanColors[status] || "border-t-border"
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground font-mono">{lead.id}</span>
                    <p className="text-sm font-medium truncate">{lead.name}</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">Parent: {lead.parent.name}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                    <span>{countryFlags[lead.parent.country] || "🌍"}</span>
                    <span>{lead.parent.channel}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[11px] text-muted-foreground">
                    <span>{lead.parent.lastContacted}</span>
                    <span>{lead.parent.assignedTo}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function LeadsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const [activeTab, setActiveTab] = useState(0);
  const [selectedChild, setSelectedChild] = useState<ChildWithParent | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [countryFilter, setCountryFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set([
    "student", "parent", "status", "country", "channel", "lastContacted", "assignedTo", "actions"
  ]));
  const [columnsOpen, setColumnsOpen] = useState(false);

  const allColumnKeys = [
    { key: "student", label: "Student" },
    { key: "parent", label: "Parent" },
    { key: "status", label: "Status" },
    { key: "country", label: "Country" },
    { key: "channel", label: "Channel" },
    { key: "lastContacted", label: "Last Contacted" },
    { key: "aiAgent", label: "AI Agent" },
    { key: "assignedTo", label: "Assigned To" },
    { key: "trialDate", label: "Trial Date" },
    { key: "packageInterest", label: "Package Interest" },
    { key: "age", label: "Age" },
    { key: "level", label: "Level" },
    { key: "actions", label: "Actions" },
  ];

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const [lostReasonOpen, setLostReasonOpen] = useState(false);
  const [lostReasonTarget, setLostReasonTarget] = useState<ChildWithParent | null>(null);
  const [selectedLostReason, setSelectedLostReason] = useState("");
  const [otherLostReason, setOtherLostReason] = useState("");
  const [reengageOpen, setReengageOpen] = useState(false);
  const [reengageTarget, setReengageTarget] = useState<ChildWithParent | null>(null);
  const [reengageDate, setReengageDate] = useState<Date | undefined>();
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false);
  const [bulkAssignOpen, setBulkAssignOpen] = useState(false);

  const filteredLeads = allLeadChildren.filter((child) => {
    const tab = tabs[activeTab].label;
    if (tab === "Needs Attention" && !needsAttention(child)) return false;
    if (tab !== "All" && tab !== "Needs Attention" && child.status !== statusFilterMap[tab]) return false;
    if (search && !child.name.toLowerCase().includes(search.toLowerCase()) && !child.parent.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (countryFilter !== "all" && child.parent.country !== countryFilter) return false;
    if (channelFilter !== "all" && child.parent.channel !== channelFilter) return false;
    return true;
  });

  const viewAll = currentPage === 0;
  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / pageSize));
  const paginatedLeads = viewAll ? filteredLeads : filteredLeads.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePageChange = (page: number) => {
    if (page === 0) setCurrentPage(0);
    else setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const openPanel = (child: ChildWithParent) => {
    setSelectedChild(child);
    setPanelOpen(true);
  };

  const isMessengerWarning = (c: ChildWithParent) => c.parent.channel === "Messenger" && c.parent.lastContactedHrs >= 20;

  const handleMarkAsLost = (c: ChildWithParent) => {
    setLostReasonTarget(c);
    setSelectedLostReason("");
    setOtherLostReason("");
    setLostReasonOpen(true);
  };

  const confirmLostReason = () => {
    if (!lostReasonTarget || !selectedLostReason) return;
    setLostReasonOpen(false);
    setLostReasonTarget(null);
  };

  const handleReengage = (c: ChildWithParent) => {
    setReengageTarget(c);
    setReengageDate(undefined);
    setReengageOpen(true);
  };

  const confirmReengage = () => {
    if (!reengageTarget || !reengageDate) return;
    setReengageOpen(false);
    setReengageTarget(null);
  };

  const exportSelectedCSV = () => {
    const selected = Array.from(selectedIndices).map(i => filteredLeads[i]).filter(Boolean);
    const headers = ["Student", "Parent", "Status", "Country", "Channel", "Age", "Level", "Assigned To"];
    const rows = selected.map(l => [l.name, l.parent.name, l.status, l.parent.country, l.parent.channel, l.age, l.level, l.parent.assignedTo]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "leads_export.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const trialDateColor = (c: ChildWithParent) => {
    if (!c.trialDate) return "";
    if (c.trialDate.startsWith(todayStr)) return "text-primary font-semibold";
    if (c.trialPassed && !c.trialOutcomeMarked) return "text-destructive font-semibold";
    return "";
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
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-muted-foreground font-mono">{r.parent.id}</span>
            <span className="font-medium">{r.parent.name}</span>
          </div>
        </div>
      ),
    },
    {
      key: "status", header: "Status", render: (r: ChildWithParent) => (
        <div className="flex items-center gap-1 flex-wrap">
          <StatusBadge variant={statusVariantMap[r.status] as any}>{r.status}</StatusBadge>
          {r.status === "TRIAL DONE" && r.hoursSinceTrial !== undefined && <FollowUpBadge hoursSinceTrial={r.hoursSinceTrial} />}
        </div>
      ),
    },
    { key: "country", header: "Country", render: (r: ChildWithParent) => <span className="whitespace-nowrap">{countryFlags[r.parent.country] || "🌍"} {r.parent.country}</span> },
    { key: "channel", header: "Channel", render: (r: ChildWithParent) => <ChannelIcon channel={r.parent.channel} /> },
    {
      key: "lastContacted", header: "Last Contacted", render: (r: ChildWithParent) => (
        <span className={isMessengerWarning(r) ? "text-destructive font-medium" : ""}>
          {r.parent.lastContacted}
          {isMessengerWarning(r) && <span className="ml-1.5 text-[11px] text-warning">⚠ 24hr window</span>}
        </span>
      ),
    },
    { key: "aiAgent", header: "AI Agent", render: (r: ChildWithParent) => <AIStatusBadge status={r.parent.aiAgent} /> },
    { key: "assignedTo", header: "Assigned To", render: (r: ChildWithParent) => <span>{r.parent.assignedTo}</span> },
    {
      key: "trialDate", header: "Trial Date", render: (r: ChildWithParent) => {
        if (r.status !== "TRIAL ARRANGED" || !r.trialDate) return <span className="text-muted-foreground">—</span>;
        return <span className={trialDateColor(r)}>{r.trialDate}</span>;
      },
    },
    {
      key: "packageInterest", header: "Package Interest", render: (r: ChildWithParent) => {
        if (r.status !== "TRIAL DONE") return <span className="text-muted-foreground">—</span>;
        return <span>{r.packageInterest || "—"}</span>;
      },
    },
    { key: "age", header: "Age", render: (r: ChildWithParent) => <span>{r.age}</span> },
    { key: "level", header: "Level", render: (r: ChildWithParent) => <span>{r.level}</span> },
    {
      key: "actions", header: "Actions", render: (r: ChildWithParent) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button className="p-1.5 rounded-md hover:bg-muted text-success" title="WhatsApp"><Phone size={15} /></button>
          <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground" title="View" onClick={() => openPanel(r)}><Eye size={15} /></button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"><MoreHorizontal size={15} /></button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleMarkAsLost(r)}>Mark as Lost</DropdownMenuItem>
              {r.status === "LOST" && (
                <DropdownMenuItem onClick={() => handleReengage(r)}>
                  <Calendar size={14} className="mr-2" /> Schedule Re-engagement
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const filteredColumns = columns.filter(col => visibleColumns.has(col.key));

  const tabEmptyMessages: Record<string, string> = {
    "Needs Attention": "No leads need attention right now 🎉",
    "Inquiry": "No inquiries at this stage",
    "Trial Arranged": "No trials arranged yet",
    "Trial Done": "No completed trials yet",
    "Missed Trial": "No missed trials — great!",
    "Lost": "No lost leads — keep it up!",
    "Cold": "No cold leads",
  };

  return (
    <div>
      <PageHeader title="Leads" subtitle="Student pipeline — inquiry to trial">
        <div className="flex items-center gap-3">
          {needsAttentionCount > 0 && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-warning bg-warning/10 px-3 py-1.5 rounded-full">
              <AlertTriangle size={13} />
              {needsAttentionCount} need attention
            </span>
          )}
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors">
                <SlidersHorizontal size={14} /> Filters
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="end">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Country</label>
                  <Select value={countryFilter} onValueChange={setCountryFilter}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      {Object.keys(countryFlags).map((c) => <SelectItem key={c} value={c}>{countryFlags[c]} {c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Channel</label>
                  <Select value={channelFilter} onValueChange={setChannelFilter}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Channels</SelectItem>
                      <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                      <SelectItem value="Messenger">Messenger</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <button onClick={() => { setCountryFilter("all"); setChannelFilter("all"); }} className="text-xs text-primary hover:underline">Reset filters</button>
              </div>
            </PopoverContent>
          </Popover>
          <Popover open={columnsOpen} onOpenChange={setColumnsOpen}>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors">
                <Columns3 size={14} /> Columns
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-52" align="end">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground mb-2">Toggle columns</p>
                {allColumnKeys.map((col) => (
                  <label key={col.key} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer text-sm">
                    <Checkbox checked={visibleColumns.has(col.key)} onCheckedChange={() => toggleColumn(col.key)} />
                    {col.label}
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("table")}
              className={cn("px-2.5 py-2 transition-colors", viewMode === "table" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground")}
              title="Table view"
            ><List size={15} /></button>
            <button
              onClick={() => setViewMode("kanban")}
              className={cn("px-2.5 py-2 transition-colors", viewMode === "kanban" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground")}
              title="Board view"
            ><LayoutGrid size={15} /></button>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              className="pl-9 pr-4 py-2 border border-border rounded-lg text-sm bg-background placeholder:text-muted-foreground w-64"
              placeholder="Search students or parents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </PageHeader>

      <ConversionStatsBar />

      <FilterTabs tabs={tabs} activeIndex={activeTab} onChange={(i) => { setActiveTab(i); setSelectedIndices(new Set()); setCurrentPage(1); }} />

      {viewMode === "table" ? (
        <DataTable
          columns={filteredColumns as any}
          data={paginatedLeads as any}
          totalItems={filteredLeads.length}
          currentPage={viewAll ? 1 : currentPage}
          totalPages={viewAll ? 1 : totalPages}
          onPageChange={handlePageChange}
          viewingAll={viewAll}
          onRowClick={(row) => openPanel(row as unknown as ChildWithParent)}
          rowClassName={(row) => {
            const r = row as unknown as ChildWithParent;
            return isMessengerWarning(r) ? "border-l-[3px] border-l-warning/70" : "";
          }}
          emptyMessage={tabEmptyMessages[tabs[activeTab].label] || "No leads at this stage"}
          selectable
          selectedIndices={selectedIndices}
          onSelectionChange={setSelectedIndices}
        />
      ) : (
        <KanbanView leads={filteredLeads} onLeadClick={openPanel} />
      )}

      {/* Bulk Action Bar */}
      {selectedIndices.size > 0 && (
        <div className="fixed bottom-0 left-64 right-0 bg-card border-t border-border shadow-lg px-6 py-3 flex items-center justify-between z-50">
          <span className="text-sm font-medium">{selectedIndices.size} student{selectedIndices.size > 1 ? "s" : ""} selected</span>
          <div className="flex items-center gap-2">
            <Popover open={bulkAssignOpen} onOpenChange={setBulkAssignOpen}>
              <PopoverTrigger asChild>
                <button className="px-3 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors">Assign to</button>
              </PopoverTrigger>
              <PopoverContent className="w-48" align="end">
                {["Sarah A.", "James L.", "Maria G."].map((admin) => (
                  <button key={admin} className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-md" onClick={() => setBulkAssignOpen(false)}>{admin}</button>
                ))}
              </PopoverContent>
            </Popover>
            <Popover open={bulkStatusOpen} onOpenChange={setBulkStatusOpen}>
              <PopoverTrigger asChild>
                <button className="px-3 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors">Change status</button>
              </PopoverTrigger>
              <PopoverContent className="w-48" align="end">
                {leadStatuses.map((s) => (
                  <button key={s} className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-md" onClick={() => setBulkStatusOpen(false)}>{s}</button>
                ))}
              </PopoverContent>
            </Popover>
            <button onClick={exportSelectedCSV} className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 flex items-center gap-1.5">
              <Download size={14} /> Export CSV
            </button>
            <button onClick={() => setSelectedIndices(new Set())} className="p-2 rounded-lg hover:bg-muted text-muted-foreground">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Student Detail Side Panel */}
      <Sheet open={panelOpen} onOpenChange={setPanelOpen}>
        <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto p-0">
          {selectedChild && (
            <div className="flex flex-col h-full">
              <SheetHeader className="px-6 py-5 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-mono">{selectedChild.id}</span>
                  <SheetTitle className="text-lg">{selectedChild.name}</SheetTitle>
                  <StatusBadge variant={statusVariantMap[selectedChild.status] as any}>{selectedChild.status}</StatusBadge>
                </div>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                {/* Student Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground text-xs block mb-1">Age</span><span className="font-medium">{selectedChild.age}</span></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Level</span><span>{selectedChild.level}</span></div>
                  {selectedChild.trialDate && <div><span className="text-muted-foreground text-xs block mb-1">Trial Date</span><span className={trialDateColor(selectedChild)}>{selectedChild.trialDate}</span></div>}
                  {selectedChild.packageInterest && <div><span className="text-muted-foreground text-xs block mb-1">Package Interest</span><span>{selectedChild.packageInterest}</span></div>}
                  {selectedChild.lostReason && <div><span className="text-muted-foreground text-xs block mb-1">Lost Reason</span><span>{selectedChild.lostReason}</span></div>}
                </div>

                {/* Parent Info */}
                <div className="border-t border-border pt-4">
                  <h3 className="text-sm font-semibold mb-2">Parent Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-muted-foreground text-xs block mb-1">Name</span><span className="font-medium">{selectedChild.parent.name}</span></div>
                    <div><span className="text-muted-foreground text-xs block mb-1">Phone</span><span>{selectedChild.parent.phone}</span></div>
                    <div><span className="text-muted-foreground text-xs block mb-1">Country</span><span>{countryFlags[selectedChild.parent.country] || "🌍"} {selectedChild.parent.country}</span></div>
                    <div><span className="text-muted-foreground text-xs block mb-1">Channel</span><ChannelIcon channel={selectedChild.parent.channel} /></div>
                    <div><span className="text-muted-foreground text-xs block mb-1">Source</span><span>{selectedChild.parent.source}</span></div>
                    <div><span className="text-muted-foreground text-xs block mb-1">Assigned To</span><span>{selectedChild.parent.assignedTo}</span></div>
                  </div>
                </div>

                {/* Siblings */}
                {selectedChild.parent.children.length > 1 && (
                  <div className="border-t border-border pt-4">
                    <h3 className="text-sm font-semibold mb-2">Siblings</h3>
                    <div className="space-y-2">
                      {selectedChild.parent.children.filter(c => c.id !== selectedChild.id).map((sib, i) => (
                        <div key={i} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                          <div>
                            <span className="text-[11px] text-muted-foreground font-mono mr-1.5">{sib.id}</span>
                            <span className="text-sm font-medium">{sib.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">Age {sib.age}</span>
                          </div>
                          <StatusBadge variant={statusVariantMap[sib.status] as any} className="text-[10px]">{sib.status}</StatusBadge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div className="border-t border-border pt-4">
                  <h3 className="text-sm font-semibold mb-3">Notes</h3>
                  <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                    {selectedChild.parent.notes.length === 0 && <p className="text-xs text-muted-foreground">No notes yet</p>}
                    {selectedChild.parent.notes.map((note, i) => (
                      <div key={i} className="bg-muted/50 rounded-lg p-3">
                        <p className="text-sm">{note.text}</p>
                        <p className="text-[11px] text-muted-foreground mt-1">{note.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 px-3 py-2 border border-border rounded-lg text-sm bg-background placeholder:text-muted-foreground"
                      placeholder="Add a note..."
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && setNoteText("")}
                    />
                    <button onClick={() => setNoteText("")} className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">Add</button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-border px-6 py-4 space-y-2">
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">Mark Trial Booked</button>
                  <button onClick={() => handleMarkAsLost(selectedChild)} className="flex-1 px-4 py-2.5 border border-destructive text-destructive rounded-lg text-sm font-medium hover:bg-destructive/10">Mark as Lost</button>
                </div>
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

      {/* Lost Reason Modal */}
      <Dialog open={lostReasonOpen} onOpenChange={setLostReasonOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Mark as Lost — Reason</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">Why was this lead lost?</p>
            <div className="grid grid-cols-2 gap-2">
              {LOST_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelectedLostReason(reason)}
                  className={cn(
                    "px-3 py-2 border rounded-lg text-sm transition-colors text-left",
                    selectedLostReason === reason
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  {reason}
                </button>
              ))}
            </div>
            {selectedLostReason === "Other" && (
              <input
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background placeholder:text-muted-foreground"
                placeholder="Specify reason..."
                value={otherLostReason}
                onChange={(e) => setOtherLostReason(e.target.value)}
              />
            )}
          </div>
          <DialogFooter>
            <button onClick={() => setLostReasonOpen(false)} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted">Cancel</button>
            <button
              onClick={confirmLostReason}
              disabled={!selectedLostReason || (selectedLostReason === "Other" && !otherLostReason.trim())}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:bg-destructive/90 disabled:opacity-50"
            >
              Confirm
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Re-engagement Date Picker Modal */}
      <Dialog open={reengageOpen} onOpenChange={setReengageOpen}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>Schedule Re-engagement</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-muted-foreground mb-3">Pick a reminder date for follow-up:</p>
            <CalendarComponent
              mode="single"
              selected={reengageDate}
              onSelect={setReengageDate}
              disabled={(d) => d < today}
              className="p-3 pointer-events-auto rounded-md border mx-auto"
            />
          </div>
          <DialogFooter>
            <button onClick={() => setReengageOpen(false)} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted">Cancel</button>
            <button onClick={confirmReengage} disabled={!reengageDate} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">Set Reminder</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
