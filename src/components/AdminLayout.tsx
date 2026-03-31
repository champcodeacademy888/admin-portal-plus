import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, ClipboardList, UserPlus, GraduationCap,
  CalendarCheck, RefreshCw, ArrowLeftRight, Calendar, Monitor,
  BarChart3, PieChart, Globe, LogOut, ChevronDown
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Leads", icon: Users, path: "/leads" },
  { label: "Trials", icon: ClipboardList, path: "/trials" },
  { label: "Enrolments", icon: UserPlus, path: "/enrolments" },
  { label: "Students", icon: GraduationCap, path: "/students" },
  { label: "Attendance", icon: CalendarCheck, path: "/attendance" },
  { label: "Makeups", icon: RefreshCw, path: "/makeups" },
  { label: "Cover", icon: ArrowLeftRight, path: "/cover" },
  { label: "Schedule", icon: Calendar, path: "/schedule" },
  { label: "My Classes", icon: Monitor, path: "/my-classes" },
  { label: "Reports", icon: BarChart3, path: "/reports" },
  { label: "Enrollment analytics", icon: PieChart, path: "/enrollment-analytics" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-[220px] bg-sidebar flex flex-col border-r border-sidebar-border shrink-0">
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">C</span>
          </div>
          <div>
            <div className="font-semibold text-sm text-foreground">Admin Portal</div>
            <div className="text-xs text-sidebar-muted">Champ Code Academy</div>
          </div>
        </div>

        <div className="px-5 pt-2 pb-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-sidebar-muted">Menu</span>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/10"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">SA</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground">sales01</div>
              <div className="text-xs text-sidebar-muted">Sales</div>
            </div>
            <LogOut size={16} className="text-sidebar-muted" />
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border flex items-center justify-between px-8">
          <span className="text-sm text-foreground">
            Good morning, <strong>sales01</strong>.
          </span>
          <button className="flex items-center gap-2 text-sm text-foreground">
            <Globe size={16} />
            All Countries
            <ChevronDown size={14} />
          </button>
        </header>
        <main className="flex-1 p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
