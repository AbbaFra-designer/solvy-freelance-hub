import {
  Bot,
  Calendar,
  CalendarClock,
  FileText,
  Home,
  Landmark,
  LayoutGrid,
  Mail,
  Megaphone,
  Receipt,
  Rocket,
  Settings,
  Shield,
  TrendingUp,
  User,
  UserCheck,
  Users,
  UsersRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

type NavSection = {
  title: string;
  icon: LucideIcon;
  items: NavItem[];
};

const homeItem: NavItem = { title: "Home", url: "/", icon: Home };

const baseSections: NavSection[] = [
  {
    title: "Pipeline",
    icon: UserCheck,
    items: [
      { title: "Lead & Clients", url: "/lead-clients", icon: UserCheck },
      { title: "Preventivi", url: "/preventivi", icon: FileText },
      { title: "Email Bozzer", url: "/email-bozzer", icon: Mail },
      { title: "ID Contact", url: "/id-contact", icon: Users },
    ],
  },
  {
    title: "Finanze",
    icon: Wallet,
    items: [
      { title: "Prima Nota", url: "/prima-nota", icon: Receipt },
      { title: "Scadenzario", url: "/scadenzario", icon: CalendarClock },
    ],
  },
  {
    title: "Crescita",
    icon: TrendingUp,
    items: [
      { title: "Advisor", url: "/advisor", icon: Bot },
      { title: "Bandi", url: "/bandi", icon: Landmark },
      { title: "Professionisti", url: "/professionisti", icon: UsersRound },
      { title: "Kit Partenza", url: "/kit-partenza", icon: Rocket },
    ],
  },
  {
    title: "Altro",
    icon: Megaphone,
    items: [
      { title: "SMM Planner", url: "", icon: LayoutGrid },
      { title: "Eventi & News", url: "", icon: Calendar },
      { title: "Impostazioni", url: "/settings", icon: Settings },
      { title: "Profilo", url: "/profile", icon: User },
    ],
  },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const sections = baseSections.map((section) =>
    section.title === "Altro" && isAdmin
      ? {
          ...section,
          items: [...section.items, { title: "Admin", url: "/admin", icon: Shield }],
        }
      : section,
  );

  const renderItem = (item: NavItem) => {
    const active = !!item.url && location.pathname === item.url;
    const comingSoon = !item.url;
    const className = `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors w-full text-left ${
      active
        ? "gradient-accent font-medium text-foreground"
        : comingSoon
          ? "text-muted-foreground/40 cursor-not-allowed"
          : "text-muted-foreground hover:bg-secondary"
    }`;

    if (comingSoon) {
      return (
        <button key={item.title} type="button" disabled className={className} title={`${item.title} presto`}>
          <item.icon className="w-4 h-4 shrink-0" />
          <span className="hidden lg:block truncate">{`${item.title} – presto`}</span>
        </button>
      );
    }

    return (
      <NavLink key={item.url} to={item.url} end className={className} activeClassName="" title={item.title}>
        <item.icon className="w-4 h-4 shrink-0" />
        <span className="hidden lg:block truncate">{item.title}</span>
      </NavLink>
    );
  };

  return (
    <aside className="hidden md:flex flex-col w-20 lg:w-72 min-h-screen border-r border-border bg-sidebar shrink-0 transition-all duration-200">
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

        {sections.map((section) => (
          <div key={section.title} className="space-y-1.5">
            <div className="flex items-center gap-2 px-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground/70">
              <section.icon className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden lg:block">{section.title}</span>
            </div>
            <div className="space-y-1">{section.items.map(renderItem)}</div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
