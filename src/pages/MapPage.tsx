import { PageHeader } from "@/components/PageHeader";
import { MapPin, Loader2, Info } from "lucide-react";
import { useMapLocations } from "@/hooks/useSupabaseData";

const MapPage = () => {
  const { data: locations, isLoading, error } = useMapLocations();

  return (
    <div className="min-h-screen pb-16">
      <PageHeader title="வரைபடம்" back="/" />
      <main className="container max-w-3xl px-4 mt-8">
        <div className="paper-card rounded-2xl aspect-[16/9] flex flex-col items-center justify-center gap-4 text-center p-8 bg-gradient-to-br from-card to-secondary/30 border border-border shadow-deep mb-8">
          <div className="h-20 w-20 rounded-full bg-gradient-gold flex items-center justify-center text-accent-foreground shadow-paper animate-pulse">
            <MapPin className="h-10 w-10" />
          </div>
          <h2 className="font-serif text-3xl text-primary tracking-tight">பாரத வரைபடம்</h2>
          <p className="text-muted-foreground font-serif max-w-md text-balance">
            வெண்முரசு கதை நிகழும் வரலாற்று இடங்களை இங்கு காணலாம்.
          </p>
        </div>

        <section>
          <h3 className="font-serif text-xl text-primary mb-5 flex items-center gap-2">
            <Info className="h-5 w-5 text-accent" />
            வரலாற்று இடங்கள்
          </h3>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
              <p className="font-serif text-muted-foreground">இடங்கள் தேடப்படுகின்றன...</p>
            </div>
          ) : error ? (
            <div className="paper-card rounded-lg p-10 text-center text-destructive font-serif">
              வரைபடத் தரவுகளைப் பெறுவதில் சிக்கல் ஏற்பட்டுள்ளது.
            </div>
          ) : (
            <div className="grid gap-4">
              {locations?.map((loc) => (
                <div 
                  key={loc.id} 
                  className="paper-card rounded-xl p-5 flex items-start gap-4 hover:shadow-deep transition-all border border-transparent hover:border-accent/20 cursor-default"
                >
                  <div className="mt-1 h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-accent shrink-0">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg text-primary">{loc.name}</h4>
                    <p className="text-sm text-muted-foreground font-serif mt-1">{loc.description}</p>
                    <div className="mt-2 text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">
                      {loc.latitude.toFixed(4)}° N, {loc.longitude.toFixed(4)}° E
                    </div>
                  </div>
                </div>
              ))}
              {locations?.length === 0 && (
                <div className="text-center py-20 text-muted-foreground font-serif paper-card rounded-xl border-dashed">
                  இன்னும் இடங்கள் அடையாளப்படுத்தப்படவில்லை.
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default MapPage;
