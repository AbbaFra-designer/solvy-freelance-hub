import {
  Bot,
  Calendar,
  CalendarClock,
  FileText,
  Home,
  Landmark,
  LayoutGrid,
  Megaphone,
  Receipt,
  Rocket,
  Scale,
  Settings,
  Shield,
  Star,
  Timer,
  TrendingUp,
  User,
  UserCheck,
  UsersRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";

type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  id?: string; // used for favorites
};

type NavSection = {
  title: string;
  icon: LucideIcon;
  items: NavItem[];
};

const homeItem: NavItem = { title: "Home", url: "/", icon: Home, id: "home" };

const baseSections: NavSection[] = [
  {
    title: "Pipeline",
    icon: UserCheck,
    items: [
      { title: "Lead & Clients", url: "/lead-clients", icon: UserCheck, id: "lead-clients" },
      { title: "Preventivi",     url: "/preventivi",   icon: FileText,  id: "preventivi"  },
    ],
  },
  {
    title: "Finanze",
    icon: Wallet,
    items: [
      { title: "Prima Nota",   url: "/prima-nota",   icon: Receipt,      id: "prima-nota"   },
      { title: "Scadenzario",  url: "/scadenzario",  icon: CalendarClock, id: "scadenzario" },
    ],
  },
  {
    title: "Crescita",
    icon: TrendingUp,
    items: [
      { title: "Advisor",                url: "/advisor",             icon: Bot,       id: "advisor"            },
      { title: "Bandi",                  url: "/bandi",               icon: Landmark,  id: "bandi"              },
      { title: "Professionisti",         url: "/professionisti",      icon: UsersRound, id: "professionisti"    },
      { title: "Kit Partenza",           url: "/kit-partenza",        icon: Rocket,    id: "kit-partenza"       },
      { title: "Time Tracking & ROI",    url: "/time-tracking",       icon: Timer,     id: "time-tracking"      },
      { title: "Libreria Safe-Freelance", url: "/libreria-contratti", icon: Scale,     id: "libreria-contratti" },
    ],
  },
  {
    title: "Altro",
    icon: Megaphone,
    items: [
      { title: "SMM Planner",    url: "/smm-planner",  icon: LayoutGrid, id: "smm-planner"  },
      { title: "Eventi & News",  url: "/eventi-news",  icon: Calendar,   id: "eventi-news"  },
      { title: "Impostazioni",   url: "/settings",     icon: Settings                       },
      { title: "Profilo",        url: "/profile",      icon: User                           },
    ],
  },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();

  const sections = baseSections.map((section) =>
    section.title === "Altro" && isAdmin
      ? { ...section, items: [...section.items, { title: "Admin", url: "/admin", icon: Shield }] }
      : section
  );

  const renderItem = (item: NavItem) => {
    const active = location.pathname === item.url;
    const isComingSoon = item.url === "/smm-planner" || item.url === "/eventi-news";
    const fav = item.id ? isFavorite(item.id) : false;

    const className = `group/item flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors w-full text-left ${
      active
        ? "gradient-accent font-medium text-foreground"
        : isComingSoon
          ? "text-muted-foreground/50 hover:text-muted-foreground hover:bg-secondary/50"
          : "text-muted-foreground hover:bg-secondary"
    }`;

    const starBtn = item.id && (
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (item.id) toggleFavorite(item.id); }}
        className={`hidden lg:flex ml-auto items-center justify-center w-5 h-5 rounded transition-all shrink-0 ${
          fav
            ? "text-amber-400 opacity-100"
            : "text-muted-foreground/0 group-hover/item:text-muted-foreground/50 group-hover/item:opacity-100 hover:!text-amber-400"
        } hover:bg-amber-400/10`}
        title={fav ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
      >
        <Star className={`w-3 h-3 ${fav ? "fill-amber-400" : ""}`} />
      </button>
    );

    return (
      <NavLink
        key={item.url}
        to={item.url}
        end
        className={className}
        activeClassName=""
        title={isComingSoon ? `${item.title} — presto` : item.title}
        onClick={isComingSoon ? undefined : undefined}
      >
        <item.icon className="w-4 h-4 shrink-0" />
        <span className="hidden lg:block truncate flex-1">
          {item.title}
          {isComingSoon && <span className="ml-1 text-[10px] opacity-60">· presto</span>}
        </span>
        {starBtn}
      </NavLink>
    );
  };

  return (
    <aside className="hidden md:flex flex-col w-20 lg:w-72 min-h-screen border-r border-border bg-sidebar shrink-0 transition-all duration-200">
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

      <nav className="flex-1 flex flex-col gap-4 p-2 mt-2 overflow-y-auto">
        <div className="space-y-1">
          {renderItem(homeItem)}
        </div>

        {sections.map((section, index) => (
          <div
            key={section.title}
            className={`space-y-1.5 ${index > 0 ? "border-t border-border/40 mt-1 pt-2" : ""}`}
          >
            <div className="flex items-center gap-2 px-3 text-sm font-semibold text-foreground">
              <span className="hidden lg:block">{section.title}</span>
              <span className="lg:hidden text-[10px] font-bold uppercase text-muted-foreground tracking-widest">·</span>
            </div>
            <div className="space-y-1">{section.items.map(renderItem)}</div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
