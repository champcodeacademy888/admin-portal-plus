import { useMemo, useState } from "react";
import { Eye, Search } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import FilterTabs from "@/components/FilterTabs";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { countryFlags, formatMoney, studentPackages, type StudentPackageRecord } from "@/data/studentPackagesData";

const packageStatusVariants = {
  Pending: "scheduled",
  Active: "enrolled",
  "Payment Due": "pending",
  Completed: "completed",
} as const;

const packageTabs = ["All", "Pending", "Active", "Payment Due", "Completed"] as const;

export default function StudentPackagesPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<StudentPackageRecord | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const filtered = useMemo(() => {
    const activeLabel = packageTabs[activeTab];

    return studentPackages.filter((record) => {
      if (activeLabel !== "All" && record.status !== activeLabel) return false;

      if (search) {
        const query = search.toLowerCase();
        return [
          record.id,
          record.studentId,
          record.studentName,
          record.parentName,
          record.leadRecordId,
          record.program,
          record.packageName,
        ].some((value) => value.toLowerCase().includes(query));
      }

      return true;
    });
  }, [activeTab, search]);

  const tabs = packageTabs.map((label) => ({
    label,
    count: label === "All" ? studentPackages.length : studentPackages.filter((record) => record.status === label).length,
  }));

  const columns = [
    {
      key: "student",
      header: "Student",
      render: (record: StudentPackageRecord) => (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-muted-foreground">{record.studentId}</span>
            <span className="font-medium">{record.studentName}</span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">{record.parentName}</div>
        </div>
      ),
    },
    {
      key: "leadRecordId",
      header: "Lead Record",
      render: (record: StudentPackageRecord) => <span className="font-mono text-xs text-muted-foreground">{record.leadRecordId}</span>,
    },
    {
      key: "program",
      header: "Program",
      render: (record: StudentPackageRecord) => <span>{record.program}</span>,
    },
    {
      key: "packageName",
      header: "Student Package",
      render: (record: StudentPackageRecord) => <span className="font-medium">{record.packageName}</span>,
    },
    {
      key: "terms",
      header: "Terms",
      render: (record: StudentPackageRecord) => <span>{record.termCount}</span>,
    },
    {
      key: "invoiceProgress",
      header: "Invoices Paid",
      render: (record: StudentPackageRecord) => <span>{record.paidInvoices} / {record.totalInvoices}</span>,
    },
    {
      key: "balance",
      header: "Balance",
      render: (record: StudentPackageRecord) => <span className="font-mono text-sm">{formatMoney(record.balanceAmount, record.currency)}</span>,
    },
    {
      key: "country",
      header: "Country",
      render: (record: StudentPackageRecord) => <span>{countryFlags[record.country] || "🌍"} {record.country}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (record: StudentPackageRecord) => <StatusBadge variant={packageStatusVariants[record.status]}>{record.status}</StatusBadge>,
    },
    {
      key: "actions",
      header: "",
      render: (record: StudentPackageRecord) => (
        <button
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
          onClick={(event) => {
            event.stopPropagation();
            setSelectedPackage(record);
            setPanelOpen(true);
          }}
          title="View package"
        >
          <Eye size={15} />
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Student Packages" subtitle="Packages linked to closed won lead records and completed only after all invoices are paid">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            className="pl-9 pr-4 py-2 border border-border rounded-lg text-sm bg-background placeholder:text-muted-foreground w-72"
            placeholder="Search student packages..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </PageHeader>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Closed Won Packages", value: studentPackages.length },
          { label: "Completed", value: studentPackages.filter((record) => record.status === "Completed").length },
          { label: "With Payment Due", value: studentPackages.filter((record) => record.status === "Payment Due").length },
          { label: "Open Balance", value: studentPackages.reduce((sum, record) => sum + record.balanceAmount, 0).toLocaleString("en") },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="text-lg font-bold text-foreground">{item.value}</p>
          </div>
        ))}
      </div>

      <FilterTabs tabs={tabs} activeIndex={activeTab} onChange={setActiveTab} />

      <DataTable
        columns={columns as never}
        data={filtered as never}
        totalItems={filtered.length}
        emptyMessage="No student packages found"
        onRowClick={(row) => {
          setSelectedPackage(row as unknown as StudentPackageRecord);
          setPanelOpen(true);
        }}
      />

      <Sheet open={panelOpen} onOpenChange={setPanelOpen}>
        <SheetContent className="w-[620px] sm:max-w-[620px] overflow-y-auto p-0">
          {selectedPackage && (
            <div className="flex flex-col h-full">
              <SheetHeader className="px-6 py-5 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">{selectedPackage.id}</span>
                  <SheetTitle className="text-lg">{selectedPackage.studentName}</SheetTitle>
                  <StatusBadge variant={packageStatusVariants[selectedPackage.status]}>{selectedPackage.status}</StatusBadge>
                </div>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground text-xs block mb-1">Student ID</span><span>{selectedPackage.studentId}</span></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Lead Record</span><span className="font-mono">{selectedPackage.leadRecordId}</span></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Program</span><span>{selectedPackage.program}</span></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Parent</span><span>{selectedPackage.parentName}</span></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Package</span><span>{selectedPackage.packageName}</span></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Terms</span><span>{selectedPackage.termCount}</span></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Paid Invoices</span><span>{selectedPackage.paidInvoices} / {selectedPackage.totalInvoices}</span></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Total Amount</span><span>{formatMoney(selectedPackage.totalAmount, selectedPackage.currency)}</span></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Paid Amount</span><span>{formatMoney(selectedPackage.paidAmount, selectedPackage.currency)}</span></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Balance</span><span>{formatMoney(selectedPackage.balanceAmount, selectedPackage.currency)}</span></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Package Start</span><span>{selectedPackage.packageStartDate}</span></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Package End</span><span>{selectedPackage.packageEndDate}</span></div>
                </div>

                <div className="border-t border-border pt-4 space-y-3">
                  <h3 className="text-sm font-semibold">Linked Invoices</h3>
                  {selectedPackage.invoices.map((invoice) => (
                    <div key={invoice.id} className="rounded-lg border border-border bg-card p-4">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div>
                          <p className="font-medium text-sm">{invoice.id}</p>
                          <p className="text-xs text-muted-foreground">Term {invoice.termNumber} · Due {invoice.dueDate}</p>
                        </div>
                        <StatusBadge variant={invoice.status === "Paid" ? "completed" : invoice.status === "Overdue" ? "pending" : "scheduled"}>
                          {invoice.status}
                        </StatusBadge>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div><span className="text-muted-foreground text-xs block mb-1">Amount</span><span>{formatMoney(invoice.amount, invoice.currency)}</span></div>
                        <div><span className="text-muted-foreground text-xs block mb-1">Issued</span><span>{invoice.issuedDate}</span></div>
                        <div><span className="text-muted-foreground text-xs block mb-1">Paid Date</span><span>{invoice.paidDate || "—"}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}