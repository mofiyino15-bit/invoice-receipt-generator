import { LayoutDashboard, FileText, Users, BarChart3, LogOut } from "lucide-react";
import BokLogo from "./BokLogo";

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string, params?: Record<string, any>) => void;
}

export default function Sidebar({ currentRoute, onNavigate }: SidebarProps) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "invoices", label: "Invoices", icon: FileText },
    { id: "clients", label: "Clients", icon: Users },
    { id: "reports", label: "Reports", icon: BarChart3 },
  ];

  return (
    <aside className="w-[220px] h-screen bg-white/10 backdrop-blur-[2px] border-r border-white/10 flex flex-col p-4 shrink-0 select-none z-10 shadow-none">
      {/* Brand Header */}
      <div className="py-6 px-4 mb-2 flex items-center gap-3.5" id="sidebar-logo-container">
        {/* Scandinavian minimal aesthetic logo container */}
        <BokLogo size={32} />
        <div className="flex flex-col gap-[8px]" id="sidebar-wordmark-container">
          <h1 className="text-base font-bold tracking-tight text-grey-900 leading-none">Bōk</h1>
          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest font-secondary leading-none">Invoicing</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 px-1" id="sidebar-navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id || currentRoute.startsWith(item.id + "-");

          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:cursor-pointer ${
                isActive
                  ? "bg-blue-500 text-white"
                  : "text-grey-600 hover:bg-white/10 hover:text-grey-900"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Log Out Button at the very bottom */}
      <div className="p-1 mb-4" id="sidebar-logout-container">
        <button
          id="nav-logout"
          onClick={() => {
            onNavigate("login");
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:cursor-pointer text-grey-500 hover:text-grey-900 hover:bg-white/10"
        >
          <LogOut className="w-5 h-5 text-grey-450" />
          <span>Log Out</span>
        </button>
      </div>

    </aside>
  );
}
