import PageHeader from "@/components/PageHeader";
import { TrendingUp, Users, Calendar, GraduationCap, DollarSign, Activity } from "lucide-react";

const statCards = [
  { icon: TrendingUp, value: "10", label: "New inquiries", color: "bg-info/10 text-info" },
  { icon: Users, value: "15", label: "Active leads", color: "bg-primary/10 text-primary" },
  { icon: Calendar, value: "10", label: "Upcoming trials", color: "bg-success/10 text-success" },
  { icon: GraduationCap, value: "30", label: "Active students", color: "bg-success/10 text-success" },
  { icon: DollarSign, value: "4", label: "Overdue invoices", color: "bg-warning/10 text-warning" },
  { icon: Activity, value: "77%", label: "Attendance rate", color: "bg-destructive/10 text-destructive" },
];

const infoBanners = [
  { label: "YOUR ROLE", value: "Sales", color: "bg-primary/10 text-primary" },
  { label: "COUNTRY", value: "All", color: "bg-success/10 text-success" },
  { label: "STATUS", value: "Active", color: "bg-warning/10 text-warning" },
];

const recentLeads = [
  { name: "Priya Nair", detail: "SG · Facebook Ad", status: "INQUIRY" },
  { name: "Ahmad Bin Yusof", detail: "MY · Instagram Ad", status: "INQUIRY" },
  { name: "Sofia Reyes", detail: "PH · Referral", status: "LEAD" },
  { name: "James Wong", detail: "HK · Organic", status: "INQUIRY" },
];

const overdueInvoices = [
  { name: "Maya Singh", detail: "Premium 16 · HK", amount: "HKD 3,600" },
  { name: "Daniel Foo", detail: "Standard 12 · SG", amount: "SGD 1,890" },
  { name: "Hannah Lee", detail: "Intensive 24 · MY", amount: "MYR 4,200" },
];

export default function DashboardPage() {
  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of your workspace" />

      <div className="grid grid-cols-3 gap-4 mb-6">
        {infoBanners.map((b) => (
          <div key={b.label} className="border border-border rounded-xl p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full ${b.color} flex items-center justify-center`}>
              <span className="text-lg">●</span>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{b.label}</div>
              <div className="text-lg font-bold text-foreground">{b.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-6 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="border border-border rounded-xl p-5 text-center">
            <div className={`w-10 h-10 mx-auto mb-3 rounded-full ${s.color} flex items-center justify-center`}>
              <s.icon size={18} />
            </div>
            <div className="text-2xl font-bold text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="border border-border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4">Recent leads</h3>
          <div className="space-y-4">
            {recentLeads.map((l) => (
              <div key={l.name} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-foreground">{l.name}</div>
                  <div className="text-xs text-muted-foreground">{l.detail}</div>
                </div>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{l.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4">Overdue invoices</h3>
          <div className="space-y-4">
            {overdueInvoices.map((inv) => (
              <div key={inv.name} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-foreground">{inv.name}</div>
                  <div className="text-xs text-muted-foreground">{inv.detail}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-destructive">{inv.amount}</div>
                  <div className="text-xs text-muted-foreground">Overdue</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
