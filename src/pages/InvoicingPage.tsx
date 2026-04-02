import { useMemo, useState } from "react";
import { Eye, Search } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import FilterTabs from "@/components/FilterTabs";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { countryFlags, formatMoney, invoices, studentPackages, type InvoiceRecord } from "@/data/studentPackagesData";

const invoiceTabs = ["All", "Paid", "Pending", "Overdue"] as const;

export default function InvoicingPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const filtered = useMemo(() => {
    const activeLabel = invoiceTabs[activeTab];

    return invoices.filter((invoice) => {
      if (activeLabel !== "All" && invoice.status !== activeLabel) return false;

      if (search) {
        const query = search.toLowerCase();
        return [
          invoice.id,
          invoice.packageId,
          invoice.leadRecordId,
          invoice.studentId,
          invoice.studentName,
          invoice.parentName,
          invoice.packageName,
          invoice.program,
        ].some((value) => value.toLowerCase().includes(query));
      }

      return true;
    });
  }, [activeTab, search]);

  const tabs = invoiceTabs.map((label) => ({
    label,
    count: label === "All" ? invoices.length : invoices.filter((invoice) => invoice.status === label).length,
  }));

  const columns = [
    {
      key: "invoice",
      header: "Invoice",
      render: (invoice: InvoiceRecord) => (
        <div>
          <div className="font-medium">{invoice.id}</div>
          <div className="text-[11px] text-muted-foreground">{invoice.packageId}</div>
        </div>
      ),
    },
    {
      key: "student",
      header: "Student",
      render: (invoice: InvoiceRecord) => (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-muted-foreground">{invoice.studentId}</span>
            <span className="font-medium">{invoice.studentName}</span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">{invoice.parentName}</div>
        </div>
      ),
    },
    {
      key: "leadRecordId",
      header: "Lead Record",
      render: (invoice: InvoiceRecord) => <span className="font-mono text-xs text-muted-foreground">{invoice.leadRecordId}</span>,
    },
    {
      key: "program",
      header: "Program",
      render: (invoice: InvoiceRecord) => <span>{invoice.program}</span>,
    },
    {
      key: "termNumber",
      header: "Term",
      render: (invoice: InvoiceRecord) => <span>{invoice.termNumber}</span>,
    },
    {
      key: "dueDate",
      header: "Due Date",
      render: (invoice: InvoiceRecord) => <span>{invoice.dueDate}</span>,
    },
    {
      key: "amount",
      header: "Amount",
      render: (invoice: InvoiceRecord) => <span className="font-mono text-sm">{formatMoney(invoice.amount, invoice.currency)}</span>,
    },
    {
      key: "country",
      header: "Country",
      render: (invoice: InvoiceRecord) => <span>{countryFlags[invoice.country] || "🌍"} {invoice.country}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (invoice: InvoiceRecord) => (
        <StatusBadge variant={invoice.status === "Paid" ? "completed" : invoice.status === "Overdue" ? "pending" : "scheduled"}>
          {invoice.status}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (invoice: InvoiceRecord) => (
        <button
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
          onClick={(event) => {
            event.stopPropagation();
            setSelectedInvoice(invoice);
            setPanelOpen(true);
          }}
          title="View invoice"
        >
          <Eye size={15} />
        </button>
      ),
    },
  ];

  const linkedPackage = selectedInvoice
    ? studentPackages.find((record) => record.id === selectedInvoice.packageId)
    : null;

  return (
    <div>
      <PageHeader title="Invoicing" subtitle="Invoices linked to student packages from closed won lead records">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            className="pl-9 pr-4 py-2 border border-border rounded-lg text-sm bg-background placeholder:text-muted-foreground w-72"
            placeholder="Search invoices..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </PageHeader>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Invoices", value: invoices.length },
          { label: "Paid", value: invoices.filter((invoice) => invoice.status === "Paid").length },
          { label: "Pending", value: invoices.filter((invoice) => invoice.status === "Pending").length },
          { label: "Overdue", value: invoices.filter((invoice) => invoice.status === "Overdue").length },
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
        emptyMessage="No invoices found"
        onRowClick={(row) => {
          setSelectedInvoice(row as unknown as InvoiceRecord);
          setPanelOpen(true);
        }}
      />

      <Sheet open={panelOpen} onOpenChange={setPanelOpen}>
        <SheetContent className="w-[620px] sm:max-w-[620px] overflow-y-auto p-0">
          {selectedInvoice && (
            <div className="flex flex-col h-full">
              <SheetHeader className="px-6 py-5 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">{selectedInvoice.packageId}</span>
                  <SheetTitle className="text-lg">{selectedInvoice.id}</SheetTitle>
                  <StatusBadge variant={selectedInvoice.status === "Paid" ? "completed" : selectedInvoice.status === "Overdue" ? "pending" : "scheduled"}>
                    {selectedInvoice.status}
                  </StatusBadge>
                </div>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground text-xs block mb-1">Student</span><span>{selectedInvoice.studentName}</span></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Student ID</span><span>{selectedInvoice.studentId}</span></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Parent</span><span>{selectedInvoice.parentName}</span></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Lead Record</span><span className="font-mono">{selectedInvoice.leadRecordId}</span></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Program</span><span>{selectedInvoice.program}</span></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Package</span><span>{selectedInvoice.packageName}</span></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Issued Date</span><span>{selectedInvoice.issuedDate}</span></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Due Date</span><span>{selectedInvoice.dueDate}</span></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Paid Date</span><span>{selectedInvoice.paidDate || "—"}</span></div>
                  <div><span className="text-muted-foreground text-xs block mb-1">Amount</span><span>{formatMoney(selectedInvoice.amount, selectedInvoice.currency)}</span></div>
                </div>

                {linkedPackage && (
                  <div className="border-t border-border pt-4">
                    <h3 className="text-sm font-semibold mb-3">Linked Student Package</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-muted-foreground text-xs block mb-1">Package ID</span><span className="font-mono">{linkedPackage.id}</span></div>
                      <div><span className="text-muted-foreground text-xs block mb-1">Package Status</span><StatusBadge variant={linkedPackage.status === "Completed" ? "completed" : linkedPackage.status === "Payment Due" ? "pending" : linkedPackage.status === "Active" ? "enrolled" : "scheduled"}>{linkedPackage.status}</StatusBadge></div>
                      <div><span className="text-muted-foreground text-xs block mb-1">Invoices Paid</span><span>{linkedPackage.paidInvoices} / {linkedPackage.totalInvoices}</span></div>
                      <div><span className="text-muted-foreground text-xs block mb-1">Open Balance</span><span>{formatMoney(linkedPackage.balanceAmount, linkedPackage.currency)}</span></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}