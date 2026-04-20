import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { BookOpen, Home, LogOut, Shield } from "lucide-react";
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
        <div className="container max-w-6xl flex items-center justify-between h-14 px-4">
          <Link to="/admin" className="flex items-center gap-2 text-primary">
            <Shield className="h-5 w-5" />
            <span className="font-serif text-lg">வெண்முரசு Admin</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md transition-colors ${isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`
              }
            >
              <BookOpen className="h-4 w-4 inline md:hidden" />
              <span className="hidden md:inline">புத்தகங்கள்</span>
            </NavLink>
            <NavLink
              to="/admin/glossary"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md transition-colors ${isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`
              }
            >
              <span className="hidden md:inline">கலைச்சொற்கள்</span>
            </NavLink>
            <NavLink
              to="/admin/relationships"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md transition-colors ${isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`
              }
            >
              <span className="hidden md:inline">உறவுகள்</span>
            </NavLink>
            <NavLink
              to="/admin/map"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md transition-colors ${isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`
              }
            >
              <span className="hidden md:inline">வரைபடம்</span>
            </NavLink>
            <Link
              to="/"
              className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="h-4 w-4 inline md:hidden" />
              <span className="hidden md:inline">முகப்பு</span>
            </Link>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline ml-1">வெளியேறு</span>
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
