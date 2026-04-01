import { useState, useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import FilterTabs from "@/components/FilterTabs";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Search, Phone, MessageCircle, Eye, Users, SlidersHorizontal, Columns3, Minimize2, Maximize2, TrendingUp, UserCheck } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { parents, countryFlags, type Parent, type Child } from "@/data/parentsData";

const statusVariantMap: Record<string, string> = {
  "INQUIRY": "inquiry", "LEAD": "lead", "TRIAL ARRANGED": "trial_arranged",
  "TRIAL DONE": "trial_attended", "MISSED TRIAL": "noshow", "ENROLLED": "enrolled",
  "CLOSED WON": "closed_won", "LOST": "lost",
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

function ChildStatusSummary({ children }: { children: Child[] }) {
  const statusCounts: Record<string, number> = {};
  children.forEach(c => { statusCounts[c.status] = (statusCounts[c.status] || 0) + 1; });
  return (
    <div className="flex flex-wrap gap-1">
      {Object.entries(statusCounts).map(([status, count]) => (
        <span key={status} className="inline-flex items-center gap-1">
          <StatusBadge variant={statusVariantMap[status] as any} className="text-[10px] px-1.5 py-0">
            {count > 1 ? `${count}× ${status}` : status}
          </StatusBadge>
        </span>
      ))}
    </div>
  );
}

const tabs = [
  { label: "All", count: parents.length },
  { label: "Has Leads", count: parents.filter(p => p.children.some(c => ["INQUIRY", "LEAD"].includes(c.status))).length },
  { label: "Has Trials", count: parents.filter(p => p.children.some(c => ["TRIAL ARRANGED", "TRIAL DONE", "MISSED TRIAL"].includes(c.status))).length },
  { label: "Has Enrolled", count: parents.filter(p => p.children.some(c => c.status === "ENROLLED" || c.status === "CLOSED WON")).length },
  { label: "Has Lost", count: parents.filter(p => p.children.some(c => c.status === "LOST")).length },
];

const tabFilters: Record<string, (p: Parent) => boolean> = {
  "All": () => true,
  "Has Leads": p => p.children.some(c => ["INQUIRY", "LEAD"].includes(c.status)),
  "Has Trials": p => p.children.some(c => ["TRIAL ARRANGED", "TRIAL DONE", "MISSED TRIAL"].includes(c.status)),
  "Has Enrolled": p => p.children.some(c => c.status === "ENROLLED" || c.status === "CLOSED WON"),
  "Has Lost": p => p.children.some(c => c.status === "LOST"),
};

// Stats bar
function ParentStatsBar() {
  const totalParents = parents.length;
  const totalChildren = parents.reduce((sum, p) => sum + p.children.length, 0);
  const enrolledChildren = parents.reduce((sum, p) => sum + p.children.filter(c => c.status === "ENROLLED" || c.status === "CLOSED WON").length, 0);
  const trialChildren = parents.reduce((sum, p) => sum + p.children.filter(c => ["TRIAL ARRANGED", "TRIAL DONE"].includes(c.status)).length, 0);

  const stats = [
    { label: "Total Parents", value: totalParents, icon: Users },
    { label: "Total Students", value: totalChildren, icon: Users },
    { label: "Enrolled", value: enrolledChildren, icon: TrendingUp },
    { label: "In Trial", value: trialChildren, icon: TrendingUp },
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

const allColumnKeys = [
  { key: "name", label: "Parent" },
  { key: "children", label: "Children" },
  { key: "statuses", label: "Student Statuses" },
  { key: "country", label: "Country" },
  { key: "channel", label: "Channel" },
  { key: "lastContacted", label: "Last Contacted" },
  { key: "assignedTo", label: "Assigned To" },
  { key: "actions", label: "Actions" },
];

export default function ParentsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [countryFilter, setCountryFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set([
    "name", "children", "statuses", "country", "channel", "lastContacted", "assignedTo", "actions"
  ]));
  const pageSize = 20;

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const filtered = useMemo(() => {
    return parents.filter(p => {
      const tabLabel = tabs[activeTab].label;
      if (!tabFilters[tabLabel](p)) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.children.some(c => c.name.toLowerCase().includes(search.toLowerCase()))) return false;
      if (countryFilter !== "all" && p.country !== countryFilter) return false;
      if (channelFilter !== "all" && p.channel !== channelFilter) return false;
      return true;
    });
  }, [activeTab, search, countryFilter, channelFilter]);

  const viewAll = currentPage === 0;
  const compactPageSize = compact ? 25 : pageSize;
  const totalPages = Math.max(1, Math.ceil(filtered.length / compactPageSize));
  const paginated = viewAll ? filtered : filtered.slice((currentPage - 1) * compactPageSize, currentPage * compactPageSize);

  const openPanel = (parent: Parent) => {
    setSelectedParent(parent);
    setPanelOpen(true);
  };

  const effectiveVisibleColumns = compact
    ? new Set(["name", "statuses", "country", "channel", "lastContacted", "actions"])
    : visibleColumns;

  const columns = [
    {
      key: "name", header: "Parent", render: (r: Parent) => (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-muted-foreground font-mono">{r.id}</span>
            <span className="font-medium">{r.name}</span>
          </div>
          {!compact && (
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {r.children.length} {r.children.length === 1 ? "child" : "children"}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "children", header: "Children", render: (r: Parent) => (
        <div className="space-y-0.5">
          {r.children.map((c, i) => (
            <div key={i} className="text-xs">
              <span className="font-medium">{c.name}</span>
              <span className="text-muted-foreground ml-1">({c.age}y)</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "statuses", header: "Student Statuses", render: (r: Parent) => <ChildStatusSummary children={r.children} />,
    },
    {
      key: "psid", header: "PSID", render: (r: Parent) => (
        <span className="text-xs text-muted-foreground font-mono">{r.psid || "—"}</span>
      ),
    },
    { key: "country", header: "Country", render: (r: Parent) => <span className="whitespace-nowrap">{countryFlags[r.country] || "🌍"} {r.country}</span> },
    { key: "channel", header: "Channel", render: (r: Parent) => <ChannelIcon channel={r.channel} /> },
    { key: "lastContacted", header: "Last Contacted", render: (r: Parent) => <span>{r.lastContacted}</span> },
    { key: "assignedTo", header: "Assigned To" },
    {
      key: "actions", header: "", render: (r: Parent) => (
        <TooltipProvider delayDuration={300}>
          <div className="flex items-center gap-0.5 opacity-0 group-hover/row:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="p-1.5 rounded-md hover:bg-success/10 text-success"
                  onClick={() => {
                    const phone = r.phone.replace(/\s+/g, "");
                    window.open(`https://wa.me/${phone}`, "_blank");
                  }}
                >
                  <Phone size={15} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top"><p>WhatsApp</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1.5 rounded-md hover:bg-info/10 text-info" onClick={() => window.open("https://m.me/", "_blank")}>
                  <MessageCircle size={15} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top"><p>Messenger</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground" onClick={() => openPanel(r)}>
                  <Eye size={15} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top"><p>View details</p></TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      ),
    },
  ];

  const filteredColumns = columns.filter(col => effectiveVisibleColumns.has(col.key));

  return (
    <div>
      <PageHeader title="Parents" subtitle="Manage parents and their children's enrolment pipeline">
        <div className="flex items-center gap-3">
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
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              className="pl-9 pr-4 py-2 border border-border rounded-lg text-sm bg-background placeholder:text-muted-foreground w-64"
              placeholder="Search parents or children..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </PageHeader>

      <ParentStatsBar />

      <FilterTabs tabs={tabs} activeIndex={activeTab} onChange={(i) => { setActiveTab(i); setCurrentPage(1); }} />

      <div className={compact ? "[&_td]:py-1.5 [&_th]:py-2" : ""}>
        <DataTable
          columns={filteredColumns as any}
          data={paginated as any}
          totalItems={filtered.length}
          currentPage={viewAll ? 1 : currentPage}
          totalPages={viewAll ? 1 : totalPages}
          onPageChange={(p) => { if (p === 0) setCurrentPage(0); else setCurrentPage(Math.max(1, Math.min(p, totalPages))); }}
          viewingAll={viewAll}
          onRowClick={(row) => openPanel(row as unknown as Parent)}
          rowClassName={() => "group/row"}
          emptyMessage="No parents found"
        />
      </div>

      {/* Parent Detail Side Panel */}
      <Sheet open={panelOpen} onOpenChange={setPanelOpen}>
        <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto p-0">
          {selectedParent && (
            <div className="flex flex-col h-full">
              <SheetHeader className="px-6 py-5 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-mono">{selectedParent.id}</span>
                  <SheetTitle className="text-lg">{selectedParent.name}</SheetTitle>
                </div>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground text-xs block mb-1">Phone</span><span className="font-medium">{selectedParent.phone}</span></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Country</span><span>{countryFlags[selectedParent.country] || "🌍"} {selectedParent.country}</span></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Channel</span><ChannelIcon channel={selectedParent.channel} /></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Source</span><span>{selectedParent.source}</span></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Assigned To</span><span>{selectedParent.assignedTo}</span></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Last Contacted</span><span>{selectedParent.lastContacted}</span></div>
                </div>

                {/* Children */}
                <div className="border-t border-border pt-4">
                  <h3 className="text-sm font-semibold mb-3">Children ({selectedParent.children.length})</h3>
                  <div className="space-y-3">
                    {selectedParent.children.map((child, i) => (
                      <div key={i} className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-muted-foreground font-mono">{child.id}</span>
                            <span className="text-sm font-medium">{child.name}</span>
                          </div>
                          <StatusBadge variant={statusVariantMap[child.status] as any}>{child.status}</StatusBadge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>Age {child.age}</span>
                          <span>Level: {child.level}</span>
                          {child.packageInterest && <span>Package: {child.packageInterest}</span>}
                          {child.trialDate && <span>Trial: {child.trialDate}</span>}
                          {child.enrolledDate && <span>Enrolled: {child.enrolledDate}</span>}
                          {child.lostReason && <span>Reason: {child.lostReason}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="border-t border-border pt-4">
                  <h3 className="text-sm font-semibold mb-3">Notes</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedParent.notes.length === 0 && <p className="text-xs text-muted-foreground">No notes yet</p>}
                    {selectedParent.notes.map((note, i) => (
                      <div key={i} className="bg-muted/50 rounded-lg p-3">
                        <p className="text-sm">{note.text}</p>
                        <p className="text-[11px] text-muted-foreground mt-1">{note.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
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
