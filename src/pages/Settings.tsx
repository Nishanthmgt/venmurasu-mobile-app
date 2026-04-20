import { PageHeader } from "@/components/PageHeader";
import { useSettings, FONT_LABEL, type FontSize } from "@/hooks/useSettings";
import { Sun, Moon } from "lucide-react";

const SIZES: FontSize[] = ["sm", "md", "lg", "xl"];

const Settings = () => {
  const { theme, setTheme, fontSize, setFontSize } = useSettings();

  return (
    <div className="min-h-screen pb-16">
      <PageHeader title="அமைப்புகள்" back="/" />
      <main className="container max-w-2xl px-4 mt-6 space-y-6">
        <section className="paper-card rounded-lg p-5">
          <h2 className="font-serif text-lg text-primary mb-4">தோற்றம்</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTheme("light")}
              className={`flex items-center justify-center gap-2 rounded-md px-4 py-3 font-serif border transition ${
                theme === "light" ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary/60"
              }`}
            >
              <Sun className="h-4 w-4" /> ஒளி
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex items-center justify-center gap-2 rounded-md px-4 py-3 font-serif border transition ${
                theme === "dark" ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary/60"
              }`}
            >
              <Moon className="h-4 w-4" /> இருள்
            </button>
          </div>
        </section>

        <section className="paper-card rounded-lg p-5">
          <h2 className="font-serif text-lg text-primary mb-4">எழுத்தின் அளவு</h2>
          <div className="grid grid-cols-2 gap-3">
            {SIZES.map((s) => (
              <button
                key={s}
                onClick={() => setFontSize(s)}
                className={`rounded-md px-4 py-3 font-serif border transition ${
                  fontSize === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary/60"
                }`}
              >
                {FONT_LABEL[s]}
              </button>
            ))}
          </div>
          <p className={`mt-4 font-serif text-foreground/80 ${
            fontSize === "sm" ? "text-sm" : fontSize === "md" ? "text-base" : fontSize === "lg" ? "text-lg" : "text-xl"
          }`}>
            மாதிரி வாசிப்பு: அறம் என்பதே உலகம் தாங்கும் ஆதாரம்.
          </p>
        </section>
      </main>
    </div>
  );
};

export default Settings;
