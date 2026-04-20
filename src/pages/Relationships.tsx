import { Link } from "react-router-dom";
import { useCommunities } from "@/hooks/useSupabaseData";
import { PageHeader } from "@/components/PageHeader";
import { Users, Loader2 } from "lucide-react";

const Relationships = () => {
  const { data: communities, isLoading, error } = useCommunities();

  return (
    <div className="min-h-screen pb-16">
      <PageHeader title="உறவுகள்" back="/" />
      <main className="container max-w-2xl px-4 mt-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <p className="font-serif">ஏற்றப்படுகிறது...</p>
          </div>
        ) : error ? (
          <div className="paper-card rounded-lg p-10 text-center text-destructive font-serif">
            தரவுகளைப் பெறுவதில் சிக்கல் ஏற்பட்டுள்ளது.
          </div>
        ) : (
          <ul className="space-y-4">
            {communities?.map((c) => (
              <li key={c.id}>
                <Link
                  to={`/relationships/${c.id}`}
                  className="paper-card rounded-xl px-6 py-5 flex items-center gap-5 hover:shadow-deep hover:-translate-y-1 transition-all group"
                >
                  <div className="h-12 w-12 rounded-full bg-gradient-gold flex items-center justify-center text-accent-foreground shadow-sm group-hover:scale-110 transition-transform">
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="font-serif text-xl text-foreground group-hover:text-primary transition-colors">{c.name}</div>
                    <div className="text-sm text-muted-foreground font-serif mt-1">{c.description}</div>
                  </div>
                </Link>
              </li>
            ))}
            {communities?.length === 0 && (
              <div className="text-center py-20 text-muted-foreground font-serif paper-card rounded-lg">
                பட்டியல் காலியாக உள்ளது
              </div>
            )}
          </ul>
        )}
      </main>
    </div>
  );
};

export default Relationships;
