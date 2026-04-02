import { useState, useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import { Search, Plus, ThumbsUp, ThumbsDown, X, Eye } from "lucide-react";
import { tutors, tutorCountryFlags } from "@/data/tutorsData";
import { parents } from "@/data/parentsData";
import { format, subDays } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface PerformanceRecord {
  id: string;
  tutorName: string;
  parentName: string;
  type: "Compliment" | "Complaint";
  note: string;
  imageUrl: string | null;
  date: string;
}

// Seed some dummy records
const seedRecords: PerformanceRecord[] = [
  { id: "PR-1", tutorName: "James Yeo", parentName: "Sarah Tan", type: "Compliment", note: "Parent praised James for being very patient with her child.", imageUrl: null, date: "28 Mar 2026" },
  { id: "PR-2", tutorName: "Abigael Pastrana", parentName: "Maria Santos", type: "Compliment", note: "Child loves Abigael's teaching style.", imageUrl: null, date: "27 Mar 2026" },
  { id: "PR-3", tutorName: "Dickson Hau", parentName: "Lim Wei Ming", type: "Complaint", note: "Parent felt the lesson was too fast-paced for the child.", imageUrl: null, date: "26 Mar 2026" },
  { id: "PR-4", tutorName: "Divina Violet", parentName: "Priya Sharma", type: "Compliment", note: "Excellent progress report shared by tutor.", imageUrl: null, date: "25 Mar 2026" },
  { id: "PR-5", tutorName: "Lester Tan", parentName: "David Lee", type: "Complaint", note: "Lesson started late by 10 minutes.", imageUrl: null, date: "24 Mar 2026" },
  { id: "PR-6", tutorName: "Melinda Chua", parentName: "Jenny Koh", type: "Compliment", note: "Parent shared screenshot of child's completed project — very impressed.", imageUrl: null, date: "23 Mar 2026" },
];

let nextId = seedRecords.length + 1;

export default function TutorPerformancePage() {
  const [records, setRecords] = useState<PerformanceRecord[]>(seedRecords);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "Compliment" | "Complaint">("all");
  const [addOpen, setAddOpen] = useState(false);
  const [viewImage, setViewImage] = useState<string | null>(null);

  // Form state
  const [formTutor, setFormTutor] = useState("");
  const [formParent, setFormParent] = useState("");
  const [formType, setFormType] = useState<"Compliment" | "Complaint">("Compliment");
  const [formNote, setFormNote] = useState("");
  const [formImage, setFormImage] = useState<string | null>(null);
  const [formFileName, setFormFileName] = useState("");

  const parentNames = useMemo(() => [...new Set(parents.map(p => p.name))].sort(), []);

  const filtered = useMemo(() => {
    return records.filter(r => {
      if (typeFilter !== "all" && r.type !== typeFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!r.tutorName.toLowerCase().includes(s) && !r.parentName.toLowerCase().includes(s) && !r.note.toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [records, search, typeFilter]);

  const complimentCount = records.filter(r => r.type === "Compliment").length;
  const complaintCount = records.filter(r => r.type === "Complaint").length;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setFormImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!formTutor || !formParent || !formNote) return;
    nextId++;
    const newRecord: PerformanceRecord = {
      id: `PR-${nextId}`,
      tutorName: formTutor,
      parentName: formParent,
      type: formType,
      note: formNote,
      imageUrl: formImage,
      date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    };
    setRecords(prev => [newRecord, ...prev]);
    setAddOpen(false);
    setFormTutor("");
    setFormParent("");
    setFormType("Compliment");
    setFormNote("");
    setFormImage(null);
    setFormFileName("");
  };

  return (
    <div>
      <PageHeader title="Tutor Performance" subtitle="Track compliments and complaints from parents">
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
        >
          <Plus size={16} /> Add Record
        </button>
      </PageHeader>

      {/* Summary */}
      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-success/10 border border-success/20">
          <ThumbsUp size={16} className="text-success" />
          <span className="text-sm font-medium">{complimentCount} Compliments</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-destructive/10 border border-destructive/20">
          <ThumbsDown size={16} className="text-destructive" />
          <span className="text-sm font-medium">{complaintCount} Complaints</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tutors, parents, or notes..."
            className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
          {(["all", "Compliment", "Complaint"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                typeFilter === t ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t === "all" ? "All" : t + "s"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-xl overflow-hidden bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-left">
              <th className="px-4 py-2.5 font-medium text-muted-foreground">Date</th>
              <th className="px-4 py-2.5 font-medium text-muted-foreground">Tutor</th>
              <th className="px-4 py-2.5 font-medium text-muted-foreground">Parent</th>
              <th className="px-4 py-2.5 font-medium text-muted-foreground text-center">Type</th>
              <th className="px-4 py-2.5 font-medium text-muted-foreground">Note</th>
              <th className="px-4 py-2.5 font-medium text-muted-foreground text-center">Screenshot</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No records found</td></tr>
            )}
            {filtered.map(r => (
              <tr key={r.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{r.date}</td>
                <td className="px-4 py-2.5 font-medium">{r.tutorName}</td>
                <td className="px-4 py-2.5">{r.parentName}</td>
                <td className="px-4 py-2.5 text-center">
                  <span className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                    r.type === "Compliment" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                  )}>
                    {r.type === "Compliment" ? <ThumbsUp size={11} /> : <ThumbsDown size={11} />}
                    {r.type}
                  </span>
                </td>
                <td className="px-4 py-2.5 max-w-xs truncate">{r.note}</td>
                <td className="px-4 py-2.5 text-center">
                  {r.imageUrl ? (
                    <button onClick={() => setViewImage(r.imageUrl)} className="text-primary hover:text-primary/80">
                      <Eye size={16} />
                    </button>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Record Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Performance Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tutor</label>
              <Select value={formTutor} onValueChange={setFormTutor}>
                <SelectTrigger><SelectValue placeholder="Select a tutor..." /></SelectTrigger>
                <SelectContent className="max-h-60">
                  {tutors.map(t => (
                    <SelectItem key={t.id} value={t.name}>
                      {tutorCountryFlags[t.country]} {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Parent</label>
              <Select value={formParent} onValueChange={setFormParent}>
                <SelectTrigger><SelectValue placeholder="Select a parent..." /></SelectTrigger>
                <SelectContent className="max-h-60">
                  {parentNames.map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Type</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFormType("Compliment")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors",
                    formType === "Compliment" ? "bg-success/10 border-success text-success" : "border-border text-muted-foreground hover:bg-muted"
                  )}
                >
                  <ThumbsUp size={14} /> Compliment
                </button>
                <button
                  onClick={() => setFormType("Complaint")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors",
                    formType === "Complaint" ? "bg-destructive/10 border-destructive text-destructive" : "border-border text-muted-foreground hover:bg-muted"
                  )}
                >
                  <ThumbsDown size={14} /> Complaint
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Note</label>
              <textarea
                value={formNote}
                onChange={e => setFormNote(e.target.value)}
                placeholder="Describe the feedback..."
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none h-20"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Screenshot (optional)</label>
              <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <Plus size={16} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{formFileName || "Upload screenshot"}</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
              {formImage && (
                <div className="mt-2 relative inline-block">
                  <img src={formImage} alt="Preview" className="h-20 rounded-lg border border-border" />
                  <button onClick={() => { setFormImage(null); setFormFileName(""); }} className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5">
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setAddOpen(false)} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted">Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={!formTutor || !formParent || !formNote}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              Add Record
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Screenshot Dialog */}
      <Dialog open={!!viewImage} onOpenChange={() => setViewImage(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Screenshot</DialogTitle>
          </DialogHeader>
          {viewImage && <img src={viewImage} alt="Screenshot" className="w-full rounded-lg" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
