import { useParams } from "react-router-dom";
import { useCommunityById, useCharacters, type Character } from "@/hooks/useSupabaseData";
import { PageHeader } from "@/components/PageHeader";
import { Loader2 } from "lucide-react";

/** A single person node in the tree */
const Node = ({
  char,
  characters,
}: {
  char: Character;
  characters: Character[];
}) => {
  // Children are those whose parent_id OR mother_id points to this character
  const children = characters.filter(
    (c) => c.parent_id === char.id || c.mother_id === char.id
  );

  // Find out who the "other parent" is for each child (to show a badge)
  const getOtherParent = (child: Character, currentId: string) => {
    const otherId =
      child.parent_id === currentId ? child.mother_id : child.parent_id;
    if (!otherId) return null;
    return characters.find((c) => c.id === otherId) ?? null;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="paper-card rounded-xl px-5 py-3 font-serif text-primary text-base shadow-deep border border-accent/10 bg-gradient-to-b from-card to-secondary/20 min-w-[120px] text-center hover:scale-105 transition-transform">
        {char.name}
      </div>

      {children.length > 0 && (
        <>
          <div className="w-px h-8 bg-gradient-to-b from-accent/30 to-border" />
          <div className="flex gap-10 relative px-10 before:content-[''] before:absolute before:top-0 before:left-14 before:right-14 before:h-px before:bg-gradient-to-r before:from-transparent before:via-accent/20 before:to-transparent">
            {children.map((child) => {
              const otherParent = getOtherParent(child, char.id);
              return (
                <div key={child.id} className="flex flex-col items-center">
                  {/* Show other-parent badge if it exists */}
                  {otherParent && (
                    <div className="mb-1 px-2 py-0.5 rounded-full text-[10px] font-serif bg-accent/10 text-accent border border-accent/20">
                      {child.parent_id === char.id ? "தாய்: " : "தந்தை: "}
                      {otherParent.name}
                    </div>
                  )}
                  <Node char={child} characters={characters} />
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
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

  const allChars = characters ?? [];

  // Root = no father AND no mother
  const rootCharacters = allChars.filter((c) => !c.parent_id && !c.mother_id);

  // Non-root that appear at top because they are "second root" partners
  // We only show the true roots; children appear under their parents via Node recursion.

  return (
    <div className="min-h-screen pb-16">
      <PageHeader title={community.name} back="/relationships" />
      <main className="container max-w-4xl px-4 mt-8 overflow-x-auto">
        <div className="bg-card/50 rounded-2xl p-6 border border-border/50 mb-10 text-center shadow-inner">
          <p className="text-muted-foreground font-serif">
            {community.description} — குடும்ப வரிசை
          </p>
        </div>

        <div className="flex justify-center min-w-max pb-10">
          <div className="flex gap-10">
            {rootCharacters.map((root) => (
              <Node key={root.id} char={root} characters={allChars} />
            ))}
            {rootCharacters.length === 0 && (
              <p className="text-muted-foreground font-serif italic py-10">
                இன்னும் தகவல்கள் சேர்க்கப்படவில்லை.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CommunityPage;
