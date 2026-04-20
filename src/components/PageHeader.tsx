import { Link } from "react-router-dom";
import { ReactNode } from "react";
import { ChevronLeft, Sun, Moon } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

interface Props {
  title: string;
  back?: string;
  right?: ReactNode;
}

export const PageHeader = ({ title, back, right }: Props) => {
  const { theme, setTheme } = useSettings();
  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-background/80 border-b border-border">
      <div className="container max-w-3xl flex items-center gap-1 h-16 px-4">
        {back ? (
          <Link
            to={back}
            className="p-2 -ml-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground"
            aria-label="பின்செல்"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
        ) : null}
        <h1 className="flex-1 text-center font-serif text-xl md:text-2xl text-primary tracking-tight truncate">
          {title}
        </h1>
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={toggle}
            aria-label={theme === "dark" ? "ஒளி" : "இருள்"}
            className="p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          {right}
        </div>
      </div>
      <div className="ornament-divider px-8 pb-2">
        <span className="text-xs">❖</span>
      </div>
    </header>
  );
};
