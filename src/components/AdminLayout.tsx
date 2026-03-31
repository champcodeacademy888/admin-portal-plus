import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, ClipboardList, UserPlus, GraduationCap,
  CalendarCheck, RefreshCw, ArrowLeftRight, Calendar, Monitor,
  BarChart3, PieChart, Globe, LogOut, ChevronDown, Package, PanelLeftClose, PanelLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Leads", icon: Users, path: "/leads" },
  { label: "Trials", icon: ClipboardList, path: "/trials" },
  { label: "Enrolments", icon: UserPlus, path: "/enrolments" },
  { label: "Packages", icon: Package, path: "/packages" },
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
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className={cn(
        "bg-sidebar flex flex-col border-r border-sidebar-border shrink-0 transition-all duration-200",
        collapsed ? "w-[68px]" : "w-[220px]"
      )}>
        <div className={cn("flex items-center gap-3 py-5", collapsed ? "px-3 justify-center" : "px-5")}>
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="text-primary-foreground font-bold text-sm">C</span>
          </div>
          {!collapsed && (
            <div>
              <div className="font-semibold text-sm text-foreground">Admin Portal</div>
              <div className="text-xs text-sidebar-muted">Champ Code Academy</div>
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="px-5 pt-2 pb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-sidebar-muted">Menu</span>
          </div>
        )}

        <nav className={cn("flex-1 space-y-0.5", collapsed ? "px-2" : "px-3")}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const link = (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center rounded-lg text-sm transition-colors",
                  collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/10"
                )}
              >
                <item.icon size={18} className="shrink-0" />
                {!collapsed && item.label}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.path} delayDuration={0}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right" className="text-xs">{item.label}</TooltipContent>
                </Tooltip>
              );
            }
            return link;
          })}
        </nav>

        {/* Collapse toggle */}
        <div className={cn("px-3 py-2 border-t border-sidebar-border", collapsed && "flex justify-center")}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-muted hover:text-foreground hover:bg-sidebar-accent/10 transition-colors w-full"
          >
            {collapsed ? <PanelLeft size={18} /> : <><PanelLeftClose size={18} /><span>Collapse</span></>}
          </button>
        </div>

        <div className={cn("px-3 py-4 border-t border-sidebar-border")}>
          <div className={cn("flex items-center gap-3", collapsed ? "justify-center" : "px-3")}>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary shrink-0">SA</div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">Sarah Anderson</div>
                <div className="text-xs text-sidebar-muted">Sales Admin</div>
              </div>
            )}
            {!collapsed && <LogOut size={16} className="text-sidebar-muted shrink-0" />}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border flex items-center justify-between px-8">
          <span className="text-sm text-foreground">
            Good morning, <strong>Sarah Anderson</strong>.
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
