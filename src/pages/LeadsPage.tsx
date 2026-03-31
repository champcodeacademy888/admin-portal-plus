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
import { leads, todayFormatted, type Lead } from "@/data/leadsData";

const countryFlags: Record<string, string> = {
  "Singapore": "🇸🇬", "Malaysia": "🇲🇾", "Philippines": "🇵🇭", "Indonesia": "🇮🇩",
  "UAE": "🇦🇪", "Hong Kong": "🇭🇰", "Sri Lanka": "🇱🇰",
};

type AIStatus = "active" | "admin" | "completed";
type LeadStatus = "LEAD" | "TRIAL ATTENDED" | "NO SHOW" | "ENROLLED" | "LOST" | "COLD" | "TRIAL ARRANGED" | "INQUIRY";

const today = new Date();
const todayStr = todayFormatted;

const LOST_REASONS = ["Price", "Timing", "Chose competitor", "Not interested", "No response", "Other"];

const needsAttention = (lead: Lead) =>
  (lead.channel === "Messenger" && lead.lastContactedHrs >= 20) ||
  (lead.status === "TRIAL ATTENDED" && (lead.hoursSinceTrial ?? lead.lastContactedHrs) >= 24) ||
  (lead.status === "NO SHOW") ||
  (lead.status === "TRIAL ARRANGED" && lead.trialPassed && !lead.trialOutcomeMarked) ||
  (lead.reengagementDate && new Date(lead.reengagementDate) <= today);

const needsAttentionCount = leads.filter(needsAttention).length;

const statusVariantMap: Record<string, "lead" | "trial_attended" | "noshow" | "enrolled" | "lost" | "cold" | "trial_arranged" | "inquiry"> = {
  "LEAD": "lead", "TRIAL ATTENDED": "trial_attended", "NO SHOW": "noshow",
  "ENROLLED": "enrolled", "LOST": "lost", "COLD": "cold",
  "TRIAL ARRANGED": "trial_arranged", "INQUIRY": "inquiry",
};

const tabs = [
  { label: "All", count: leads.length },
  { label: "Needs Attention", badgeCount: needsAttentionCount, badgeColor: "bg-destructive" },
  { label: "Inquiry" }, { label: "Lead" }, { label: "Trial Arranged" },
  { label: "Trial Attended" }, { label: "No Show" }, { label: "Enrolled" },
  { label: "Lost" }, { label: "Cold" },
];

const statusFilterMap: Record<string, string> = {
  "Inquiry": "INQUIRY", "Lead": "LEAD", "Trial Arranged": "TRIAL ARRANGED",
  "Trial Attended": "TRIAL ATTENDED", "No Show": "NO SHOW",
  "Enrolled": "ENROLLED", "Lost": "LOST", "Cold": "COLD",
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
  const total = leads.length;
  const inquiries = leads.filter(l => l.status === "INQUIRY").length;
  const leadsCount = leads.filter(l => l.status === "LEAD").length;
  const trialArranged = leads.filter(l => l.status === "TRIAL ARRANGED").length;
  const trialAttended = leads.filter(l => l.status === "TRIAL ATTENDED").length;
  const enrolled = leads.filter(l => l.status === "ENROLLED").length;

  const inquiryToLead = inquiries + leadsCount > 0 ? Math.round((leadsCount / (inquiries + leadsCount)) * 100) : 0;
  const leadToTrial = leadsCount + trialArranged > 0 ? Math.round((trialArranged / (leadsCount + trialArranged)) * 100) : 0;
  const trialToEnrolled = trialAttended + enrolled > 0 ? Math.round((enrolled / (trialAttended + enrolled)) * 100) : 0;

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

export default function LeadsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const [activeTab, setActiveTab] = useState(0);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [leadNotes, setLeadNotes] = useState<Record<string, { text: string; time: string }[]>>({});
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [countryFilter, setCountryFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set([
    "name", "status", "country", "channel", "lastContacted", "aiAgent", "assignedTo", "actions"
  ]));
  const [columnsOpen, setColumnsOpen] = useState(false);

  const allColumnKeys = [
    { key: "name", label: "Parent Name" },
    { key: "status", label: "Status" },
    { key: "country", label: "Country" },
    { key: "channel", label: "Channel" },
    { key: "lastContacted", label: "Last Contacted" },
    { key: "aiAgent", label: "AI Agent" },
    { key: "assignedTo", label: "Assigned To" },
    { key: "trialDate", label: "Trial Date" },
    { key: "packageInterest", label: "Package Interest" },
    { key: "lastNote", label: "Last Note" },
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

  // Lost reason modal
  const [lostReasonOpen, setLostReasonOpen] = useState(false);
  const [lostReasonTarget, setLostReasonTarget] = useState<Lead | null>(null);
  const [selectedLostReason, setSelectedLostReason] = useState("");
  const [otherLostReason, setOtherLostReason] = useState("");

  // Re-engagement date picker
  const [reengageOpen, setReengageOpen] = useState(false);
  const [reengageTarget, setReengageTarget] = useState<Lead | null>(null);
  const [reengageDate, setReengageDate] = useState<Date | undefined>();

  // Handoff confirmation
  const [handoffOpen, setHandoffOpen] = useState(false);

  // Lead-level state overrides
  const [leadOverrides, setLeadOverrides] = useState<Record<string, Partial<Lead>>>({});

  // Bulk action bar state
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false);
  const [bulkAssignOpen, setBulkAssignOpen] = useState(false);

  const getLeadWithOverrides = (lead: Lead): Lead => ({ ...lead, ...leadOverrides[lead.name] });

  const filteredLeads = leads.map(getLeadWithOverrides).filter((lead) => {
    const tab = tabs[activeTab].label;
    if (tab === "Needs Attention" && !needsAttention(lead)) return false;
    if (tab !== "All" && tab !== "Needs Attention" && lead.status !== statusFilterMap[tab]) return false;
    if (search && !lead.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (countryFilter !== "all" && lead.country !== countryFilter) return false;
    if (channelFilter !== "all" && lead.channel !== channelFilter) return false;
    return true;
  });

  const viewAll = currentPage === 0;
  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / pageSize));
  const paginatedLeads = viewAll ? filteredLeads : filteredLeads.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePageChange = (page: number) => {
    if (page === 0) setCurrentPage(0);
    else setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const openPanel = (lead: Lead) => {
    setSelectedLead(lead);
    setPanelOpen(true);
  };

  const addNote = () => {
    if (!noteText.trim() || !selectedLead) return;
    const key = selectedLead.name;
    const newNote = { text: noteText, time: new Date().toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) };
    setLeadNotes((prev) => ({ ...prev, [key]: [...(prev[key] || selectedLead.notes || []), newNote] }));
    setNoteText("");
  };

  const getNotesForLead = (lead: Lead) => leadNotes[lead.name] || lead.notes || [];

  const isMessengerWarning = (lead: Lead) => lead.channel === "Messenger" && lead.lastContactedHrs >= 20;

  const handleMarkAsLost = (lead: Lead) => {
    setLostReasonTarget(lead);
    setSelectedLostReason("");
    setOtherLostReason("");
    setLostReasonOpen(true);
  };

  const confirmLostReason = () => {
    if (!lostReasonTarget || (!selectedLostReason)) return;
    const reason = selectedLostReason === "Other" ? otherLostReason : selectedLostReason;
    setLeadOverrides((prev) => ({ ...prev, [lostReasonTarget.name]: { ...prev[lostReasonTarget.name], status: "LOST" as LeadStatus, lostReason: reason } }));
    setLostReasonOpen(false);
    setLostReasonTarget(null);
  };

  const handleReengage = (lead: Lead) => {
    setReengageTarget(lead);
    setReengageDate(undefined);
    setReengageOpen(true);
  };

  const confirmReengage = () => {
    if (!reengageTarget || !reengageDate) return;
    setLeadOverrides((prev) => ({ ...prev, [reengageTarget.name]: { ...prev[reengageTarget.name], reengagementDate: reengageDate.toISOString() } }));
    setReengageOpen(false);
    setReengageTarget(null);
  };

  const handleHandoff = () => {
    if (!selectedLead) return;
    setLeadOverrides((prev) => ({ ...prev, [selectedLead.name]: { ...prev[selectedLead.name], handedOff: true } }));
    setHandoffOpen(false);
  };

  const exportSelectedCSV = () => {
    const selected = Array.from(selectedIndices).map(i => filteredLeads[i]).filter(Boolean);
    const headers = ["Name", "Status", "Country", "Channel", "Age", "Level", "Assigned To"];
    const rows = selected.map(l => [l.name, l.status, l.country, l.channel, l.age, l.level, l.assignedTo]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "leads_export.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const getLastNote = (lead: Lead) => {
    const notes = getNotesForLead(lead);
    if (notes.length === 0) return null;
    return notes[notes.length - 1];
  };

  const trialDateColor = (lead: Lead) => {
    if (!lead.trialDate) return "";
    if (lead.trialDate.startsWith(todayStr)) return "text-primary font-semibold";
    if (lead.trialPassed && !lead.trialOutcomeMarked) return "text-destructive font-semibold";
    return "";
  };

  const columns = [
    {
      key: "name", header: "Parent Name", render: (r: Lead) => (
        <div className="flex items-center gap-1.5">
          <span className="font-medium">{r.name}</span>
          {r.reengagementDate && (
            <span className="text-primary" title={`Re-engagement: ${format(new Date(r.reengagementDate), "d MMM yyyy")}`}>
              <Calendar size={13} />
            </span>
          )}
          {r.handedOff && <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-success/15 text-success">Handed Off</span>}
        </div>
      ),
    },
    {
      key: "status", header: "Status", render: (r: Lead) => (
        <div className="flex items-center gap-1 flex-wrap">
          <StatusBadge variant={statusVariantMap[r.status] || "lead"}>{r.status}</StatusBadge>
          {r.status === "TRIAL ATTENDED" && r.hoursSinceTrial !== undefined && <FollowUpBadge hoursSinceTrial={r.hoursSinceTrial} />}
        </div>
      ),
    },
    { key: "country", header: "Country", render: (r: Lead) => <span className="whitespace-nowrap">{countryFlags[r.country] || "🌍"} {r.country}</span> },
    { key: "channel", header: "Channel", render: (r: Lead) => <ChannelIcon channel={r.channel} /> },
    {
      key: "lastContacted", header: "Last Contacted", render: (r: Lead) => (
        <span className={isMessengerWarning(r) ? "text-destructive font-medium" : ""}>
          {r.lastContacted}
          {isMessengerWarning(r) && <span className="ml-1.5 text-[11px] text-warning">⚠ 24hr window</span>}
        </span>
      ),
    },
    { key: "aiAgent", header: "AI Agent", render: (r: Lead) => <AIStatusBadge status={r.aiAgent} /> },
    { key: "assignedTo", header: "Assigned To" },
    {
      key: "trialDate", header: "Trial Date", render: (r: Lead) => {
        if (r.status !== "TRIAL ARRANGED" || !r.trialDate) return <span className="text-muted-foreground">—</span>;
        return <span className={trialDateColor(r)}>{r.trialDate}</span>;
      },
    },
    {
      key: "packageInterest", header: "Package Interest", render: (r: Lead) => {
        if (r.status !== "TRIAL ATTENDED" && r.status !== "ENROLLED") return <span className="text-muted-foreground">—</span>;
        return <span>{r.packageInterest || "—"}</span>;
      },
    },
    {
      key: "lastNote", header: "Last Note", render: (r: Lead) => {
        const note = getLastNote(r);
        if (!note) return <span className="text-muted-foreground">—</span>;
        const preview = note.text.length > 40 ? note.text.substring(0, 40) + "..." : note.text;
        return <span className="text-xs text-muted-foreground cursor-pointer hover:text-foreground" onClick={(e) => { e.stopPropagation(); openPanel(r); }}>{preview}</span>;
      },
    },
    { key: "age", header: "Age" },
    { key: "level", header: "Level" },
    {
      key: "actions", header: "Actions", render: (r: Lead) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button className="p-1.5 rounded-md hover:bg-muted text-success" title="WhatsApp"><Phone size={15} /></button>
          <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground" title="View" onClick={() => openPanel(r)}><Eye size={15} /></button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"><MoreHorizontal size={15} /></button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleMarkAsLost(r)}>Mark as Lost</DropdownMenuItem>
              {(r.status === "LOST" || r.status === "COLD") && (
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
    "Trial Attended": "No trials attended yet",
    "Enrolled": "No enrolled leads yet",
    "Lost": "No lost leads — keep it up!",
    "Cold": "No cold leads",
  };

  const currentLead = selectedLead ? getLeadWithOverrides(selectedLead) : null;

  return (
    <div>
      <PageHeader title="Leads" subtitle="Manage leads pipeline — inquiry to enrolment">
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
              placeholder="Search leads..."
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
          onRowClick={(row) => openPanel(row as unknown as Lead)}
          rowClassName={(row) => {
            const r = row as unknown as Lead;
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
          <span className="text-sm font-medium">{selectedIndices.size} lead{selectedIndices.size > 1 ? "s" : ""} selected</span>
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
                {["INQUIRY", "LEAD", "TRIAL ARRANGED", "TRIAL ATTENDED", "NO SHOW", "ENROLLED", "LOST", "COLD"].map((s) => (
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

      {/* Lead Detail Side Panel */}
      <Sheet open={panelOpen} onOpenChange={setPanelOpen}>
        <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto p-0">
          {currentLead && (
            <div className="flex flex-col h-full">
              <SheetHeader className="px-6 py-5 border-b border-border">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-lg">{currentLead.name}</SheetTitle>
                </div>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground text-xs block mb-1">Phone</span><span className="font-medium">{currentLead.phone}</span></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Country</span><span>{countryFlags[currentLead.country] || "🌍"} {currentLead.country}</span></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Channel</span><ChannelIcon channel={currentLead.channel} /></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Source</span><span>{currentLead.source}</span></div>
                </div>

                {/* Child Info */}
                <div className="grid grid-cols-2 gap-4 text-sm border-t border-border pt-4">
                  <div><span className="text-muted-foreground text-xs block mb-1">Child Age</span><span className="font-medium">{currentLead.age}</span></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Level</span><span>{currentLead.level}</span></div>
                </div>

                {/* Status & AI */}
                <div className="grid grid-cols-2 gap-4 text-sm border-t border-border pt-4">
                  <div>
                    <span className="text-muted-foreground text-xs block mb-1">Status</span>
                    <Select defaultValue={currentLead.status}>
                      <SelectTrigger className="w-full h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["INQUIRY", "LEAD", "TRIAL ARRANGED", "TRIAL ATTENDED", "NO SHOW", "ENROLLED", "LOST", "COLD"].map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs block mb-1">AI Agent</span>
                    <AIStatusBadge status={currentLead.aiAgent} />
                  </div>
                </div>

                {/* Package Interest (if applicable) */}
                {(currentLead.status === "TRIAL ATTENDED" || currentLead.status === "ENROLLED") && currentLead.packageInterest && (
                  <div className="border-t border-border pt-4 text-sm">
                    <span className="text-muted-foreground text-xs block mb-1">Package Interest</span>
                    <span className="font-medium">{currentLead.packageInterest}</span>
                  </div>
                )}

                {/* Notes */}
                <div className="border-t border-border pt-4">
                  <h3 className="text-sm font-semibold mb-3">Notes</h3>
                  <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                    {getNotesForLead(currentLead).length === 0 && <p className="text-xs text-muted-foreground">No notes yet</p>}
                    {getNotesForLead(currentLead).map((note, i) => (
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
                      onKeyDown={(e) => e.key === "Enter" && addNote()}
                    />
                    <button onClick={addNote} className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">Add</button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-border px-6 py-4 space-y-2">
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">Mark Trial Booked</button>
                  <button onClick={() => handleMarkAsLost(currentLead)} className="flex-1 px-4 py-2.5 border border-destructive text-destructive rounded-lg text-sm font-medium hover:bg-destructive/10">Mark as Lost</button>
                </div>
                <div className="flex gap-2">
                  {currentLead.aiAgent === "active" && (
                    <button className="flex-1 px-4 py-2.5 border border-purple-500 text-purple-600 dark:text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-500/10">Take Over from AI</button>
                  )}
                  {currentLead.status === "ENROLLED" && (
                    <button
                      disabled={currentLead.handedOff}
                      onClick={() => setHandoffOpen(true)}
                      className={cn(
                        "flex-1 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5",
                        currentLead.handedOff
                          ? "bg-muted text-muted-foreground cursor-not-allowed"
                          : "bg-success text-success-foreground hover:bg-success/90"
                      )}
                    >
                      <ArrowRight size={14} /> {currentLead.handedOff ? "Handed Off ✓" : "Hand off to Ops"}
                    </button>
                  )}
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

      {/* Handoff Confirmation Modal */}
      <Dialog open={handoffOpen} onOpenChange={setHandoffOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Confirm Handoff to Ops</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Confirm handoff to Enrolled Admin? This will notify the CSO Groupchat on Slack.
          </p>
          <DialogFooter>
            <button onClick={() => setHandoffOpen(false)} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted">Cancel</button>
            <button onClick={handleHandoff} className="px-4 py-2 bg-success text-success-foreground rounded-lg text-sm font-medium hover:bg-success/90">Confirm Handoff</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
