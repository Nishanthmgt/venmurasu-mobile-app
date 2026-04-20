import { useParams } from "react-router-dom";
import { useCommunityById, useCharacters, type Character } from "@/hooks/useSupabaseData";
import { PageHeader } from "@/components/PageHeader";
import { Loader2 } from "lucide-react";

const Node = ({ label, children }: { label: string; children?: React.ReactNode }) => (
  <div className="flex flex-col items-center">
    <div className="paper-card rounded-xl px-5 py-3 font-serif text-primary text-base shadow-deep border border-accent/10 bg-gradient-to-b from-card to-secondary/20 min-w-[120px] text-center hover:scale-105 transition-transform">
      {label}
    </div>
    {children && (
      <>
        <div className="w-px h-8 bg-gradient-to-b from-accent/30 to-border" />
        <div className="flex gap-10 relative px-10 before:content-[''] before:absolute before:top-0 before:left-14 before:right-14 before:h-px before:bg-gradient-to-r before:from-transparent before:via-accent/20 before:to-transparent">
          {children}
        </div>
      </>
    )}
  </div>
);

const TreeBuilder = ({ characters, parentId }: { characters: Character[]; parentId: string | null }) => {
  const children = characters.filter((c) => c.parent_id === parentId);
  if (children.length === 0) return null;

  return (
    <>
      {children.map((child) => (
        <Node key={child.id} label={child.name}>
          <TreeBuilder characters={characters} parentId={child.id} />
        </Node>
      ))}
    </>
  );
};

const CommunityPage = () => {
  const { communityId = "" } = useParams();
  const { data: community, isLoading: loadingComm } = useCommunityById(communityId);
  const { data: characters, isLoading: loadingChars } = useCharacters(communityId);

  if (loadingComm || loadingChars) {
    return (
      <div className="min-h-screen pb-16">
        <PageHeader title="ஏற்றப்படுகிறது..." back="/relationships" />
        <div className="flex flex-col items-center justify-center py-40 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </div>
    );
  }

  if (!community) return null;

  const rootCharacters = characters?.filter(c => !c.parent_id) || [];

  return (
    <div className="min-h-screen pb-16">
      <PageHeader title={community.name} back="/relationships" />
      <main className="container max-w-4xl px-4 mt-8 overflow-x-auto">
        <div className="bg-card/50 rounded-2xl p-6 border border-border/50 mb-10 text-center shadow-inner">
          <p className="text-muted-foreground font-serif">{community.description} — குடும்ப வரிசை</p>
        </div>

        <div className="flex justify-center min-w-max pb-10">
          <div className="flex gap-10">
            {rootCharacters.map(root => (
              <Node key={root.id} label={root.name}>
                <TreeBuilder characters={characters || []} parentId={root.id} />
              </Node>
            ))}
            {rootCharacters.length === 0 && (
              <p className="text-muted-foreground font-serif italic py-10">இன்னும் தகவல்கள் சேர்க்கப்படவில்லை.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CommunityPage;
