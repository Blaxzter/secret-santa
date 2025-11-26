import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Key, Copy, Check, X } from "lucide-react";
import { getUserId, setUserId } from "@/pages/Home";

interface UserIdDialogProps {
  onUserIdChange?: (newId: string) => void;
}

export function UserIdDialog({ onUserIdChange }: UserIdDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserIdState] = useState(getUserId());
  const [copied, setCopied] = useState(false);
  const [restoreId, setRestoreId] = useState("");
  const [showRestore, setShowRestore] = useState(false);

  const copyUserId = () => {
    navigator.clipboard.writeText(userId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const restoreUserId = () => {
    if (restoreId.trim()) {
      setUserId(restoreId.trim());
      setUserIdState(restoreId.trim());
      setRestoreId("");
      setShowRestore(false);
      onUserIdChange?.(restoreId.trim());
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 border-4 border-black bg-[#A8E6CF] hover:bg-[#88D4AB] h-14 w-14 p-0 rounded-full font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
      >
        <Key className="w-6 h-6" />
      </Button>

      {/* Dialog Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" />

          {/* Dialog */}
          <Card
            className="relative z-10 bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-6 w-full max-w-md animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <Button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 border-2 border-black bg-gray-200 hover:bg-gray-300 h-8 w-8 p-0 rounded-full"
            >
              <X className="w-4 h-4 text-black" />
            </Button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#A8E6CF] border-2 border-black p-2">
                <Key className="w-6 h-6 text-black" />
              </div>
              <h2 className="text-2xl font-black text-black">Benutzer-ID</h2>
            </div>

            {/* Description */}
            <p className="text-sm font-bold text-black opacity-70 mb-4">
              Speichere diese ID! Du brauchst sie, um auf einem anderen Gerät
              auf deine Räume zuzugreifen.
            </p>

            {/* User ID Display */}
            <div className="flex gap-3 mb-4">
              <Input
                value={userId}
                readOnly
                className="border-4 border-black h-12 text-lg font-mono font-bold bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              />
              <Button
                onClick={copyUserId}
                className="border-4 border-black bg-[#FFD93D] hover:bg-[#FFC700] h-12 px-4 font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                {copied ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </Button>
            </div>

            {/* Restore ID Section */}
            <div>
              <Button
                onClick={() => setShowRestore(!showRestore)}
                variant="ghost"
                className="text-sm font-bold text-black underline p-0 h-auto hover:bg-transparent"
              >
                ID wiederherstellen?
              </Button>

              <div
                className={`overflow-hidden transition-all duration-200 ease-in-out ${
                  showRestore
                    ? "max-h-20 opacity-100 mt-3"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="flex gap-3">
                  <Input
                    value={restoreId}
                    onChange={(e) => setRestoreId(e.target.value)}
                    placeholder="Gespeicherte ID eingeben"
                    className="border-4 border-black h-12 text-lg font-mono font-bold bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  />
                  <Button
                    onClick={restoreUserId}
                    disabled={!restoreId.trim()}
                    className="border-4 border-black bg-[#FF6B9D] hover:bg-[#FF4081] h-12 px-4 font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50"
                  >
                    Laden
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

