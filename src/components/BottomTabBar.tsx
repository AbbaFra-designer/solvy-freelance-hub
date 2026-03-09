import { Home, LayoutGrid, Settings, User, Shield, MoreHorizontal } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { Bot, Rocket, CalendarClock, Receipt, Users } from "lucide-react";

const primaryNav = [
  { title: "Home", url: "/", icon: Home },
  { title: "Apps", url: "/apps", icon: LayoutGrid },
  { title: "Advisor", url: "/advisor", icon: Bot },
];

const moreItems = [
  { title: "Kit Partenza", url: "/kit-partenza", icon: Rocket },
  { title: "Scadenzario", url: "/scadenzario", icon: CalendarClock },
  { title: "Prima Nota", url: "/prima-nota", icon: Receipt },
  { title: "Professionisti", url: "/professionisti", icon: Users },
  { title: "Impostazioni", url: "/settings", icon: Settings },
  { title: "Profilo", url: "/profile", icon: User },
];

export function BottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [showMore, setShowMore] = useState(false);

  const allMore = isAdmin ? [...moreItems, { title: "Admin", url: "/admin", icon: Shield }] : moreItems;
  const isMoreActive = allMore.some((i) => location.pathname === i.url);

  return (
    <>
      {/* More overlay */}
      {showMore && (
        <div className="md:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" onClick={() => setShowMore(false)}>
          <div className="absolute bottom-20 left-4 right-4 bg-card border border-border rounded-2xl shadow-xl p-3 grid grid-cols-3 gap-2" onClick={(e) => e.stopPropagation()}>
            {allMore.map((item) => {
              const active = location.pathname === item.url;
              return (
                <button
                  key={item.url}
                  onClick={() => { navigate(item.url); setShowMore(false); }}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs transition-colors ${
                    active ? "bg-accent-orange/10 text-accent-orange font-medium" : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="truncate w-full text-center">{item.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-bottom">
        <div className="flex justify-around items-center h-16">
          {primaryNav.map((item) => {
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
          <button
            onClick={() => setShowMore(!showMore)}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 text-xs transition-colors ${
              isMoreActive ? "text-accent-orange font-medium" : "text-muted-foreground"
            }`}
          >
            <MoreHorizontal className={`w-5 h-5 ${isMoreActive ? "text-accent-orange" : ""}`} />
            <span>Altro</span>
          </button>
        </div>
      </nav>
    </>
  );
}
