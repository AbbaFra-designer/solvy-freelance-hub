import { Home, LayoutGrid, Settings, User } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";

const navItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Apps", url: "/apps", icon: LayoutGrid },
  { title: "Impostazioni", url: "/settings", icon: Settings },
  { title: "Profilo", url: "/profile", icon: User },
];

export function BottomTabBar() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-bottom">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const active = location.pathname === item.url;
          return (
            <NavLink
              key={item.url}
              to={item.url}
              end
              className={`flex flex-col items-center gap-1 px-3 py-1.5 text-xs transition-colors ${
                active ? "text-accent-orange font-medium" : "text-muted-foreground"
              }`}
              activeClassName=""
            >
              <item.icon className={`w-5 h-5 ${active ? "text-accent-orange" : ""}`} />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
