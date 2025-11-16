import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ChristmasReveal from "../components/participant/ChristmasReveal";
import WishesStep from "../components/participant/WishesStep";
import { Sparkles, Loader2 } from "lucide-react";

const translations = {
    de: {
        welcome: "Willkommen zum Wichteln!",
        clickToReveal: "Klicke um zu sehen wen du gezogen hast",
        reveal: "Enthüllen",
        loading: "Lädt...",
        invalidLink: "Ungültiger Link!",
        priceLimit: "Preisobergrenze",
    },
    en: {
        welcome: "Welcome to Secret Santa!",
        clickToReveal: "Click to reveal who you drew",
        reveal: "Reveal",
        loading: "Loading...",
        invalidLink: "Invalid Link!",
        priceLimit: "Price Limit",
    },
};

export default function Participant() {
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const participantToken = searchParams.get("token");

    const [step, setStep] = useState<"initial" | "reveal" | "wishes">(
        "initial"
    );

    const { data: assignments, isLoading: assignmentsLoading } = useQuery({
        queryKey: ["assignment", participantToken],
        queryFn: async () => {
            const assignments = await api.entities.Assignment.filter({
                participant_token: participantToken || undefined,
            });
            return assignments;
        },
        enabled: !!participantToken,
    });

    const assignment = assignments?.[0];

    // Skip reveal step if user has already viewed
    React.useEffect(() => {
        if (assignment?.has_viewed && step === "initial") {
            setStep("wishes");
        }
    }, [assignment?.has_viewed, step]);

    const { data: rooms, isLoading: roomsLoading } = useQuery({
        queryKey: ["room", assignment?.room_id],
        queryFn: () => api.entities.Room.filter({ id: assignment!.room_id }),
        enabled: !!assignment?.room_id,
    });

    const room = rooms?.[0];
    const t = room
        ? translations[room.language as keyof typeof translations]
        : translations.de;

    const markAsViewedMutation = useMutation({
        mutationFn: () =>
            api.entities.Assignment.update(assignment!.id, {
                has_viewed: true,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["assignment", participantToken],
            });
        },
    });

    const updateWishesMutation = useMutation({
        mutationFn: (wishes: string[]) =>
            api.entities.Assignment.update(assignment!.id, { wishes }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["assignment", participantToken],
            });
        },
    });

    const handleReveal = () => {
        setStep("reveal");
        if (!assignment!.has_viewed) {
            markAsViewedMutation.mutate();
        }
    };

    const handleRevealComplete = () => {
        setStep("wishes");
    };

    // Show loading if we don't have a token or if queries are still loading
    if (!participantToken) {
        return (
            <div className="min-h-screen bg-[#FF6B9D] flex items-center justify-center p-4">
                <Card className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8">
                    <div className="text-6xl mb-4 text-center">😕</div>
                    <p className="text-2xl font-black text-center">
                        {translations.de.invalidLink}
                    </p>
                </Card>
            </div>
        );
    }

    const isLoading = assignmentsLoading || (assignment && roomsLoading);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#A8E6CF] flex items-center justify-center">
                <Card className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-12">
                    <div className="text-center">
                        <Loader2 className="w-16 h-16 animate-spin text-black mx-auto mb-4" />
                        <p className="text-2xl font-black text-black">
                            {t.loading}
                        </p>
                    </div>
                </Card>
            </div>
        );
    }

    if (!assignment || !room) {
        return (
            <div className="min-h-screen bg-[#FF6B9D] flex items-center justify-center p-4">
                <Card className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8">
                    <div className="text-6xl mb-4 text-center">😕</div>
                    <p className="text-2xl font-black text-center">
                        {t.invalidLink}
                    </p>
                </Card>
            </div>
        );
    }

    if (step === "initial") {
        return (
            <div className="min-h-screen bg-[#FDFB9C] flex items-center justify-center p-4">
                <Card className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-12 max-w-2xl rotate-[-1deg]">
                    <div className="text-center space-y-8">
                        <div className="inline-block bg-[#FF6B9D] border-4 border-black p-6 rotate-[3deg] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                            <Sparkles className="w-20 h-20 text-black" />
                        </div>

                        <div>
                            <h1
                                className="text-5xl md:text-6xl font-black text-black mb-4"
                                style={{ textShadow: "4px 4px 0px #FFD93D" }}
                            >
                                {t.welcome}
                            </h1>
                            <p className="text-3xl font-bold text-black mb-1">
                                {assignment.participant_name}
                            </p>
                            <p className="text-2xl font-bold text-black mb-2">
                                {room.room_name}
                            </p>
                            <p className="text-xl font-bold text-black opacity-70">
                                {t.priceLimit}: {room.price_limit}{" "}
                                {room.currency}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <p className="text-2xl font-black text-black">
                                {t.clickToReveal}
                            </p>
                            <Button
                                onClick={handleReveal}
                                className="border-4 border-black bg-[#A8E6CF] hover:bg-[#88D4AB] h-20 px-12 text-3xl text-black font-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[6px] hover:translate-y-[6px] transition-all"
                            >
                                <Sparkles className="w-8 h-8 mr-3" />
                                {t.reveal}
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    if (step === "reveal") {
        return (
            <ChristmasReveal
                drawnName={assignment.drawn_name}
                language={room.language}
                onComplete={handleRevealComplete}
            />
        );
    }

    if (step === "wishes") {
        return (
            <WishesStep
                assignment={assignment}
                drawnParticipantWishes={
                    assignment.drawn_participant_wishes || []
                }
                room={room}
                onUpdateWishes={(wishes: string[]) =>
                    updateWishesMutation.mutate(wishes)
                }
            />
        );
    }

    return null;
}
