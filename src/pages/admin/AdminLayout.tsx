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
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="container max-w-6xl flex items-center justify-between h-16 px-4">
          <Link to="/admin" className="flex items-center gap-2 text-primary">
            <Shield className="h-6 w-6" />
            <span className="font-serif text-xl hidden sm:inline">நிர்வாகம்</span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `p-2 px-3 rounded-md transition-all flex items-center gap-2 ${isActive ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`
              }
            >
              <BookOpen className="h-5 w-5" />
              <span className="hidden lg:inline font-medium">புத்தகங்கள்</span>
            </NavLink>
            <NavLink
              to="/admin/glossary"
              className={({ isActive }) =>
                `p-2 px-3 rounded-md transition-all flex items-center gap-2 ${isActive ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`
              }
            >
              <Languages className="h-5 w-5" />
              <span className="hidden lg:inline font-medium">கலைச்சொற்கள்</span>
            </NavLink>
            <NavLink
              to="/admin/relationships"
              className={({ isActive }) =>
                `p-2 px-3 rounded-md transition-all flex items-center gap-2 ${isActive ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`
              }
            >
              <Users className="h-5 w-5" />
              <span className="hidden lg:inline font-medium">உறவுகள்</span>
            </NavLink>
            <NavLink
              to="/admin/map"
              className={({ isActive }) =>
                `p-2 px-3 rounded-md transition-all flex items-center gap-2 ${isActive ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`
              }
            >
              <MapIcon className="h-5 w-5" />
              <span className="hidden lg:inline font-medium">வரைபடம்</span>
            </NavLink>
            
            <div className="w-px h-6 bg-border mx-1 hidden sm:block" />
            
            <Link
              to="/"
              className="p-2 rounded-md text-muted-foreground hover:bg-secondary transition-colors"
              title="Go to Website"
            >
              <Home className="h-5 w-5" />
            </Link>
            
            <Button variant="ghost" size="icon" onClick={logout} className="text-destructive hover:bg-destructive/10" title="Logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </nav>
        </div>
      </header>
      <main className="container max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
