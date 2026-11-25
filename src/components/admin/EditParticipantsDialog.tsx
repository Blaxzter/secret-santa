import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertTriangle,
  Eye,
  Info,
  Loader2,
  Plus,
  Save,
  Trash2,
  Users,
} from "lucide-react";
import type { Assignment, ParticipantInput } from "@/types/entities";

const MIN_PARTICIPANTS = 3;

const translations = {
  de: {
    title: "Teilnehmer bearbeiten",
    description:
      "Namen anpassen, Personen hinzufügen oder entfernen. Bereits erstellte Links bleiben gültig.",
    namePlaceholder: "Name",
    addParticipant: "Person hinzufügen",
    remove: "Entfernen",
    viewed: "hat schon reingeschaut",
    cancel: "Abbrechen",
    save: "Speichern",
    renameOnlyInfo:
      "Nur Namen geändert: Die Zuteilung bleibt gleich.",
    redrawInfo:
      "Weil Personen hinzugefügt oder entfernt wurden, wird für alle neu ausgelost.",
    redrawViewedWarning: (names: string[]) =>
      names.length === 1
        ? `Achtung: ${names[0]} hat die Zuteilung schon gesehen und bekommt eine neue!`
        : `Achtung: ${names.join(", ")} haben die Zuteilung schon gesehen und bekommen eine neue!`,
    newLinksInfo:
      "Neue Personen bekommen einen eigenen Link, den du danach verschicken kannst.",
    errorEmpty: "Namen dürfen nicht leer sein.",
    errorDuplicate: (name: string) => `„${name}“ ist doppelt vorhanden.`,
    errorMin: `Es werden mindestens ${MIN_PARTICIPANTS} Teilnehmer benötigt.`,
    errorSave: "Speichern fehlgeschlagen. Bitte erneut versuchen.",
  },
  en: {
    title: "Edit Participants",
    description:
      "Rename, add or remove people. Links that were already created stay valid.",
    namePlaceholder: "Name",
    addParticipant: "Add person",
    remove: "Remove",
    viewed: "already looked",
    cancel: "Cancel",
    save: "Save",
    renameOnlyInfo: "Only names changed: assignments stay the same.",
    redrawInfo:
      "Because people were added or removed, everyone gets a new draw.",
    redrawViewedWarning: (names: string[]) =>
      `Warning: ${names.join(", ")} already saw their assignment and will get a new one!`,
    newLinksInfo:
      "New people get their own link, which you can send afterwards.",
    errorEmpty: "Names must not be empty.",
    errorDuplicate: (name: string) => `"${name}" appears more than once.`,
    errorMin: `At least ${MIN_PARTICIPANTS} participants are required.`,
    errorSave: "Saving failed. Please try again.",
  },
};

interface Row {
  key: string;
  id?: string;
  name: string;
  originalName?: string;
  hasViewed: boolean;
}

interface EditParticipantsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participantNames: string[];
  assignments: Assignment[];
  language: "de" | "en";
  isSaving: boolean;
  onSave: (participants: ParticipantInput[]) => Promise<unknown>;
}

function buildRows(participantNames: string[], assignments: Assignment[]): Row[] {
  const byName = new Map(assignments.map((a) => [a.participant_name, a]));
  const ordered = participantNames
    .map((name) => byName.get(name))
    .filter((a): a is Assignment => !!a);
  // Include assignments that are somehow missing from participant_names
  for (const a of assignments) {
    if (!ordered.includes(a)) ordered.push(a);
  }
  return ordered.map((a) => ({
    key: a.id,
    id: a.id,
    name: a.participant_name,
    originalName: a.participant_name,
    hasViewed: a.has_viewed,
  }));
}

export default function EditParticipantsDialog({
  open,
  onOpenChange,
  participantNames,
  assignments,
  language,
  isSaving,
  onSave,
}: EditParticipantsDialogProps) {
  const t = translations[language];
  const [rows, setRows] = useState<Row[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Reset the form each time the dialog opens
  const [wasOpen, setWasOpen] = useState(false);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setRows(buildRows(participantNames, assignments));
      setSaveError(null);
    }
  }

  // New rows left empty are simply ignored
  const effectiveRows = rows.filter((r) => r.id || r.name.trim() !== "");

  const removedCount = assignments.filter(
    (a) => !rows.some((r) => r.id === a.id)
  ).length;
  const addedCount = effectiveRows.filter((r) => !r.id).length;
  const renamedCount = effectiveRows.filter(
    (r) => r.id && r.name.trim() !== r.originalName
  ).length;
  const willRedraw = addedCount > 0 || removedCount > 0;
  const hasChanges = willRedraw || renamedCount > 0;

  const viewedNames = effectiveRows
    .filter((r) => r.id && r.hasViewed)
    .map((r) => r.name.trim() || r.originalName || "");

  const validationError = (() => {
    if (effectiveRows.some((r) => r.name.trim() === "")) return t.errorEmpty;
    const seen = new Set<string>();
    for (const r of effectiveRows) {
      const key = r.name.trim().toLocaleLowerCase();
      if (seen.has(key)) return t.errorDuplicate(r.name.trim());
      seen.add(key);
    }
    if (effectiveRows.length < MIN_PARTICIPANTS) return t.errorMin;
    return null;
  })();

  const updateName = (key: string, name: string) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, name } : r)));
  };

  const removeRow = (key: string) => {
    setRows((prev) => prev.filter((r) => r.key !== key));
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { key: crypto.randomUUID(), name: "", hasViewed: false },
    ]);
  };

  const handleSave = async () => {
    setSaveError(null);
    try {
      await onSave(
        effectiveRows.map((r) => ({ id: r.id, name: r.name.trim() }))
      );
      onOpenChange(false);
    } catch {
      setSaveError(t.errorSave);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !isSaving && onOpenChange(o)}>
      <DialogContent
        className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
        showCloseButton={!isSaving}
      >
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-[#A8E6CF] p-2 border-4 border-black rotate-[-3deg]">
              <Users className="w-6 h-6 text-black" />
            </div>
            <DialogTitle className="text-2xl font-black text-black">
              {t.title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-base font-bold text-black opacity-70">
            {t.description}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 -mx-6 px-6 py-2 space-y-3 scrollbar-brutalist">
          {rows.map((row) => (
            <div key={row.key}>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={row.name}
                  onChange={(e) => updateName(row.key, e.target.value)}
                  placeholder={row.originalName ?? t.namePlaceholder}
                  autoFocus={!row.id && row.name === ""}
                  className={`border-4 border-black h-12 text-base md:text-lg font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0 focus-visible:ring-offset-0 flex-1 ${
                    row.id ? "bg-white" : "bg-[#FDFB9C]"
                  }`}
                />
                <Button
                  onClick={() => removeRow(row.key)}
                  aria-label={t.remove}
                  title={t.remove}
                  className="border-4 border-black bg-white hover:bg-[#FF6B9D] h-12 w-12 p-0 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
              {row.hasViewed && (
                <p className="flex items-center gap-1 text-xs font-bold text-black opacity-60 mt-1 ml-1">
                  <Eye className="w-3 h-3" />
                  {t.viewed}
                </p>
              )}
            </div>
          ))}

          <Button
            onClick={addRow}
            className="w-full border-4 border-dashed border-black bg-white hover:bg-[#A8E6CF] h-12 font-black text-black"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t.addParticipant}
          </Button>
        </div>

        <div className="flex-shrink-0 space-y-2">
          {hasChanges && !willRedraw && (
            <Notice tone="info">{t.renameOnlyInfo}</Notice>
          )}
          {willRedraw && <Notice tone="info">{t.redrawInfo}</Notice>}
          {willRedraw && addedCount > 0 && (
            <Notice tone="info">{t.newLinksInfo}</Notice>
          )}
          {willRedraw && viewedNames.length > 0 && (
            <Notice tone="warning">
              {t.redrawViewedWarning(viewedNames)}
            </Notice>
          )}
          {hasChanges && validationError && (
            <Notice tone="error">{validationError}</Notice>
          )}
          {saveError && <Notice tone="error">{saveError}</Notice>}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-3 flex-shrink-0">
          <Button
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="border-4 border-black bg-white hover:bg-gray-100 h-12 px-6 font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            {t.cancel}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || !!validationError || isSaving}
            className="border-4 border-black bg-[#A8E6CF] hover:bg-[#88D4AB] h-12 px-6 font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Save className="w-5 h-5 mr-2" />
            )}
            {t.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Notice({
  tone,
  children,
}: {
  tone: "info" | "warning" | "error";
  children: ReactNode;
}) {
  const styles = {
    info: "bg-[#A8E6CF]",
    warning: "bg-[#FFD93D]",
    error: "bg-[#FF6B9D]",
  }[tone];
  const Icon = tone === "info" ? Info : AlertTriangle;
  return (
    <div
      className={`flex items-start gap-2 p-3 border-4 border-black text-sm font-bold text-black ${styles}`}
    >
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <span>{children}</span>
    </div>
  );
}
