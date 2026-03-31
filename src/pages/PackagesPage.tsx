import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import FilterTabs from "@/components/FilterTabs";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Search, Eye, MoreHorizontal, ExternalLink, Copy } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const countryFlags: Record<string, string> = {
  "Philippines": "🇵🇭", "Singapore": "🇸🇬", "Malaysia": "🇲🇾", "Australia": "🇦🇺",
  "Korea": "🇰🇷", "Dubai": "🇦🇪", "Hong Kong": "🇭🇰", "Sri Lanka": "🇱🇰",
};

const currencyColors: Record<string, string> = {
  "PHP": "bg-orange-500/15 text-orange-600",
  "SGD": "bg-success/15 text-success",
  "MYR": "bg-info/15 text-info",
  "AUD": "bg-purple-500/15 text-purple-600",
  "AED": "bg-warning/15 text-warning",
  "KRW": "bg-pink-500/15 text-pink-600",
};

export interface PackageData {
  id: number;
  name: string;
  description: string;
  type: "Recurring" | "1x" | "";
  country: string;
  currency: string;
  totalAmount: number;
  numberOfLessons: number;
  url: string;
  active: boolean;
}

export const packages: PackageData[] = [
  { id: 1, name: "PH 8 weeks", description: "", type: "Recurring", country: "Philippines", currency: "PHP", totalAmount: 6800, numberOfLessons: 8, url: "https://champcodeacademy.chargebee.com/hosted_pages/checkout", active: true },
  { id: 2, name: "PH 10 Lessons (700)", description: "", type: "Recurring", country: "Philippines", currency: "PHP", totalAmount: 7000, numberOfLessons: 10, url: "", active: true },
  { id: 3, name: "1x minecraft education premium account", description: "", type: "1x", country: "Singapore", currency: "SGD", totalAmount: 20, numberOfLessons: 1, url: "https://champcodeacademy.chargebee.com/hosted_pages/checkout", active: true },
  { id: 4, name: "PH 5 Lessons (4250)", description: "", type: "1x", country: "Philippines", currency: "PHP", totalAmount: 4250, numberOfLessons: 5, url: "", active: true },
  { id: 5, name: "PH 6 Lessons (3125)", description: "", type: "1x", country: "Philippines", currency: "PHP", totalAmount: 3125, numberOfLessons: 6, url: "", active: true },
  { id: 6, name: "PH 4 weeks (850)", description: "Please use this link for the 4 weeks class.", type: "Recurring", country: "Philippines", currency: "PHP", totalAmount: 3400, numberOfLessons: 4, url: "https://champcodeacademy.chargebee.com/hosted_pages/checkout", active: true },
  { id: 7, name: "MY 16 weeks", description: "", type: "", country: "Malaysia", currency: "MYR", totalAmount: 1040, numberOfLessons: 16, url: "", active: true },
  { id: 8, name: "Korea Level 2 20 lessons", description: "", type: "Recurring", country: "Korea", currency: "SGD", totalAmount: 560, numberOfLessons: 20, url: "", active: true },
  { id: 9, name: "MY 3 weeks", description: "", type: "1x", country: "Malaysia", currency: "MYR", totalAmount: 195, numberOfLessons: 3, url: "", active: true },
  { id: 10, name: "Champ-Code-Academy-30perless", description: "", type: "", country: "", currency: "", totalAmount: 0, numberOfLessons: 8, url: "", active: false },
  { id: 11, name: "Reservation", description: "For the AUD 10 Reservation Fee", type: "1x", country: "Australia", currency: "AUD", totalAmount: 10, numberOfLessons: 0, url: "", active: true },
  { id: 12, name: "SG 8 weeks ($40)", description: "", type: "Recurring", country: "Singapore", currency: "SGD", totalAmount: 320, numberOfLessons: 8, url: "", active: true },
  { id: 13, name: "Reservation FEE", description: "For the RM 10 Reservation Fee", type: "1x", country: "Malaysia", currency: "MYR", totalAmount: 10, numberOfLessons: 0, url: "", active: true },
  { id: 14, name: "SG 4 Weeks ($25)", description: "", type: "", country: "Singapore", currency: "SGD", totalAmount: 100, numberOfLessons: 4, url: "", active: true },
  { id: 15, name: "MY 2 weeks", description: "", type: "1x", country: "Malaysia", currency: "MYR", totalAmount: 130, numberOfLessons: 2, url: "", active: true },
  { id: 16, name: "SG 10 Weeks ($25)", description: "", type: "1x", country: "Singapore", currency: "SGD", totalAmount: 250, numberOfLessons: 10, url: "", active: true },
  { id: 17, name: "SG 8 weeks with $10 deposit", description: "When making your payment, simply apply the SG10DEPOSIT coupon", type: "1x", country: "Singapore", currency: "SGD", totalAmount: 200, numberOfLessons: 8, url: "", active: true },
  { id: 18, name: "MY 8 weeks with RM 10 deposit", description: "", type: "Recurring", country: "Malaysia", currency: "MYR", totalAmount: 520, numberOfLessons: 8, url: "https://champcodeacademy.chargebee.com/hosted_pages/checkout", active: true },
  { id: 19, name: "Champ-Code-Academy-Coding-Lessons", description: "", type: "", country: "", currency: "", totalAmount: 0, numberOfLessons: 0, url: "", active: false },
  { id: 20, name: "4 weeks", description: "", type: "Recurring", country: "Australia", currency: "AUD", totalAmount: 140, numberOfLessons: 4, url: "", active: true },
  { id: 21, name: "Dubai every 8 weeks", description: "", type: "Recurring", country: "Dubai", currency: "AED", totalAmount: 680, numberOfLessons: 8, url: "https://champcodeacademy.chargebee.com/hosted_pages/checkout", active: true },
  { id: 22, name: "PH 16 weeks", description: "", type: "1x", country: "Philippines", currency: "PHP", totalAmount: 11200, numberOfLessons: 16, url: "https://champcodeacademy.chargebee.com/hosted_pages/checkout", active: true },
  { id: 23, name: "PH Package 3 (750) 10 Lessons", description: "", type: "Recurring", country: "Philippines", currency: "PHP", totalAmount: 7500, numberOfLessons: 10, url: "", active: true },
  { id: 24, name: "PH 22 weeks", description: "", type: "1x", country: "Philippines", currency: "PHP", totalAmount: 14300, numberOfLessons: 22, url: "https://champcodeacademy.chargebee.com/hosted_pages/checkout", active: true },
  { id: 25, name: "MY 8 weeks for test", description: "", type: "Recurring", country: "Malaysia", currency: "MYR", totalAmount: 520, numberOfLessons: 8, url: "https://champcodeacademy.chargebee.com/hosted_pages/checkout", active: true },
];

const allCountries = [...new Set(packages.map(p => p.country).filter(Boolean))];

function TypeBadge({ type }: { type: string }) {
  if (type === "Recurring") return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-success/15 text-success">Recurring</span>;
  if (type === "1x") return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-info/15 text-info">1x</span>;
  return <span className="text-muted-foreground">—</span>;
}

function CurrencyBadge({ currency }: { currency: string }) {
  if (!currency) return <span className="text-muted-foreground">—</span>;
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${currencyColors[currency] || "bg-muted text-muted-foreground"}`}>{currency}</span>;
}

export default function PackagesPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedPkg, setSelectedPkg] = useState<PackageData | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const countryTabs = [
    { label: "All", count: packages.filter(p => p.active).length },
    ...allCountries.map(c => ({ label: c, count: packages.filter(p => p.country === c && p.active).length })),
    { label: "Inactive", count: packages.filter(p => !p.active).length },
  ];

  const filtered = packages.filter((pkg) => {
    const tab = countryTabs[activeTab].label;
    if (tab === "Inactive") return !pkg.active;
    if (tab !== "All" && pkg.country !== tab) return false;
    if (tab !== "Inactive" && !pkg.active) return false;
    if (search && !pkg.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openPanel = (pkg: PackageData) => {
    setSelectedPkg(pkg);
    setPanelOpen(true);
  };

  const formatAmount = (amount: number, currency: string) => {
    if (!currency || amount === 0) return "—";
    return `${currency} ${amount.toLocaleString("en", { minimumFractionDigits: 2 })}`;
  };

  const pricePerLesson = (pkg: PackageData) => {
    if (!pkg.numberOfLessons || !pkg.totalAmount) return "—";
    return `${pkg.currency} ${(pkg.totalAmount / pkg.numberOfLessons).toFixed(2)}`;
  };

  const columns = [
    { key: "id", header: "#", render: (r: PackageData) => <span className="text-muted-foreground">{r.id}</span>, className: "w-12" },
    { key: "name", header: "Payment Plan", render: (r: PackageData) => <span className="font-medium">{r.name}</span> },
    { key: "type", header: "Type", render: (r: PackageData) => <TypeBadge type={r.type} /> },
    { key: "country", header: "Country", render: (r: PackageData) => r.country ? <span>{countryFlags[r.country] || "🌍"} {r.country}</span> : <span className="text-muted-foreground">—</span> },
    { key: "currency", header: "Currency", render: (r: PackageData) => <CurrencyBadge currency={r.currency} /> },
    { key: "totalAmount", header: "Total Amount", render: (r: PackageData) => <span className="font-mono text-sm">{formatAmount(r.totalAmount, r.currency)}</span> },
    { key: "numberOfLessons", header: "Lessons", render: (r: PackageData) => <span>{r.numberOfLessons || "—"}</span> },
    { key: "perLesson", header: "Per Lesson", render: (r: PackageData) => <span className="text-muted-foreground text-xs">{pricePerLesson(r)}</span> },
    {
      key: "url", header: "Link", render: (r: PackageData) => r.url ? (
        <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <ExternalLink size={13} />
        </a>
      ) : <span className="text-muted-foreground">—</span>,
    },
    {
      key: "actions", header: "", render: (r: PackageData) => (
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground" onClick={() => openPanel(r)}><Eye size={15} /></button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"><MoreHorizontal size={15} /></button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {r.url && (
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(r.url)}>
                  <Copy size={14} className="mr-2" /> Copy Link
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>Edit Package</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">{r.active ? "Deactivate" : "Activate"}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Packages" subtitle="Manage payment plans and pricing across countries">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              className="pl-9 pr-4 py-2 border border-border rounded-lg text-sm bg-background placeholder:text-muted-foreground w-64"
              placeholder="Search packages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </PageHeader>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Active Packages", value: packages.filter(p => p.active).length },
          { label: "Countries", value: allCountries.length },
          { label: "Recurring Plans", value: packages.filter(p => p.type === "Recurring" && p.active).length },
          { label: "One-time Plans", value: packages.filter(p => p.type === "1x" && p.active).length },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-lg font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      <FilterTabs tabs={countryTabs} activeIndex={activeTab} onChange={setActiveTab} />

      <DataTable
        columns={columns as any}
        data={filtered as any}
        totalItems={filtered.length}
        currentPage={1}
        totalPages={Math.max(1, Math.ceil(filtered.length / 25))}
        onRowClick={(row) => openPanel(row as unknown as PackageData)}
        rowClassName={(row) => {
          const r = row as unknown as PackageData;
          return !r.active ? "opacity-50" : "";
        }}
        emptyMessage="No packages found"
      />

      {/* Package Detail Panel */}
      <Sheet open={panelOpen} onOpenChange={setPanelOpen}>
        <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto p-0">
          {selectedPkg && (
            <div className="flex flex-col h-full">
              <SheetHeader className="px-6 py-5 border-b border-border">
                <SheetTitle className="text-lg">{selectedPkg.name}</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground text-xs block mb-1">Type</span><TypeBadge type={selectedPkg.type} /></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Status</span>{selectedPkg.active ? <StatusBadge variant="enrolled">Active</StatusBadge> : <StatusBadge variant="cold">Inactive</StatusBadge>}</div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Country</span><span>{countryFlags[selectedPkg.country] || "🌍"} {selectedPkg.country || "—"}</span></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Currency</span><CurrencyBadge currency={selectedPkg.currency} /></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Total Amount</span><span className="font-semibold">{formatAmount(selectedPkg.totalAmount, selectedPkg.currency)}</span></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Number of Lessons</span><span className="font-semibold">{selectedPkg.numberOfLessons || "—"}</span></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Price Per Lesson</span><span>{pricePerLesson(selectedPkg)}</span></div>
                </div>
                {selectedPkg.description && (
                  <div className="border-t border-border pt-4">
                    <span className="text-muted-foreground text-xs block mb-1">Description</span>
                    <p className="text-sm">{selectedPkg.description}</p>
                  </div>
                )}
                {selectedPkg.url && (
                  <div className="border-t border-border pt-4">
                    <span className="text-muted-foreground text-xs block mb-1">Payment Link</span>
                    <a href={selectedPkg.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1.5">
                      <ExternalLink size={13} /> {selectedPkg.url.length > 50 ? selectedPkg.url.substring(0, 50) + "..." : selectedPkg.url}
                    </a>
                  </div>
                )}
              </div>
              <div className="border-t border-border px-6 py-4 flex gap-2">
                {selectedPkg.url && (
                  <button onClick={() => navigator.clipboard.writeText(selectedPkg.url)} className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted flex items-center justify-center gap-1.5">
                    <Copy size={14} /> Copy Payment Link
                  </button>
                )}
                <button className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">Edit Package</button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
