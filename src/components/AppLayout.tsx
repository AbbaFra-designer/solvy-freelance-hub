import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { BottomTabBar } from "@/components/BottomTabBar";

export default function AppLayout() {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>
      <BottomTabBar />
    </div>
  );
}
