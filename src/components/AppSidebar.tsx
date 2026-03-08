import { Home, LayoutGrid, Settings, User, Shield, FileText } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const baseNavItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Preventivi", url: "/preventivi", icon: FileText },
  { title: "Apps", url: "/apps", icon: LayoutGrid },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const navItems = isAdmin
    ? [...baseNavItems, { title: "Admin", url: "/admin", icon: Shield }]
    : baseNavItems;

  return (
    <aside className="hidden md:flex flex-col w-16 lg:w-56 min-h-screen border-r border-border bg-sidebar shrink-0 transition-all duration-200">
      {/* Logo */}
      <div
        className="flex items-center gap-2 px-4 h-16 border-b border-border cursor-pointer hover:bg-secondary/50 transition-colors"
        onClick={() => navigate("/about")}
        title="Cos'è Solvy?"
      >
        <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
          <span className="text-sm font-bold text-foreground">S</span>
        </div>
        <span className="hidden lg:block font-semibold text-foreground text-lg">Solvy</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1 p-2 mt-2">
        {navItems.map((item) => {
          const active = location.pathname === item.url;
          return (
            <NavLink
              key={item.url}
              to={item.url}
              end
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "gradient-accent font-medium text-foreground"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
              activeClassName=""
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="hidden lg:block">{item.title}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Profile */}
      <div className="p-2 border-t border-border">
        <NavLink
          to="/profile"
          end
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
            location.pathname === "/profile"
              ? "gradient-accent font-medium text-foreground"
              : "text-muted-foreground hover:bg-secondary"
          }`}
          activeClassName=""
        >
          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
            <User className="w-4 h-4" />
          </div>
          <span className="hidden lg:block">Profilo</span>
        </NavLink>
      </div>
    </aside>
  );
}
