import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { BookOpen, Home, LogOut, Shield, Languages, Users, Map as MapIcon } from "lucide-react";
import { isAdmin, logoutAdmin } from "@/lib/admin";
import { Button } from "@/components/ui/button";

const AdminLayout = () => {
  const nav = useNavigate();

  useEffect(() => {
    if (!isAdmin()) nav("/admin/login", { replace: true });
  }, [nav]);

  const logout = () => {
    logoutAdmin();
    nav("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container max-w-6xl px-4 h-14 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2">
            <span className="font-serif text-lg font-bold text-primary tracking-tight">வெண்முரசு நிர்வாகம்</span>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={logout} 
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/5"
            title="வெளியேறு"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-6xl px-4 py-6 pb-24">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-t border-border/50 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] pb-safe">
        <div className="container max-w-md mx-auto h-16 px-4 flex items-center justify-between">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 transition-all ${isActive ? "text-primary bg-primary/5 rounded-xl px-4 py-1" : "text-muted-foreground hover:text-foreground"}`
            }
          >
            <BookOpen className="h-5 w-5" />
            <span className="text-[10px] font-medium font-serif">நூல்கள்</span>
          </NavLink>
          
          <NavLink
            to="/admin/glossary"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 transition-all ${isActive ? "text-primary bg-primary/5 rounded-xl px-4 py-1" : "text-muted-foreground hover:text-foreground"}`
            }
          >
            <Languages className="h-5 w-5" />
            <span className="text-[10px] font-medium font-serif">கலைச்சொற்கள்</span>
          </NavLink>
          
          <NavLink
            to="/admin/relationships"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 transition-all ${isActive ? "text-primary bg-primary/5 rounded-xl px-4 py-1" : "text-muted-foreground hover:text-foreground"}`
            }
          >
            <Users className="h-5 w-5" />
            <span className="text-[10px] font-medium font-serif">உறவுகள்</span>
          </NavLink>
          
          <NavLink
            to="/admin/map"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 transition-all ${isActive ? "text-primary bg-primary/5 rounded-xl px-4 py-1" : "text-muted-foreground hover:text-foreground"}`
            }
          >
            <MapIcon className="h-5 w-5" />
            <span className="text-[10px] font-medium font-serif">வரைபடம்</span>
          </NavLink>

          <Link
            to="/"
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <Home className="h-5 w-5" />
            <span className="text-[10px] font-medium font-serif">முகப்பு</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default AdminLayout;
