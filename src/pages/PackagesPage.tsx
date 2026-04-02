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
  "Indonesia": "🇮🇩", "New Zealand": "🇳🇿", "Vietnam": "🇻🇳",
};

const currencyColors: Record<string, string> = {
  "PHP": "bg-orange-500/15 text-orange-600",
  "SGD": "bg-success/15 text-success",
  "MYR": "bg-info/15 text-info",
  "AUD": "bg-purple-500/15 text-purple-600",
  "AED": "bg-warning/15 text-warning",
  "KRW": "bg-pink-500/15 text-pink-600",
  "HKD": "bg-info/15 text-info",
  "LKR": "bg-warning/15 text-warning",
  "IDR": "bg-muted text-muted-foreground",
  "NZD": "bg-success/15 text-success",
  "VND": "bg-warning/15 text-warning",
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

const packageNames = [
  "PH 8 weeks",
  "PH 10 Lessons ( 700)",
  "1x minecraft education premium account",
  "PH 5 Lessons (4250)",
  "PH 6 Lessons (3125)",
  "PH 4 weeks (850)",
  "MY 16 weeks",
  "Korea Level 2 20 lessons",
  "MY 3 weeks",
  "Champ-Code-Academy-30perlesson-SGD-Every-8-weeks",
  "Reservation",
  "SG 8 weeks ($40)",
  "Reservation FEE",
  "SG 4 Weeks ($25)",
  "MY 2 weeks",
  "SG 10 Weeks ($25)",
  "SG 8 weeks with $10 deposit",
  "MY 8 weeks with RM 10 deposit",
  "Champ-Code-Academy-Coding-Lessons-PH-PHP-Every-23-weeks",
  "4 weeks",
  "Dubai every 8 weeks",
  "PH 16 weeks",
  "PH Package 3 (750) 10 Lessons",
  "PH 22 weeks",
  "MY 8 weeks for test",
  "PH Package 3 Installment plan 4 weeks",
  "SG 5 Weeks ($25)",
  "SG 18 weeks ($25)",
  "SG 15 weeks ($30)",
  "PH 8 weeks (5000)",
  "PH 7 weeks (850)",
  "PH 8 weeks (6800)",
  "PH 17 weeks(₱650)",
  "PH 8 Lessons (875)",
  "SG package 1 4 week instalment ($100)",
  "PH 8 Weeks (700)",
  "SG Level 2 20 lessons",
  "SG 10 weeks ($30)",
  "SG 22 weeks ($25)",
  "MY 22 weeks",
  "PH 6 Weeks (850) Group",
  "test-automation-1sgd",
  "PH 1 Week (1050)",
  "PH 3 Weeks (850)",
  "450 PHP every 8 weeks (Lecture)",
  "SG 4 weeks ($40)",
  "MY 6 Lessons (RM 65)",
  "SG 23 weeks ($25)",
  "SG 8 weeks ($30)",
  "test-MYR-Every-8-weeks",
  "Sri Lanka 8 weeks",
  "SG Mastery Plan MC1 (22 weeks)",
  "SG 4 weeks ($30)",
  "MY Monthly installment 4 weeks",
  "SG Level 2 50 lessons",
  "PH 4 Weeks (1100) Private",
  "MY 12 Weeks",
  "MY Roblox 23 weeks",
  "SG 8 weeks ($32)",
  "PH 18 weeks",
  "MY 25 weeks (RB 2)",
  "SG 8 Weeks Plan with $10 Deposit",
  "SG 7 Weeks ($25)",
  "PH Package 2 Roblox 2 (20 lessons)",
  "Champ-Code-Academy-850perlesson-PHP-Every-8-weeks",
  "PH 23 weeks(₱650)",
  "MY 5 Weeks ( RB 2 )",
  "PH Package 1 Installment plan 4 weeks (22 Lessons)",
  "MY 8 weeks PRIVATE",
  "SG 1 Week ($40)",
  "SG Mastery Plan Roblox1 (23 weeks)",
  "Champ-Code-Academy-Coding-Lessons-SGD-SGD-Every-8-weeks",
  "PH 23 weeks(₱850)",
  "SG 16 weeks ($25)",
  "PH 13 weeks (850)",
  "PH 8 weeks (8400)",
  "SG Mastery Plan MC1 (22 weeks)",
  "MY 22 weeks ( MC Group Class )",
  "PH 4 Weeks (625)",
  "PH 8 weeks Private",
  "MY 8 weeks",
  "SG 8 Weeks ($25)",
  "Champ-Code-Academy-Test-PHP-Every-4-weeks",
  "PH 2 Weeks (850)",
  "8 weeks",
  "MY 22 weeks (MC Private)",
  "SG 6 Lessons ($25)",
  "SG Level 2 20 lessons ($25)",
  "SG $10 Deposit",
  "MY 30RM Deposit",
  "SG 6 weeks($40)",
  "MY 2 weeks (WebD Private)",
  "MY 7 weeks",
  "SG 2 weeks ($25)",
  "PH 4 weeks (₱450)",
  "PH 1 Week (850)",
  "SG 3 weeks ($25)",
  "SG 15 weeks ($40)",
  "PH weekly payment (₱850)",
  "MY weekly payment (65MYR)",
  "PH Package 2 Roblox 2 (20 lessons) (650)",
  "SG 18 weeks ($30)",
  "SG 10 weeks ($40)",
  "SG 4 weeks ($80)",
  "PH Package 2 Roblox 2 (20 lessons) (750)",
  "6 weeks",
  "SG 23 weeks Mastery Plan ( Private )",
  "MY 5 Weeks",
  "PH 15 weeks (850)",
  "MY 10 weeks ( level 2 )",
  "PH 5 weeks (850)",
  "MY 15 weeks",
  "SG 5 Weeks ($30)",
  "MY Package 1 Roblox 2 (50 Lessons)",
  "MY 14 weeks",
  "MY 14 weeks",
  "MY MC Level 2 - 40 weeks",
  "SG 1 Week ($30)",
  "SG 14 Weeks ($30)",
  "SG Intro to AI Camp",
  "SG $10 Deposit",
  "PH 500PHP Deposit",
  "MY 30MYR Deposit",
  "SG 3 Weeks ($30)",
  "SG 25 Weeks ($25)",
  "PH 18 Weeks (Website Design Package 1)",
  "SG 8 weeks Private ($60)",
  "AED 4 weeks (AED 85)",
  "MY Package 2 Roblox 2 (20 Lessons)",
  "AUS 8 weeks (35AUD)",
  "Dubai 8 weeks (85AED)",
  "Dubai 8 weeks (85AED) 1x",
  "Dubai 4 weeks (85AED) 1x ",
  "Dubai 4 weeks (85AED) 1x",
  "Dubai 4 weeks (55AED)",
  "Dubai 8 weeks (55AED)",
  "Dubai Roblox AI Camp",
  "Hong Kong 8 weeks (180HKD)",
  "Hong Kong 8 weeks (360HKD) private",
  "Hong Kong 4 weeks (180HKD)",
  "Hong Kong 23 weeks (180HKD)",
  "Dubai 23 weeks (AED 85)",
  "Indonesia 4 weeks (250,000.00IDR)",
  "Indonesia 8 weeks (250,000.00IDR)",
  "New Zealand 4 weeks (40NZD)",
  "New Zealand 8 weeks (40NZD)",
  "Vietnam 4 weeks (400000VND)",
  "Vietnam 8 weeks (400000VND)",
  "Dubai 30AED Deposit",
  "Hong Kong 60HKD Deopsit",
  "MY Camp (5 Days)",
  "SG 5 Weeks ($40)",
  "MY 30 lessons (RB2)",
  "PH 6 Weeks (750) Group",
  "SG 6 Weeks ($30)",
  "Hong Kong 4 weeks 1x",
  "Hong Kong 8 weeks 1x",
  "Sri Lanka 8 weeks (4750LKR)",
  "Sri Lanka 4 weeks (4750LKR)",
  "Korea 8 weeks (32500KRW)",
  "Korea 4 weeks (32500KRW)",
  "Dubai 23 weeks (AED 55)",
  "PH 10 Lessons (850)",
  "Hong Kong 8 weeks (165HKD)",
  "Sri Lanka 23 weeks (3800LKR)",
  "Dubai 8 weeks (70AED)",
  "Dubai 4 weeks (70AED)",
  "PH 12 weeks(₱650)",
  "PH 11 weeks(₱650)",
  "PH Package 1 Installment plan 4 weeks (23 Lessons)",
  "Sri Lanka 8 weeks (3800LKR)",
  "Sri Lanka 4 weeks (3800LKR)",
  "Sri Lanka 2500LKR Deposit",
  "PH 8 Weeks (5200)",
  "Hong Kong 8 weeks (360HKD) private - 2 lessons per week",
  "Hong Kong 7 weeks Private 1x",
  "PH 4 weeks - 2 lessons per week (₱850)",
  "PH 4 weeks",
  "PH 10 Lessons (750)",
  "MY 1 Week",
  "PH 14 weeks (650)",
  "PH 16 weeks (650) Python",
  "SG 3 weeks ($40)",
  "PH 4 weeks Python (650)",
  "PH 3 weeks (625)",
  "SG 11 weeks ($25)",
  "SG 9 weeks ($30)",
  "MY Mastery Monthly installment 4 weeks",
  "MY Mastery 23 weeks",
  "SG 13 weeks ($25)",
  "Dubai 4weeks Mastery 23 weeks (55AED)",
  "SG 2 weeks ($30)",
];

const countryMatchers: Array<[string, string]> = [
  ["Philippines", "PH"],
  ["Singapore", "SG"],
  ["Malaysia", "MY"],
  ["Australia", "AUS"],
  ["Korea", "Korea"],
  ["Dubai", "Dubai"],
  ["Hong Kong", "Hong Kong"],
  ["Sri Lanka", "Sri Lanka"],
  ["Indonesia", "Indonesia"],
  ["New Zealand", "New Zealand"],
  ["Vietnam", "Vietnam"],
  ["Australia", "AUD"],
  ["Dubai", "AED"],
];

const currencyMatchers: Array<[string, string]> = [
  ["PHP", "PHP"],
  ["PHP", "₱"],
  ["SGD", "SGD"],
  ["SGD", "$"],
  ["MYR", "MYR"],
  ["MYR", "RM"],
  ["AUD", "AUD"],
  ["AED", "AED"],
  ["KRW", "KRW"],
  ["HKD", "HKD"],
  ["LKR", "LKR"],
  ["IDR", "IDR"],
  ["NZD", "NZD"],
  ["VND", "VND"],
];

function inferCountry(name: string) {
  const matched = countryMatchers.find(([, token]) => name.includes(token));
  return matched?.[0] ?? "";
}

function inferCurrency(name: string, country: string) {
  const matched = currencyMatchers.find(([, token]) => name.includes(token));
  if (matched) return matched[0];
  const byCountry: Record<string, string> = {
    Philippines: "PHP",
    Singapore: "SGD",
    Malaysia: "MYR",
    Australia: "AUD",
    Korea: "KRW",
    Dubai: "AED",
    "Hong Kong": "HKD",
    "Sri Lanka": "LKR",
    Indonesia: "IDR",
    "New Zealand": "NZD",
    Vietnam: "VND",
  };
  return byCountry[country] ?? "";
}

function inferLessons(name: string) {
  const lessonMatch = name.match(/(\d+)\s*lessons?/i);
  if (lessonMatch) return Number(lessonMatch[1]);
  const weekMatch = name.match(/(\d+)\s*weeks?/i);
  if (weekMatch) return Number(weekMatch[1]);
  if (/1x/i.test(name)) return 1;
  if (/deposit|reservation/i.test(name)) return 0;
  return 0;
}

function inferAmount(name: string, lessons: number) {
  const compact = name.replace(/,/g, "");
  const bracket = compact.match(/\((?:[^\d]*)(\d+(?:\.\d+)?)\)/);
  if (bracket) {
    const amount = Number(bracket[1]);
    if (/weeks?/i.test(name) && !/private - 2 lessons per week/i.test(name) && lessons > 1 && !/deposit|reservation/i.test(name)) {
      return amount * lessons;
    }
    return amount;
  }

  const inlineCurrency = compact.match(/(\d+(?:\.\d+)?)(PHP|MYR|AUD|AED|KRW|HKD|LKR|IDR|NZD|VND)/i);
  if (inlineCurrency) return Number(inlineCurrency[1]);

  const leadingPhp = compact.match(/^(\d+(?:\.\d+)?)\s*PHP/i);
  if (leadingPhp) return Number(leadingPhp[1]) * Math.max(lessons, 1);

  if (/deposit/i.test(name)) {
    const deposit = compact.match(/(\d+(?:\.\d+)?)/);
    return deposit ? Number(deposit[1]) : 0;
  }

  return 0;
}

function inferType(name: string) {
  if (/1x|deposit|reservation|camp|premium account/i.test(name)) return "1x" as const;
  if (/weeks?|weekly|every-|every\s|monthly|installment/i.test(name)) return "Recurring" as const;
  return "" as const;
}

export const packages: PackageData[] = packageNames.map((name, index) => {
  const country = inferCountry(name);
  const currency = inferCurrency(name, country);
  const numberOfLessons = inferLessons(name);

  return {
    id: index + 1,
    name,
    description: "",
    type: inferType(name),
    country,
    currency,
    totalAmount: inferAmount(name, numberOfLessons),
    numberOfLessons,
    url: name.includes("Champ-Code-Academy") ? "https://champcodeacademy.chargebee.com/hosted_pages/checkout" : "",
    active: true,
  };
});

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
