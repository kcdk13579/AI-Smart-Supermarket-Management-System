import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { ThemeProvider } from "../theme-provider";

export function AdminLayout() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="smartmart-theme">
      <div className="min-h-screen bg-background flex">
        <AdminSidebar />
        <main className="flex-1  min-h-screen">
          <div className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
