import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift, Heart, User, Eye, EyeOff } from "lucide-react";
import type { Assignment } from "@/types/entities";

const translations = {
  de: {
    title: "Alle Wünsche",
    noWishes: "Noch keine Wünsche eingetragen",
    wishesFrom: "Wünsche von",
    showWishes: "Wünsche anzeigen",
    hideWishes: "Verbergen",
    hiddenWishes: "Wünsche verborgen",
    clickToReveal: "Klicke auf das Auge um die Wünsche zu sehen",
  },
  en: {
    title: "All Wishes",
    noWishes: "No wishes entered yet",
    wishesFrom: "Wishes from",
    showWishes: "Show wishes",
    hideWishes: "Hide",
    hiddenWishes: "Wishes hidden",
    clickToReveal: "Click the eye to reveal wishes",
  },
};

interface WishesOverviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignments: Assignment[];
  language: "de" | "en";
}

export default function WishesOverviewDialog({
  open,
  onOpenChange,
  assignments,
  language,
}: WishesOverviewDialogProps) {
  const t = translations[language];
  const [visibleWishes, setVisibleWishes] = useState<Set<string>>(new Set());

  // Sort assignments alphabetically by participant name
  const sortedAssignments = [...assignments].sort((a, b) =>
    a.participant_name.localeCompare(b.participant_name)
  );

  const toggleWishesVisibility = (assignmentId: string) => {
    setVisibleWishes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(assignmentId)) {
        newSet.delete(assignmentId);
      } else {
        newSet.add(assignmentId);
      }
      return newSet;
    });
  };

  // Reset visibility when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setVisibleWishes(new Set());
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="bg-[#FFD93D] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
        showCloseButton={true}
      >
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-[#FF6B9D] p-2 border-4 border-black rotate-[-3deg]">
              <Heart className="w-6 h-6 text-black" />
            </div>
            <DialogTitle className="text-2xl font-black text-black">
              {t.title}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 -mx-6 px-6 py-2 space-y-4 scrollbar-brutalist">
          {sortedAssignments.map((assignment, index) => {
            const isVisible = visibleWishes.has(assignment.id);
            const hasWishes = assignment.wishes && assignment.wishes.length > 0;
            // Alternate tilt direction, less on mobile
            const tiltClass =
              index % 2 === 0
                ? "rotate-[0.5deg] md:rotate-[1deg]"
                : "rotate-[-0.5deg] md:rotate-[-1deg]";

            return (
              <div
                key={assignment.id}
                className={`bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 ${tiltClass}`}
              >
                {/* Participant Header */}
                <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b-4 border-black">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#A8E6CF] p-2 border-2 border-black rotate-[3deg]">
                      <User className="w-5 h-5 text-black" />
                    </div>
                    <h3 className="text-xl font-black text-black">
                      {assignment.participant_name}
                    </h3>
                  </div>
                  {hasWishes && (
                    <Button
                      onClick={() => toggleWishesVisibility(assignment.id)}
                      className="border-4 border-black bg-[#FDFB9C] hover:bg-[#FDF080] h-10 px-4 font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                    >
                      {isVisible ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-2" />
                          {t.hideWishes}
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-2" />
                          {t.showWishes}
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Wishes List */}
                <div className="space-y-2">
                  {hasWishes ? (
                    isVisible ? (
                      // Show actual wishes
                      assignment.wishes.map((wish, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 p-2 bg-[#FDFB9C] border-2 border-black"
                        >
                          <Gift className="w-4 h-4 text-black mt-0.5 flex-shrink-0" />
                          <p className="text-base font-bold text-black break-words">
                            {wish}
                          </p>
                        </div>
                      ))
                    ) : (
                      // Show hidden placeholder
                      <div className="flex items-center gap-3 p-4 bg-gray-100 border-2 border-dashed border-gray-400 rounded">
                        <EyeOff className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-base font-bold text-gray-600">
                            {t.hiddenWishes} ({assignment.wishes.length})
                          </p>
                          <p className="text-sm text-gray-500">
                            {t.clickToReveal}
                          </p>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-base font-bold text-black opacity-50 italic">
                        {t.noWishes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {sortedAssignments.length === 0 && (
            <div className="text-center py-8">
              <div className="inline-block bg-white border-4 border-black p-4 rotate-[5deg] mb-4">
                <Gift className="w-12 h-12 text-black opacity-30" />
              </div>
              <p className="text-xl font-bold text-black opacity-50">
                {t.noWishes}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
