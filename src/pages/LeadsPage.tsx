import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import FilterTabs from "@/components/FilterTabs";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Search, MessageCircle, Eye, MoreHorizontal, X, Phone, SlidersHorizontal, AlertTriangle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const countryFlags: Record<string, string> = {
  "Singapore": "🇸🇬", "Malaysia": "🇲🇾", "Philippines": "🇵🇭", "Indonesia": "🇮🇩",
  "UAE": "🇦🇪", "Hong Kong": "🇭🇰", "Sri Lanka": "🇱🇰",
};

type AIStatus = "active" | "admin" | "completed";
type LeadStatus = "LEAD" | "TRIAL ATTENDED" | "NO SHOW" | "ENROLLED" | "LOST" | "COLD" | "TRIAL ARRANGED" | "INQUIRY";

interface Lead {
  name: string;
  status: LeadStatus;
  country: string;
  channel: "WhatsApp" | "Messenger";
  source: string;
  age: number;
  level: string;
  lastContacted: string;
  lastContactedHrs: number;
  aiAgent: AIStatus;
  assignedTo: string;
  phone: string;
  notes: { text: string; time: string }[];
}

const leads: Lead[] = [
  { name: "Asela Perera", status: "LEAD", country: "Sri Lanka", channel: "WhatsApp", source: "Meta Ads (Facebook)", age: 10, level: "—", lastContacted: "2 hrs ago", lastContactedHrs: 2, aiAgent: "active", assignedTo: "Sarah A.", phone: "+94 77 123 4567", notes: [] },
  { name: "MA E Cuison", status: "LEAD", country: "Philippines", channel: "Messenger", source: "Meta Ads (Facebook)", age: 11, level: "—", lastContacted: "22 hrs ago", lastContactedHrs: 22, aiAgent: "active", assignedTo: "Sarah A.", phone: "+63 917 123 4567", notes: [] },
  { name: "Sid Pelaez", status: "LEAD", country: "Philippines", channel: "Messenger", source: "Meta Ads (Facebook)", age: 7, level: "—", lastContacted: "5 hrs ago", lastContactedHrs: 5, aiAgent: "admin", assignedTo: "James L.", phone: "+63 918 234 5678", notes: [{ text: "Parent interested in weekend classes", time: "28 Mar 2026, 10:30 AM" }] },
  { name: "Anna Salutan", status: "TRIAL ATTENDED", country: "Philippines", channel: "Messenger", source: "Meta Ads (Facebook)", age: 7, level: "Beginner", lastContacted: "3 days ago", lastContactedHrs: 72, aiAgent: "completed", assignedTo: "Sarah A.", phone: "+63 919 345 6789", notes: [{ text: "Trial went well, follow up for enrollment", time: "26 Mar 2026, 2:15 PM" }] },
  { name: "Facebook user", status: "LEAD", country: "Philippines", channel: "Messenger", source: "Meta Ads (Facebook)", age: 12, level: "—", lastContacted: "21 hrs ago", lastContactedHrs: 21, aiAgent: "active", assignedTo: "Sarah A.", phone: "—", notes: [] },
  { name: "Leonard Bryan Tria Osi", status: "LEAD", country: "Philippines", channel: "Messenger", source: "Meta Ads (Facebook)", age: 9, level: "—", lastContacted: "1 day ago", lastContactedHrs: 24, aiAgent: "active", assignedTo: "James L.", phone: "+63 920 456 7890", notes: [] },
  { name: "Aileen Jereza Deloverges", status: "NO SHOW", country: "Philippines", channel: "Messenger", source: "—", age: 8, level: "—", lastContacted: "23 hrs ago", lastContactedHrs: 23, aiAgent: "admin", assignedTo: "Sarah A.", phone: "+63 921 567 8901", notes: [{ text: "No show - tried calling twice", time: "29 Mar 2026, 4:00 PM" }] },
  { name: "Trend Tech Services", status: "LEAD", country: "Malaysia", channel: "WhatsApp", source: "Meta Ads (WhatsApp)", age: 11, level: "—", lastContacted: "6 hrs ago", lastContactedHrs: 6, aiAgent: "active", assignedTo: "James L.", phone: "+60 12 345 6789", notes: [] },
  { name: "Daniella De vos", status: "LEAD", country: "Sri Lanka", channel: "WhatsApp", source: "Meta Ads (Form)", age: 9, level: "—", lastContacted: "12 hrs ago", lastContactedHrs: 12, aiAgent: "completed", assignedTo: "Sarah A.", phone: "+94 71 234 5678", notes: [] },
  { name: "Sad Summer", status: "NO SHOW", country: "Philippines", channel: "Messenger", source: "Meta Ads (Facebook)", age: 8, level: "—", lastContacted: "4 days ago", lastContactedHrs: 96, aiAgent: "completed", assignedTo: "James L.", phone: "+63 922 678 9012", notes: [{ text: "Rescheduling pending", time: "27 Mar 2026, 11:00 AM" }] },
];

const needsAttention = (lead: Lead) =>
  (lead.channel === "Messenger" && lead.lastContactedHrs >= 20) ||
  (lead.status === "TRIAL ATTENDED" && lead.lastContactedHrs >= 24) ||
  (lead.status === "NO SHOW");

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

export default function LeadsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [leadNotes, setLeadNotes] = useState<Record<string, { text: string; time: string }[]>>({});
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [countryFilter, setCountryFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");

  const filteredLeads = leads.filter((lead) => {
    const tab = tabs[activeTab].label;
    if (tab === "Needs Attention" && !needsAttention(lead)) return false;
    if (tab !== "All" && tab !== "Needs Attention" && lead.status !== statusFilterMap[tab]) return false;
    if (search && !lead.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (countryFilter !== "all" && lead.country !== countryFilter) return false;
    if (channelFilter !== "all" && lead.channel !== channelFilter) return false;
    return true;
  });

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

  const columns = [
    { key: "name", header: "Parent Name", render: (r: Lead) => <span className="font-medium">{r.name}</span> },
    { key: "status", header: "Status", render: (r: Lead) => <StatusBadge variant={statusVariantMap[r.status] || "lead"}>{r.status}</StatusBadge> },
    { key: "country", header: "Country", render: (r: Lead) => <span>{countryFlags[r.country] || "🌍"} {r.country}</span> },
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
    { key: "age", header: "Age" },
    { key: "level", header: "Level" },
    {
      key: "actions", header: "Actions", render: (r: Lead) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button className="p-1.5 rounded-md hover:bg-muted text-success" title="WhatsApp"><Phone size={15} /></button>
          <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground" title="View" onClick={() => openPanel(r)}><Eye size={15} /></button>
          <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground" title="More"><MoreHorizontal size={15} /></button>
        </div>
      ),
    },
  ];

  const tabEmptyMessages: Record<string, string> = {
    "Needs Attention": "No leads need attention right now 🎉",
    "Inquiry": "No inquiries at this stage",
    "Trial Arranged": "No trials arranged yet",
    "Trial Attended": "No trials attended yet",
    "Enrolled": "No enrolled leads yet",
    "Lost": "No lost leads — keep it up!",
    "Cold": "No cold leads",
  };

  return (
    <div>
      <PageHeader
        title={`Leads`}
        subtitle={`Manage leads pipeline — inquiry to enrolment`}
      >
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
                <SlidersHorizontal size={14} />
                Filters
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

      <FilterTabs tabs={tabs} activeIndex={activeTab} onChange={setActiveTab} />

      <DataTable
        columns={columns as any}
        data={filteredLeads as any}
        totalItems={filteredLeads.length}
        currentPage={1}
        totalPages={Math.max(1, Math.ceil(filteredLeads.length / 10))}
        onRowClick={(row) => openPanel(row as unknown as Lead)}
        rowClassName={(row) => {
          const r = row as unknown as Lead;
          return isMessengerWarning(r) ? "border-l-[3px] border-l-warning/70" : "";
        }}
        emptyMessage={tabEmptyMessages[tabs[activeTab].label] || "No leads at this stage"}
      />

      {/* Lead Detail Side Panel */}
      <Sheet open={panelOpen} onOpenChange={setPanelOpen}>
        <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto p-0">
          {selectedLead && (
            <div className="flex flex-col h-full">
              <SheetHeader className="px-6 py-5 border-b border-border">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-lg">{selectedLead.name}</SheetTitle>
                </div>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs block mb-1">Phone</span>
                    <span className="font-medium">{selectedLead.phone}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs block mb-1">Country</span>
                    <span>{countryFlags[selectedLead.country] || "🌍"} {selectedLead.country}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs block mb-1">Channel</span>
                    <ChannelIcon channel={selectedLead.channel} />
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs block mb-1">Source</span>
                    <span>{selectedLead.source}</span>
                  </div>
                </div>

                {/* Child Info */}
                <div className="grid grid-cols-2 gap-4 text-sm border-t border-border pt-4">
                  <div>
                    <span className="text-muted-foreground text-xs block mb-1">Child Age</span>
                    <span className="font-medium">{selectedLead.age}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs block mb-1">Level</span>
                    <span>{selectedLead.level}</span>
                  </div>
                </div>

                {/* Status & AI */}
                <div className="grid grid-cols-2 gap-4 text-sm border-t border-border pt-4">
                  <div>
                    <span className="text-muted-foreground text-xs block mb-1">Status</span>
                    <Select defaultValue={selectedLead.status}>
                      <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["INQUIRY", "LEAD", "TRIAL ARRANGED", "TRIAL ATTENDED", "NO SHOW", "ENROLLED", "LOST", "COLD"].map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs block mb-1">AI Agent</span>
                    <AIStatusBadge status={selectedLead.aiAgent} />
                  </div>
                </div>

                {/* Notes */}
                <div className="border-t border-border pt-4">
                  <h3 className="text-sm font-semibold mb-3">Notes</h3>
                  <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                    {getNotesForLead(selectedLead).length === 0 && (
                      <p className="text-xs text-muted-foreground">No notes yet</p>
                    )}
                    {getNotesForLead(selectedLead).map((note, i) => (
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
                  <button className="flex-1 px-4 py-2.5 border border-destructive text-destructive rounded-lg text-sm font-medium hover:bg-destructive/10">Mark as Lost</button>
                </div>
                <div className="flex gap-2">
                  {selectedLead.aiAgent === "active" && (
                    <button className="flex-1 px-4 py-2.5 border border-purple-500 text-purple-600 dark:text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-500/10">Take Over from AI</button>
                  )}
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
