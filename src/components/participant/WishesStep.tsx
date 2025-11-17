import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Gift, Heart, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import type { Assignment, Room } from "@/types/entities";

const translations = {
    de: {
        yourWishes: "Deine Wünsche",
        addWish: "Wunsch hinzufügen",
        wishPlaceholder: "z.B. Ein gutes Buch",
        saveWishes: "Wünsche speichern",
        theirWishes: "Wünsche von",
        noWishes: "Noch keine Wünsche hinzugefügt",
        priceLimit: "Preisobergrenze",
        youAreGiftingTo: "Du beschenkst",
        leftSideInstruction:
            "Hier kannst du deine eigenen Wünsche eintragen. Schreibe einen Wunsch in das Feld und drücke auf das Plus-Symbol (+).",
        rightSideInstruction:
            "Hier siehst du die Wünsche der Person, die du beschenken darfst. Du kannst dir davon Ideen für dein Geschenk holen!",
    },
    en: {
        yourWishes: "Your Wishes",
        addWish: "Add Wish",
        wishPlaceholder: "e.g. A good book",
        saveWishes: "Save Wishes",
        theirWishes: "Wishes from",
        noWishes: "No wishes added yet",
        priceLimit: "Price Limit",
        youAreGiftingTo: "You are gifting to",
        leftSideInstruction:
            "Here you can add your own wishes. Write a wish in the field and press the plus symbol (+).",
        rightSideInstruction:
            "Here you see the wishes of the person you are giving a gift to. You can use these as ideas for your present!",
    },
};

interface WishesStepProps {
    assignment: Assignment;
    drawnParticipantWishes: string[];
    room: Room;
    onUpdateWishes: (wishes: string[]) => void;
}

export default function WishesStep({
    assignment,
    drawnParticipantWishes,
    room,
    onUpdateWishes,
}: WishesStepProps) {
    const [wishes, setWishes] = useState(assignment.wishes || []);
    const [newWish, setNewWish] = useState("");
    const t = translations[room.language];

    const addWish = () => {
        if (newWish.trim()) {
            const updatedWishes = [...wishes, newWish.trim()];
            setWishes(updatedWishes);
            setNewWish("");
            onUpdateWishes(updatedWishes);
        }
    };

    const removeWish = (index: number) => {
        const updatedWishes = wishes.filter((_, i) => i !== index);
        setWishes(updatedWishes);
        onUpdateWishes(updatedWishes);
    };

    return (
        <div className="min-h-screen bg-[#FFD93D] p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#FF6B9D] border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rotate-[-1deg]"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold text-black mb-1">
                                {assignment.participant_name}
                            </p>
                            <h1 className="text-4xl md:text-5xl font-black text-black mb-2">
                                {room.room_name}
                            </h1>
                            <p className="text-xl font-bold text-black flex items-center gap-2">
                                <DollarSign className="w-5 h-5" />
                                {t.priceLimit}: {room.price_limit}{" "}
                                {room.currency}
                            </p>
                        </div>
                        <Gift className="w-16 h-16 text-black" />
                    </div>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Your Wishes */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="bg-[#A8E6CF] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 h-full">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-black p-3 rotate-[5deg]">
                                    <Heart className="w-6 h-6 text-[#A8E6CF]" />
                                </div>
                                <h2 className="text-3xl font-black text-black">
                                    {t.yourWishes}
                                </h2>
                            </div>

                            <div className="bg-white border-4 border-black p-4 mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <p className="text-base font-bold text-black">
                                    {t.leftSideInstruction}
                                </p>
                            </div>

                            <div className="space-y-4">
                                {/* Add wish input */}
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <Input
                                            value={newWish}
                                            onChange={(e) =>
                                                setNewWish(e.target.value)
                                            }
                                            onKeyPress={(e) =>
                                                e.key === "Enter" && addWish()
                                            }
                                            placeholder={t.wishPlaceholder}
                                            className="border-4 border-black h-12 text-lg font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0 focus-visible:ring-offset-0 bg-white"
                                        />
                                        <Button
                                            onClick={addWish}
                                            className="border-4 border-black bg-[#FFD93D] hover:bg-[#FFC700] h-12 px-6 font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Wishes list */}
                                <div className="space-y-2">
                                    {wishes.map((wish, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex items-center justify-between p-3 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                                        >
                                            <p className="text-lg font-bold text-black flex-1">
                                                {wish}
                                            </p>
                                            <Button
                                                onClick={() =>
                                                    removeWish(index)
                                                }
                                                variant="ghost"
                                                size="icon"
                                                className="hover:bg-[#FF6B9D]"
                                            >
                                                <Trash2 className="w-4 h-4 text-black" />
                                            </Button>
                                        </motion.div>
                                    ))}
                                    {wishes.length === 0 && (
                                        <div className="text-center py-8 text-black font-bold opacity-50">
                                            {t.noWishes}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Their Wishes */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className="bg-[#FDFB9C] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 h-full">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-black p-3 rotate-[-5deg]">
                                    <Gift className="w-6 h-6 text-[#FDFB9C]" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-black opacity-70">
                                        {t.youAreGiftingTo}
                                    </p>
                                    <h2 className="text-3xl font-black text-black">
                                        {assignment.drawn_name}
                                    </h2>
                                </div>
                            </div>

                            <div className="bg-white border-4 border-black p-4 mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <p className="text-base font-bold text-black">
                                    {t.rightSideInstruction}
                                </p>
                            </div>

                            <div className="space-y-2">
                                {drawnParticipantWishes &&
                                drawnParticipantWishes.length > 0 ? (
                                    drawnParticipantWishes.map(
                                        (wish: string, index: number) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    delay: index * 0.1,
                                                }}
                                                className="p-4 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-[1deg]"
                                            >
                                                <p className="text-lg font-bold text-black">
                                                    • {wish}
                                                </p>
                                            </motion.div>
                                        )
                                    )
                                ) : (
                                    <div className="text-center py-12 space-y-4">
                                        <div className="inline-block bg-white border-4 border-black p-4 rotate-[5deg]">
                                            <Gift className="w-12 h-12 text-black opacity-30" />
                                        </div>
                                        <p className="text-xl font-bold text-black opacity-50">
                                            {t.noWishes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
