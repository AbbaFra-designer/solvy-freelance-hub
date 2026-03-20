import {
  Bot,
  Calendar,
  CalendarClock,
  FileText,
  Home,
  Landmark,
  LayoutGrid,
  MoreHorizontal,
  Receipt,
  Rocket,
  Scale,
  Settings,
  Shield,
  Timer,
  TrendingUp,
  User,
  UserCheck,
  UsersRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

type MenuItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

type TabItem = {
  key: string;
  title: string;
  icon: LucideIcon;
  url?: string;
  items?: MenuItem[];
};

export function BottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [openTab, setOpenTab] = useState<string | null>(null);

  const tabs: TabItem[] = [
    { key: "home", title: "Home", icon: Home, url: "/" },
    {
      key: "pipeline",
      title: "Pipeline",
      icon: UserCheck,
      items: [
        { title: "Lead & Clients", url: "/lead-clients", icon: UserCheck },
        { title: "Preventivi", url: "/preventivi", icon: FileText },
      ],
    },
    {
      key: "finanze",
      title: "Finanze",
      icon: Wallet,
      items: [
        { title: "Prima Nota", url: "/prima-nota", icon: Receipt },
        { title: "Scadenzario", url: "/scadenzario", icon: CalendarClock },
      ],
    },
    {
      key: "crescita",
      title: "Crescita",
      icon: TrendingUp,
      items: [
        { title: "Advisor",           url: "/advisor",             icon: Bot },
        { title: "Bandi",             url: "/bandi",               icon: Landmark },
        { title: "Professionisti",    url: "/professionisti",      icon: UsersRound },
        { title: "Kit Partenza",      url: "/kit-partenza",        icon: Rocket },
        { title: "Time Tracking",     url: "/time-tracking",       icon: Timer },
        { title: "Safe-Freelance",    url: "/libreria-contratti",  icon: Scale },
      ],
    },
    {
      key: "altro",
      title: "Altro",
      icon: MoreHorizontal,
      items: [
        { title: "SMM Planner",   url: "/smm-planner",  icon: LayoutGrid },
        { title: "Eventi & News", url: "/eventi-news",  icon: Calendar },
        { title: "Impostazioni",  url: "/settings",     icon: Settings },
        { title: "Profilo",       url: "/profile",      icon: User },
        ...(isAdmin ? [{ title: "Admin", url: "/admin", icon: Shield }] : []),
      ],
    },
  ];

  useEffect(() => {
    setOpenTab(null);
  }, [location.pathname]);

  const activeTab = (tab: TabItem) => {
    if (tab.url) return location.pathname === tab.url;
    return tab.items?.some((item) => item.url && location.pathname === item.url) ?? false;
  };

  const currentOverlay = tabs.find((tab) => tab.key === openTab && tab.items?.length);

  return (
    <>
      {currentOverlay && (
        <div className="md:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" onClick={() => setOpenTab(null)}>
          <div
            className="absolute bottom-20 left-4 right-4 bg-card border border-border rounded-2xl shadow-xl p-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-2 gap-2">
              {currentOverlay.items?.map((item) => {
                const active = !!item.url && location.pathname === item.url;
                const comingSoon = !item.url;

                return (
                  <button
                    key={`${currentOverlay.key}-${item.title}`}
                    type="button"
                    onClick={() => {
                      if (!item.url) return;
                      navigate(item.url);
                      setOpenTab(null);
                    }}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs transition-colors ${
                      active
                        ? "bg-accent-orange/10 text-accent-orange font-medium"
                        : "text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="truncate w-full text-center">{item.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-bottom">
        <div className="grid h-16 grid-cols-5">
          {tabs.map((tab) => {
            const active = activeTab(tab);

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  if (tab.url) {
                    navigate(tab.url);
                    return;
                  }
                  setOpenTab((current) => (current === tab.key ? null : tab.key));
                }}
                className={`flex flex-col items-center justify-center gap-1 px-1 py-1.5 text-[11px] transition-colors ${
                  active || openTab === tab.key ? "text-accent-orange font-medium" : "text-muted-foreground"
                }`}
              >
                <tab.icon className={`w-5 h-5 ${active || openTab === tab.key ? "text-accent-orange" : ""}`} />
                <span>{tab.title}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
