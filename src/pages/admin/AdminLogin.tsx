import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isAdmin, loginAdmin } from "@/lib/admin";
import { toast } from "sonner";

const AdminLogin = () => {
  const nav = useNavigate();
  const [pw, setPw] = useState("");

  useEffect(() => {
    if (isAdmin()) nav("/admin", { replace: true });
  }, [nav]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(pw)) {
      toast.success("வரவேற்கிறோம், Admin");
      nav("/admin", { replace: true });
    } else {
      toast.error("தவறான கடவுச்சொல்");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-lg space-y-6"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="font-serif text-2xl text-primary">நிர்வாக நுழைவு</h1>
            <p className="text-sm text-muted-foreground mt-1">Admin Access</p>
          </div>
        </div>
        <div className="space-y-2">
          <Input
            type="password"
            placeholder="கடவுச்சொல்"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoFocus
          />
        </div>
        <Button type="submit" className="w-full">
          உள்நுழை
        </Button>
      </form>
    </div>
  );
};

export default AdminLogin;
