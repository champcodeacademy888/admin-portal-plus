import { useState, useMemo, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import FilterTabs from "@/components/FilterTabs";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Search, MessageCircle, Eye, MoreHorizontal, X, Phone, SlidersHorizontal, AlertTriangle, Calendar, ArrowRight, Download, Users, TrendingUp, LayoutGrid, List, Columns3, Flame, CheckCircle, XCircle, UserCheck, Minimize2, Maximize2, Plus, Package } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { parents, countryFlags, todayFormatted, type Parent, type ChildWithParent, type ChildStatus, type AIStatus, getAllChildren } from "@/data/parentsData";
import { getPackagesByCountry, createStudentPackageFromLead, formatMoney } from "@/data/studentPackagesData";
import { getTutorAvailableSlots } from "@/data/calendarData";
import type { PackageData } from "@/data/packagesCatalog";

const today = new Date();
const todayStr = todayFormatted;
const TRIAL_GROUP_TABS = new Set(["Trial Arranged", "Trial Done"]);

const LOST_REASONS = ["Price", "Timing", "Chose competitor", "Not interested", "No response", "Other"];

const leadStatuses: ChildStatus[] = ["INQUIRY", "LEAD", "TRIAL ARRANGED", "TRIAL DONE", "MISSED TRIAL", "PENDING PAYMENT", "PAYMENT FAILED", "CLOSED WON", "LOST"];

const allLeadChildren = getAllChildren().filter(c => leadStatuses.includes(c.status));

const needsAttention = (c: ChildWithParent) =>
  (c.parent.channel === "Messenger" && c.parent.lastContactedHrs >= 20) ||
  (c.status === "TRIAL DONE" && (c.hoursSinceTrial ?? c.parent.lastContactedHrs) >= 24) ||
  (c.status === "MISSED TRIAL") ||
  (c.status === "TRIAL ARRANGED" && c.trialPassed && !c.trialOutcomeMarked) ||
  (c.parent.reengagementDate && new Date(c.parent.reengagementDate) <= today);

const needsAttentionCount = allLeadChildren.filter(needsAttention).length;

// Urgency scoring for Needs Attention tab
function getUrgencyScore(c: ChildWithParent): { score: number; flames: number; color: string } {
  // Messenger 24hr expiring < 2hrs
  if (c.parent.channel === "Messenger" && c.parent.lastContactedHrs >= 22) {
    return { score: 1, flames: 3, color: "text-destructive" };
  }
  // Post-trial follow-up overdue
  if (c.status === "TRIAL DONE" && (c.hoursSinceTrial ?? 0) >= 24) {
    return { score: 2, flames: 3, color: "text-orange-500" };
  }
  if (c.status === "MISSED TRIAL") {
    return { score: 2, flames: 3, color: "text-orange-500" };
  }
  // Messenger 2-8hrs
  if (c.parent.channel === "Messenger" && c.parent.lastContactedHrs >= 16 && c.parent.lastContactedHrs < 22) {
    return { score: 3, flames: 2, color: "text-warning" };
  }
  // WhatsApp follow-up
  if (c.parent.channel === "WhatsApp" && c.parent.lastContactedHrs >= 24) {
    return { score: 4, flames: 1, color: "text-muted-foreground" };
  }
  // Trial passed but not marked
  if (c.status === "TRIAL ARRANGED" && c.trialPassed && !c.trialOutcomeMarked) {
    return { score: 2, flames: 2, color: "text-orange-500" };
  }
  return { score: 5, flames: 1, color: "text-muted-foreground" };
}

function FlameIcons({ count, color }: { count: number; color: string }) {
  return (
    <span className={`inline-flex items-center gap-0 ${color}`}>
      {Array.from({ length: count }).map((_, i) => (
        <Flame key={i} size={12} fill="currentColor" />
      ))}
    </span>
  );
}

const statusVariantMap: Record<string, string> = {
  "LEAD": "lead", "TRIAL DONE": "trial_attended", "MISSED TRIAL": "noshow",
  "ENROLLED": "enrolled", "CLOSED WON": "closed_won", "LOST": "lost",
  "TRIAL ARRANGED": "trial_arranged", "INQUIRY": "inquiry", "PENDING PAYMENT": "pending_payment", "PAYMENT FAILED": "payment_failed",
};

// Status advancement map
const nextStatusMap: Record<string, ChildStatus> = {
  "INQUIRY": "LEAD",
  "LEAD": "TRIAL ARRANGED",
  "TRIAL ARRANGED": "TRIAL DONE",
  "TRIAL DONE": "CLOSED WON",
  "MISSED TRIAL": "TRIAL ARRANGED",
};

const statusFilterMap: Record<string, string> = {
  "Inquiry": "INQUIRY", "Lead": "LEAD", "Trial Arranged": "TRIAL ARRANGED",
  "Trial Done": "TRIAL DONE", "Missed Trial": "MISSED TRIAL", "Pending Payment": "PENDING PAYMENT", "Payment Failed": "PAYMENT FAILED", "Closed Won": "CLOSED WON",
  "Lost": "LOST",
};

// Tab counts
const tabCounts: Record<string, number> = {
  "All": allLeadChildren.length,
  "Needs Attention": needsAttentionCount,
  "Inquiry": allLeadChildren.filter(c => c.status === "INQUIRY").length,
  "Lead": allLeadChildren.filter(c => c.status === "LEAD").length,
  "Trial Arranged": allLeadChildren.filter(c => c.status === "TRIAL ARRANGED").length,
  "Trial Done": allLeadChildren.filter(c => c.status === "TRIAL DONE").length,
  "Missed Trial": allLeadChildren.filter(c => c.status === "MISSED TRIAL").length,
  "Pending Payment": allLeadChildren.filter(c => c.status === "PENDING PAYMENT").length,
  "Payment Failed": allLeadChildren.filter(c => c.status === "PAYMENT FAILED").length,
  "Closed Won": allLeadChildren.filter(c => c.status === "CLOSED WON").length,
  "Lost": allLeadChildren.filter(c => c.status === "LOST").length,
};

const tabs = [
  { label: "All", count: tabCounts["All"], badgeColor: "bg-muted-foreground/60" },
  { label: "Needs Attention", count: tabCounts["Needs Attention"], badgeColor: tabCounts["Needs Attention"] > 0 ? "bg-destructive" : "bg-muted-foreground/60" },
  { label: "Inquiry", count: tabCounts["Inquiry"], badgeColor: "bg-muted-foreground/60" },
  { label: "Lead", count: tabCounts["Lead"], badgeColor: "bg-muted-foreground/60" },
  { label: "Trial Arranged", count: tabCounts["Trial Arranged"], badgeColor: "bg-muted-foreground/60" },
  { label: "Trial Done", count: tabCounts["Trial Done"], badgeColor: "bg-muted-foreground/60" },
  { label: "Missed Trial", count: tabCounts["Missed Trial"], badgeColor: "bg-muted-foreground/60" },
  { label: "Pending Payment", count: tabCounts["Pending Payment"], badgeColor: "bg-warning" },
  { label: "Payment Failed", count: tabCounts["Payment Failed"], badgeColor: "bg-destructive" },
  { label: "Closed Won", count: tabCounts["Closed Won"], badgeColor: "bg-muted-foreground/60" },
  { label: "Lost", count: tabCounts["Lost"], badgeColor: "bg-muted-foreground/60" },
];

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

function ConversionStatsBar() {
  const total = allLeadChildren.length;
  const inquiries = allLeadChildren.filter(l => l.status === "INQUIRY").length;
  const leadsCount = allLeadChildren.filter(l => l.status === "LEAD").length;
  const trialArranged = allLeadChildren.filter(l => l.status === "TRIAL ARRANGED").length;
  const trialDone = allLeadChildren.filter(l => l.status === "TRIAL DONE").length;
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

const kanbanStatuses: ChildStatus[] = ["INQUIRY", "LEAD", "TRIAL ARRANGED", "TRIAL DONE", "MISSED TRIAL", "PENDING PAYMENT", "PAYMENT FAILED", "CLOSED WON", "LOST"];
const kanbanColors: Record<string, string> = {
  "INQUIRY": "border-t-info", "LEAD": "border-t-primary", "TRIAL ARRANGED": "border-t-warning",
  "TRIAL DONE": "border-t-purple-500", "MISSED TRIAL": "border-t-destructive",
  "PENDING PAYMENT": "border-t-warning", "PAYMENT FAILED": "border-t-destructive",
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

// Daily AI Summary component
function DailySummary() {
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (dismissed) return null;

  // Analyze pipeline data
  const messengerUrgent = allLeadChildren.filter(c => c.parent.channel === "Messenger" && c.parent.lastContactedHrs >= 20).length;
  const trialDoneNeedFollowUp = allLeadChildren.filter(c => c.status === "TRIAL DONE" && (c.hoursSinceTrial ?? 0) >= 24).length;
  const missedTrials = allLeadChildren.filter(c => c.status === "MISSED TRIAL").length;
  const trialsToday = allLeadChildren.filter(c => c.status === "TRIAL ARRANGED" && c.trialDate?.startsWith(todayStr)).length;
  const trialsPastUnmarked = allLeadChildren.filter(c => c.status === "TRIAL ARRANGED" && c.trialPassed && !c.trialOutcomeMarked).length;
  const newInquiries = allLeadChildren.filter(c => c.status === "INQUIRY" && c.parent.lastContactedHrs <= 24).length;
  const closedWonTotal = allLeadChildren.filter(c => c.status === "CLOSED WON").length;
  const lostTotal = allLeadChildren.filter(c => c.status === "LOST").length;
  const totalLeads = allLeadChildren.length;
  const activeLeads = allLeadChildren.filter(c => c.status !== "LOST" && c.status !== "CLOSED WON").length;
  const whatsappStale = allLeadChildren.filter(c => c.parent.channel === "WhatsApp" && c.parent.lastContactedHrs >= 48 && c.status !== "LOST" && c.status !== "CLOSED WON").length;

  // Generate action steps
  const actions: { priority: "high" | "medium" | "low"; text: string }[] = [];

  if (messengerUrgent > 0) actions.push({ priority: "high", text: `🔴 ${messengerUrgent} Messenger lead${messengerUrgent > 1 ? "s" : ""} with 24hr window expiring — respond immediately to avoid losing contact` });
  if (trialDoneNeedFollowUp > 0) actions.push({ priority: "high", text: `🟠 ${trialDoneNeedFollowUp} post-trial follow-up${trialDoneNeedFollowUp > 1 ? "s" : ""} overdue — call parents to discuss enrollment packages` });
  if (trialsPastUnmarked > 0) actions.push({ priority: "high", text: `🟠 ${trialsPastUnmarked} past trial${trialsPastUnmarked > 1 ? "s" : ""} without outcome marked — update status to Trial Done or Missed Trial` });
  if (missedTrials > 0) actions.push({ priority: "medium", text: `🟡 ${missedTrials} missed trial${missedTrials > 1 ? "s" : ""} — contact to reschedule before leads go cold` });
  if (trialsToday > 0) actions.push({ priority: "medium", text: `📅 ${trialsToday} trial${trialsToday > 1 ? "s" : ""} scheduled today — confirm attendance with parents` });
  if (newInquiries > 0) actions.push({ priority: "medium", text: `✨ ${newInquiries} new inquir${newInquiries > 1 ? "ies" : "y"} in the last 24hrs — qualify and move to Lead stage` });
  if (whatsappStale > 0) actions.push({ priority: "low", text: `📱 ${whatsappStale} WhatsApp lead${whatsappStale > 1 ? "s" : ""} haven't been contacted in 48+ hrs — send a follow-up message` });

  // Summary sentence
  const conversionRate = totalLeads > 0 ? Math.round((closedWonTotal / totalLeads) * 100) : 0;

  return (
    <div className="mb-6 rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-primary/5 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-lg">🧠</span>
          <h3 className="text-sm font-semibold text-foreground">Daily Summary</h3>
          <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-2 py-0.5">Auto-generated</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setExpanded(!expanded)} className="text-xs text-primary hover:underline mr-2">
            {expanded ? "Collapse" : "Show details"}
          </button>
          <button onClick={() => setDismissed(true)} className="p-1 hover:bg-muted rounded text-muted-foreground"><X size={14} /></button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="px-5 py-3">
        <p className="text-sm text-foreground">
          <span className="font-medium">{activeLeads} active leads</span> in pipeline · {closedWonTotal} closed won ({conversionRate}% conversion) · {needsAttentionCount} need attention right now
          {trialsToday > 0 && <span className="text-primary font-medium"> · {trialsToday} trial{trialsToday > 1 ? "s" : ""} today</span>}
        </p>
      </div>

      {/* Action steps */}
      {expanded && actions.length > 0 && (
        <div className="px-5 pb-4 space-y-2 border-t border-border pt-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recommended next steps</p>
          {actions.map((action, i) => (
            <div
              key={i}
              className={cn(
                "flex items-start gap-2 rounded-lg px-3 py-2 text-sm",
                action.priority === "high" ? "bg-destructive/5" :
                action.priority === "medium" ? "bg-warning/5" : "bg-muted/50"
              )}
            >
              <span className="mt-0.5 text-xs font-semibold rounded px-1.5 py-0.5 shrink-0" style={{
                background: action.priority === "high" ? "hsl(var(--destructive) / 0.15)" :
                  action.priority === "medium" ? "hsl(var(--warning) / 0.15)" : "hsl(var(--muted))",
                color: action.priority === "high" ? "hsl(var(--destructive))" :
                  action.priority === "medium" ? "hsl(var(--warning))" : "hsl(var(--muted-foreground))",
              }}>
                {action.priority === "high" ? "URGENT" : action.priority === "medium" ? "ACTION" : "LOW"}
              </span>
              <span>{action.text}</span>
            </div>
          ))}
        </div>
      )}

      {!expanded && actions.length > 0 && (
        <div className="px-5 pb-3">
          <p className="text-xs text-muted-foreground">
            {actions.filter(a => a.priority === "high").length > 0 && (
              <span className="text-destructive font-medium">{actions.filter(a => a.priority === "high").length} urgent action{actions.filter(a => a.priority === "high").length > 1 ? "s" : ""}</span>
            )}
            {actions.filter(a => a.priority === "high").length > 0 && actions.filter(a => a.priority !== "high").length > 0 && " · "}
            {actions.filter(a => a.priority !== "high").length > 0 && (
              <span>{actions.filter(a => a.priority !== "high").length} more recommendation{actions.filter(a => a.priority !== "high").length > 1 ? "s" : ""}</span>
            )}
            {" — "}
            <button onClick={() => setExpanded(true)} className="text-primary hover:underline">view all</button>
          </p>
        </div>
      )}
    </div>
  );
}

// Smart bulk suggestion
function getBulkSuggestion(selected: ChildWithParent[]): { label: string; action: string } | null {
  if (selected.length === 0) return null;
  const statusCounts: Record<string, number> = {};
  selected.forEach(s => { statusCounts[s.status] = (statusCounts[s.status] || 0) + 1; });
  const dominant = Object.entries(statusCounts).sort((a, b) => b[1] - a[1])[0];
  if (!dominant) return null;
  const [status, count] = dominant;
  const ratio = count / selected.length;
  if (ratio < 0.5) return null;

  switch (status) {
    case "TRIAL DONE": return { label: `Mark ${count} as Closed Won`, action: "CLOSED WON" };
    case "INQUIRY": return { label: `Advance ${count} to Lead`, action: "LEAD" };
    case "LEAD": return { label: `Arrange trials for ${count}`, action: "TRIAL ARRANGED" };
    case "TRIAL ARRANGED": return { label: `Mark ${count} trials as done`, action: "TRIAL DONE" };
    case "MISSED TRIAL": return { label: `Reschedule ${count} trials`, action: "TRIAL ARRANGED" };
    default: return null;
  }
}

// Quick preview hover card content
function LeadQuickPreview({ lead }: { lead: ChildWithParent }) {
  const lastNote = lead.parent.notes.length > 0 ? lead.parent.notes[lead.parent.notes.length - 1] : null;
  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-semibold">{lead.parent.name}</p>
        <p className="text-xs text-muted-foreground">{lead.parent.phone}</p>
      </div>
      <div className="border-t border-border pt-2">
        <p className="text-xs"><span className="text-muted-foreground">Student:</span> {lead.name}, Age {lead.age}, {lead.level}</p>
      </div>
      {lastNote && (
        <div className="border-t border-border pt-2">
          <p className="text-xs text-muted-foreground">Last note:</p>
          <p className="text-xs truncate">{lastNote.text}</p>
        </div>
      )}
      <div className="flex items-center gap-2 pt-1">
        <StatusBadge variant={statusVariantMap[lead.status] as any} className="text-[10px]">{lead.status}</StatusBadge>
        <span className="text-[10px] text-muted-foreground">{countryFlags[lead.parent.country]} {lead.parent.country}</span>
      </div>
    </div>
  );
}

export default function LeadsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  // Default to "Needs Attention" tab (index 1)
  const [activeTab, setActiveTab] = useState(1);
  const [selectedChild, setSelectedChild] = useState<ChildWithParent | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [countryFilter, setCountryFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [compact, setCompact] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set([
    "studentId", "student", "status", "country", "channel", "lastContacted", "trialDate", "trialTutor", "urgency", "actions"
  ]));
  const [columnsOpen, setColumnsOpen] = useState(false);

  const allColumnKeys = [
    { key: "studentId", label: "Student ID" },
    { key: "student", label: "Student" },
    { key: "status", label: "Status" },
    { key: "country", label: "Country" },
    { key: "channel", label: "Channel" },
    { key: "lastContacted", label: "Last Contacted" },
    { key: "urgency", label: "Urgency" },
    { key: "aiAgent", label: "AI Agent" },
    { key: "trialDate", label: "Date of Trial" },
    { key: "trialTutor", label: "Trial Tutor" },
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
  // Inline lost reason for quick action
  const [inlineLostIndex, setInlineLostIndex] = useState<number | null>(null);

  // Create Student Package dialog state
  const [createPkgOpen, setCreatePkgOpen] = useState(false);
  const [createPkgTarget, setCreatePkgTarget] = useState<ChildWithParent | null>(null);
  const [selectedCatalogPkg, setSelectedCatalogPkg] = useState<string>("");
  const [selectedTutor, setSelectedTutor] = useState<string>("");
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [lessonStartDate, setLessonStartDate] = useState<Date | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [createPkgSuccess, setCreatePkgSuccess] = useState<string | null>(null);

  // Arrange Trial dialog state
  const [arrangeTrialOpen, setArrangeTrialOpen] = useState(false);
  const [arrangeTrialTarget, setArrangeTrialTarget] = useState<ChildWithParent | null>(null);
  const [trialTutor, setTrialTutor] = useState<string>("");
  const [trialProgram, setTrialProgram] = useState<string>("");
  const [trialSlot, setTrialSlot] = useState<string>("");
  const [trialDate, setTrialDate] = useState<Date | undefined>();
  const [arrangeTrialSuccess, setArrangeTrialSuccess] = useState<string | null>(null);

  const trialProgramOptions = ["Minecraft Trial","Roblox Trial","Scratch Trial","Web Design Trial","Python Trial","AI Trial"];

  const trialAvailableSlots = useMemo(() => {
    if (!trialTutor) return [];
    return getTutorAvailableSlots(trialTutor);
  }, [trialTutor]);

  const tutorOptions = ["Coach Ben","Coach Lily","Coach Arjun","Coach Mei","Coach Ryan","Coach Sofia","Coach Leo","Coach Hana"];
  const programOptions = ["Scratch","Python","Web Development","Roblox","Minecraft","JavaScript","Data Science","AI & Machine Learning"];

  const availableSlots = useMemo(() => {
    if (!selectedTutor) return [];
    return getTutorAvailableSlots(selectedTutor);
  }, [selectedTutor]);

  const availablePackages = useMemo(() => {
    if (!createPkgTarget) return [];
    return getPackagesByCountry(createPkgTarget.parent.country);
  }, [createPkgTarget]);

  const handleOpenCreatePkg = (child: ChildWithParent) => {
    setCreatePkgTarget(child);
    setSelectedCatalogPkg("");
    setSelectedTutor("");
    setSelectedProgram("");
    setSelectedSlot("");
    setLessonStartDate(undefined);
    setCreatePkgSuccess(null);
    setCreatePkgOpen(true);
  };

  const handleConfirmCreatePkg = () => {
    if (!createPkgTarget || !selectedCatalogPkg || !lessonStartDate) return;
    const catalogPkg = availablePackages.find((p) => String(p.id) === selectedCatalogPkg);
    if (!catalogPkg) return;

    const { pkg } = createStudentPackageFromLead(createPkgTarget, catalogPkg, lessonStartDate);

    // If past start date → lead becomes PAYMENT FAILED
    const isPast = lessonStartDate < new Date();
    if (isPast) {
      setCreatePkgSuccess(`Created ${pkg.id} with status Payment Due (start date passed → Payment Failed).`);
    } else {
      setCreatePkgSuccess(`Created ${pkg.id} — ${pkg.packageName}. ${pkg.totalInvoices} invoice(s) generated.`);
    }
  };

  const handleOpenArrangeTrial = (child: ChildWithParent) => {
    setArrangeTrialTarget(child);
    setTrialTutor("");
    setTrialProgram("");
    setTrialSlot("");
    setTrialDate(undefined);
    setArrangeTrialSuccess(null);
    setArrangeTrialOpen(true);
  };

  const handleConfirmArrangeTrial = () => {
    if (!arrangeTrialTarget || !trialTutor || !trialProgram || !trialDate) return;
    const formattedDate = format(trialDate, "EEE d MMM, HH:mm");
    setArrangeTrialSuccess(`Trial arranged for ${arrangeTrialTarget.name} — ${trialProgram} with ${trialTutor} on ${formattedDate}`);
  };
  const filteredLeads = useMemo(() => {
    let result = allLeadChildren.filter((child) => {
      const tab = tabs[activeTab].label;
      if (tab === "Needs Attention" && !needsAttention(child)) return false;
      if (tab !== "All" && tab !== "Needs Attention" && child.status !== statusFilterMap[tab]) return false;
      if (search && !child.name.toLowerCase().includes(search.toLowerCase()) && !child.parent.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (countryFilter !== "all" && child.parent.country !== countryFilter) return false;
      if (channelFilter !== "all" && child.parent.channel !== channelFilter) return false;
      return true;
    });

    // Sort by urgency in Needs Attention tab
    if (tabs[activeTab].label === "Needs Attention") {
      result = [...result].sort((a, b) => getUrgencyScore(a).score - getUrgencyScore(b).score);
    }

    return result;
  }, [activeTab, search, countryFilter, channelFilter]);

  const parseTrialDate = (value?: string) => {
    if (!value) return Number.NEGATIVE_INFINITY;
    const parsed = new Date(`${value} 2026`).getTime();
    return Number.isNaN(parsed) ? Number.NEGATIVE_INFINITY : parsed;
  };

  const shouldGroupByTrialSlot = TRIAL_GROUP_TABS.has(tabs[activeTab].label);

  const groupedTrialLeads = useMemo(() => {
    if (!shouldGroupByTrialSlot) return [] as { label: string; key: string; rows: ChildWithParent[]; latest: number }[];

    const groups = new Map<string, ChildWithParent[]>();
    filteredLeads.forEach((lead) => {
      const key = lead.trialDate ?? "No Date";
      const existing = groups.get(key) ?? [];
      existing.push(lead);
      groups.set(key, existing);
    });

    return Array.from(groups.entries())
      .map(([key, rows]) => ({
        key,
        label: key,
        rows: rows.sort((a, b) => a.name.localeCompare(b.name)),
        latest: Math.max(...rows.map((row) => parseTrialDate(row.trialDate))),
      }))
      .sort((a, b) => b.latest - a.latest || b.label.localeCompare(a.label));
  }, [filteredLeads, shouldGroupByTrialSlot]);

  const viewAll = currentPage === 0;
  const compactPageSize = compact ? 25 : pageSize;
  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / compactPageSize));
  const paginatedLeads = viewAll ? filteredLeads : filteredLeads.slice((currentPage - 1) * compactPageSize, currentPage * compactPageSize);

  const paginatedTrialGroups = useMemo(() => {
    if (!shouldGroupByTrialSlot) return [] as { label: string; key: string; rows: ChildWithParent[]; latest: number; startIndex: number }[];

    const groups = viewAll
      ? groupedTrialLeads
      : groupedTrialLeads.slice((currentPage - 1) * compactPageSize, currentPage * compactPageSize);

    let runningIndex = viewAll ? 0 : (currentPage - 1) * compactPageSize;
    return groups.map((group) => {
      const groupWithIndex = { ...group, startIndex: runningIndex };
      runningIndex += group.rows.length;
      return groupWithIndex;
    });
  }, [currentPage, compactPageSize, groupedTrialLeads, shouldGroupByTrialSlot, viewAll]);

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

  // Determine visible columns based on compact mode
  const effectiveVisibleColumns = compact
    ? new Set(["studentId", "student", "status", "country", "channel", "lastContacted", "trialDate", "trialTutor", "urgency", "actions"])
    : visibleColumns;

  const columns = [
    {
      key: "studentId", header: "ID", render: (r: ChildWithParent) => (
        <span className="text-xs text-muted-foreground font-mono">{r.id}</span>
      ),
    },
    {
      key: "student", header: "Student", render: (r: ChildWithParent) => compact ? (
        <HoverCard openDelay={500}>
          <HoverCardTrigger asChild>
            <div className="cursor-default">
              <span className="font-medium">{r.name}</span>
            </div>
          </HoverCardTrigger>
          <HoverCardContent side="right" className="w-72">
            <LeadQuickPreview lead={r} />
          </HoverCardContent>
        </HoverCard>
      ) : (
        <HoverCard openDelay={500}>
          <HoverCardTrigger asChild>
            <div className="cursor-default">
              <span className="font-medium">{r.name}</span>
              <div className="text-[11px] text-muted-foreground mt-0.5">Age {r.age} · {r.level}</div>
            </div>
          </HoverCardTrigger>
          <HoverCardContent side="right" className="w-72">
            <LeadQuickPreview lead={r} />
          </HoverCardContent>
        </HoverCard>
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
      key: "psid", header: "PSID", render: (r: ChildWithParent) => (
        <span className="text-xs text-muted-foreground font-mono">{r.parent.psid || "—"}</span>
      ),
    },
    {
      key: "status", header: "Status", render: (r: ChildWithParent) => (
        <div className="flex items-center gap-1 flex-wrap">
          <StatusBadge variant={statusVariantMap[r.status] as any}>{r.status}</StatusBadge>
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
    {
      key: "urgency", header: "Urgency", render: (r: ChildWithParent) => {
        if (!needsAttention(r)) return <span className="text-muted-foreground text-xs">—</span>;
        const u = getUrgencyScore(r);
        return <FlameIcons count={u.flames} color={u.color} />;
      },
    },
    { key: "aiAgent", header: "AI Agent", render: (r: ChildWithParent) => <AIStatusBadge status={r.parent.aiAgent} /> },
    {
      key: "trialDate", header: "Date of Trial", render: (r: ChildWithParent) => {
        if (!r.trialDate) return <span className="text-muted-foreground">—</span>;
        return <span className={trialDateColor(r)}>{r.trialDate}</span>;
      },
    },
    {
      key: "trialTutor", header: "Trial Tutor", render: (r: ChildWithParent) => {
        if (!r.trialTutor) return <span className="text-muted-foreground">—</span>;
        return <span>{r.trialTutor}</span>;
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
      key: "actions", header: "", render: (r: ChildWithParent, _idx?: number) => {
        const rowIdx = paginatedLeads.indexOf(r);
        return (
          <TooltipProvider delayDuration={300}>
            <div className="flex items-center gap-0.5 opacity-0 group-hover/row:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
              {/* WhatsApp */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="p-1.5 rounded-md hover:bg-success/10 text-success"
                    onClick={() => {
                      const phone = r.parent.phone.replace(/\s+/g, "");
                      window.open(`https://wa.me/${phone}`, "_blank");
                    }}
                  >
                    <Phone size={15} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top"><p>WhatsApp</p></TooltipContent>
              </Tooltip>
              {/* Messenger */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="p-1.5 rounded-md hover:bg-info/10 text-info"
                    onClick={() => window.open("https://m.me/", "_blank")}
                  >
                    <MessageCircle size={15} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top"><p>Messenger</p></TooltipContent>
              </Tooltip>
              {/* Takeover */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-1.5 rounded-md hover:bg-purple-500/10 text-purple-500">
                    <UserCheck size={15} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top"><p>Take over from AI</p></TooltipContent>
              </Tooltip>
              {/* Quick advance */}
              {nextStatusMap[r.status] && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-1.5 rounded-md hover:bg-success/10 text-success">
                      <CheckCircle size={15} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top"><p>Advance to {nextStatusMap[r.status]}</p></TooltipContent>
                </Tooltip>
              )}
              {/* Mark as lost (inline) */}
              {r.status !== "LOST" && r.status !== "CLOSED WON" && (
                <div className="relative">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive"
                        onClick={() => setInlineLostIndex(inlineLostIndex === rowIdx ? null : rowIdx)}
                      >
                        <XCircle size={15} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top"><p>Mark as Lost</p></TooltipContent>
                  </Tooltip>
                  {inlineLostIndex === rowIdx && (
                    <div className="absolute right-0 top-full mt-1 z-50 bg-popover border border-border rounded-lg shadow-lg p-2 w-40">
                      <p className="text-[10px] text-muted-foreground mb-1 font-medium">Lost reason:</p>
                      {LOST_REASONS.filter(r => r !== "Other").map((reason) => (
                        <button
                          key={reason}
                          className="w-full text-left px-2 py-1.5 text-xs hover:bg-muted rounded-md"
                          onClick={() => setInlineLostIndex(null)}
                        >
                          {reason}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {/* View */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground" onClick={() => openPanel(r)}><Eye size={15} /></button>
                </TooltipTrigger>
                <TooltipContent side="top"><p>View details</p></TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        );
      },
    },
  ];

  const filteredColumns = columns.filter(col => effectiveVisibleColumns.has(col.key));

  const tabEmptyMessages: Record<string, string> = {
    "Needs Attention": "No leads need attention right now 🎉",
    "Inquiry": "No inquiries at this stage",
    "Trial Arranged": "No trials arranged yet",
    "Trial Done": "No completed trials yet",
    "Missed Trial": "No missed trials — great!",
  "Pending Payment": "No leads are waiting for payment",
  "Payment Failed": "No failed payments right now",
    "Closed Won": "No closed won leads yet",
    "Lost": "No lost leads — keep it up!",
  };

  // Smart bulk suggestion
  const selectedLeads = Array.from(selectedIndices).map(i => filteredLeads[i]).filter(Boolean);
  const bulkSuggestion = getBulkSuggestion(selectedLeads);

  return (
    <div>
      <DailySummary />

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
          {/* Compact toggle */}
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

      <FilterTabs
        tabs={tabs}
        activeIndex={activeTab}
        onChange={(i) => { setActiveTab(i); setSelectedIndices(new Set()); setCurrentPage(1); }}
        subtitle={tabs[activeTab].label === "Needs Attention" ? "Sorted by urgency — most urgent first" : undefined}
      />

      {viewMode === "table" ? (
        <div className={compact ? "[&_td]:py-1.5 [&_th]:py-2" : ""}>
          {shouldGroupByTrialSlot ? (
            <div className="space-y-5">
              {paginatedTrialGroups.map((group) => (
                <section key={group.key} className="space-y-2">
                  <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{group.label}</p>
                      <p className="text-xs text-muted-foreground">{group.rows.length} record{group.rows.length > 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <DataTable
                    columns={filteredColumns as any}
                    data={group.rows as any}
                    totalItems={filteredLeads.length}
                    currentPage={viewAll ? 1 : currentPage}
                    totalPages={viewAll ? 1 : totalPages}
                    indexOffset={group.startIndex}
                    onRowClick={(row) => openPanel(row as unknown as ChildWithParent)}
                    rowClassName={(row) => {
                      const r = row as unknown as ChildWithParent;
                      return cn(
                        "group/row",
                        isMessengerWarning(r) ? "border-l-[3px] border-l-warning/70" : ""
                      );
                    }}
                    emptyMessage={tabEmptyMessages[tabs[activeTab].label] || "No leads at this stage"}
                    hideFooter
                    selectable
                    selectedIndices={selectedIndices}
                    onSelectionChange={setSelectedIndices}
                  />
                </section>
              ))}

              {paginatedTrialGroups.length === 0 && (
                <DataTable
                  columns={filteredColumns as any}
                  data={[] as any}
                  totalItems={filteredLeads.length}
                  currentPage={viewAll ? 1 : currentPage}
                  totalPages={viewAll ? 1 : totalPages}
                  emptyMessage={tabEmptyMessages[tabs[activeTab].label] || "No leads at this stage"}
                  hideFooter
                  selectable
                  selectedIndices={selectedIndices}
                  onSelectionChange={setSelectedIndices}
                />
              )}

              {filteredLeads.length > 0 && (
                <div className="flex items-center justify-center gap-4 rounded-lg border border-border bg-card py-3 text-sm text-muted-foreground">
                  {!viewAll && <button className="hover:text-foreground disabled:opacity-50" disabled={currentPage <= 1} onClick={() => handlePageChange(currentPage - 1)}>Previous</button>}
                  <span>{viewAll ? `Showing all ${filteredLeads.length} results` : `Page ${currentPage} of ${totalPages} · ${filteredLeads.length} total`}</span>
                  {!viewAll && <button className="hover:text-foreground disabled:opacity-50 font-medium" disabled={currentPage >= totalPages} onClick={() => handlePageChange(currentPage + 1)}>Next</button>}
                  {filteredLeads.length > 20 && (
                    <button className="ml-2 text-xs hover:text-foreground underline underline-offset-2" onClick={() => handlePageChange(viewAll ? 1 : 0)}>
                      {viewAll ? "Paginate" : "View All"}
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
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
                return cn(
                  "group/row",
                  isMessengerWarning(r) ? "border-l-[3px] border-l-warning/70" : ""
                );
              }}
              emptyMessage={tabEmptyMessages[tabs[activeTab].label] || "No leads at this stage"}
              selectable
              selectedIndices={selectedIndices}
              onSelectionChange={setSelectedIndices}
            />
          )}
        </div>
      ) : (
        <KanbanView leads={filteredLeads} onLeadClick={openPanel} />
      )}

      {/* Bulk Action Bar */}
      {selectedIndices.size > 0 && (
        <div className="fixed bottom-0 left-64 right-0 bg-card border-t border-border shadow-lg px-6 py-3 flex items-center justify-between z-50">
          <span className="text-sm font-medium">{selectedIndices.size} student{selectedIndices.size > 1 ? "s" : ""} selected</span>
          <div className="flex items-center gap-2">
            {/* Smart suggestion */}
            {bulkSuggestion && (
              <button className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 flex items-center gap-1.5">
                <ArrowRight size={14} /> {bulkSuggestion.label}
              </button>
            )}
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
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground text-xs block mb-1">Age</span><span className="font-medium">{selectedChild.age}</span></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Level</span><span>{selectedChild.level}</span></div>
                  {selectedChild.trialDate && <div><span className="text-muted-foreground text-xs block mb-1">Trial Date</span><span className={trialDateColor(selectedChild)}>{selectedChild.trialDate}</span></div>}
                  {selectedChild.trialTutor && <div><span className="text-muted-foreground text-xs block mb-1">Trial Tutor</span><span>{selectedChild.trialTutor}</span></div>}
                  {selectedChild.packageInterest && <div><span className="text-muted-foreground text-xs block mb-1">Package Interest</span><span>{selectedChild.packageInterest}</span></div>}
                  {selectedChild.lostReason && <div><span className="text-muted-foreground text-xs block mb-1">Lost Reason</span><span>{selectedChild.lostReason}</span></div>}
                </div>

                <div className="border-t border-border pt-4">
                  <h3 className="text-sm font-semibold mb-2">Parent Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-muted-foreground text-xs block mb-1">Name</span><span className="font-medium">{selectedChild.parent.name}</span></div>
                    <div><span className="text-muted-foreground text-xs block mb-1">Phone</span><span>{selectedChild.parent.phone}</span></div>
                    <div><span className="text-muted-foreground text-xs block mb-1">Country</span><span>{countryFlags[selectedChild.parent.country] || "🌍"} {selectedChild.parent.country}</span></div>
                    <div><span className="text-muted-foreground text-xs block mb-1">Channel</span><ChannelIcon channel={selectedChild.parent.channel} /></div>
                    <div><span className="text-muted-foreground text-xs block mb-1">PSID</span><span>{selectedChild.parent.psid || "—"}</span></div>
                    <div><span className="text-muted-foreground text-xs block mb-1">Source</span><span>{selectedChild.parent.source}</span></div>
                    <div><span className="text-muted-foreground text-xs block mb-1">Assigned To</span><span>{selectedChild.parent.assignedTo}</span></div>
                  </div>
                </div>

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

              <div className="border-t border-border px-6 py-4 space-y-2">
                <button
                  onClick={() => handleOpenCreatePkg(selectedChild)}
                  className="w-full px-4 py-2.5 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:bg-accent/80 flex items-center justify-center gap-1.5 mb-1"
                >
                  <Package size={14} /> Create Student Package
                </button>
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

      {/* Create Student Package Dialog */}
      <Dialog open={createPkgOpen} onOpenChange={setCreatePkgOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Create Student Package</DialogTitle>
          </DialogHeader>
          {createPkgTarget && (
            <div className="space-y-4 py-2">
              {createPkgSuccess ? (
                <div className="rounded-lg bg-success/10 border border-success/30 p-4 text-sm text-success">
                  <CheckCircle className="inline mr-1.5" size={14} />
                  {createPkgSuccess}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground text-xs block mb-1">Student</span>
                      <span className="font-medium">{createPkgTarget.name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs block mb-1">Country</span>
                      <span>{countryFlags[createPkgTarget.parent.country]} {createPkgTarget.parent.country}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Select Package</label>
                    {availablePackages.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No packages available for {createPkgTarget.parent.country}</p>
                    ) : (
                      <Select value={selectedCatalogPkg} onValueChange={setSelectedCatalogPkg}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a package..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {availablePackages.map((p) => (
                            <SelectItem key={p.id} value={String(p.id)}>
                              {p.name} {p.totalAmount > 0 && `— ${p.currency} ${p.totalAmount.toLocaleString()}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tutor</label>
                    <Select value={selectedTutor} onValueChange={setSelectedTutor}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a tutor..." />
                      </SelectTrigger>
                      <SelectContent>
                        {tutorOptions.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Program</label>
                    <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a program..." />
                      </SelectTrigger>
                      <SelectContent>
                        {programOptions.map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Lesson Start Date & Time</label>
                    {!selectedTutor ? (
                      <p className="text-sm text-muted-foreground">Select a tutor first to see available slots</p>
                    ) : availableSlots.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No available slots for {selectedTutor}</p>
                    ) : (
                      <Select value={selectedSlot} onValueChange={(val) => {
                        setSelectedSlot(val);
                        const slot = availableSlots.find(s => `${s.date}_${s.time}` === val);
                        if (slot) {
                          const [y, m, d] = slot.date.split("-").map(Number);
                          const [h, min] = slot.time.split(":").map(Number);
                          setLessonStartDate(new Date(y, m - 1, d, h, min));
                        }
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a date & time..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {availableSlots.map((s) => (
                            <SelectItem key={`${s.date}_${s.time}`} value={`${s.date}_${s.time}`}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {lessonStartDate && lessonStartDate < new Date() && (
                      <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
                        <AlertTriangle size={12} /> Start date is in the past — status will be set to Payment Failed
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
          <DialogFooter>
            <button onClick={() => setCreatePkgOpen(false)} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted">
              {createPkgSuccess ? "Close" : "Cancel"}
            </button>
            {!createPkgSuccess && (
              <button
                onClick={handleConfirmCreatePkg}
                disabled={!selectedCatalogPkg || !lessonStartDate || !selectedTutor || !selectedProgram || !selectedSlot}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                Create Package & Invoice
              </button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
