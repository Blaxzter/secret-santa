import { useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Copy,
    Users,
    DollarSign,
    Link as LinkIcon,
    Loader2,
    ArrowLeft,
} from "lucide-react";

const translations = {
    de: {
        title: "Raum Admin",
        roomName: "Raum",
        priceLimit: "Preisobergrenze",
        participants: "Teilnehmer",
        copyLink: "Link kopieren",
        copied: "Kopiert!",
        updatePrice: "Preis aktualisieren",
        shareLinks:
            "Teile diese personalisierten Links mit deinen Teilnehmern:",
        backToAllRooms: "Zurück zu allen Räumen",
    },
    en: {
        title: "Room Admin",
        roomName: "Room",
        priceLimit: "Price Limit",
        participants: "Participants",
        copyLink: "Copy Link",
        copied: "Copied!",
        updatePrice: "Update Price",
        shareLinks: "Share these personalized links with your participants:",
        backToAllRooms: "Back to All Rooms",
    },
};

export default function RoomAdmin() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const adminToken = searchParams.get("token");

    const [newPriceLimit, setNewPriceLimit] = useState("");
    const [copiedToken, setCopiedToken] = useState<string | null>(null);

    const { data: rooms, isLoading: roomsLoading } = useQuery({
        queryKey: ["room", adminToken],
        queryFn: async () => {
            const rooms = await api.entities.Room.filter({
                admin_token: adminToken || undefined,
            });
            return rooms;
        },
        enabled: !!adminToken,
    });

    const room = rooms?.[0];
    const t = room ? translations[room.language] : translations.de;

    const { data: assignments, isLoading: assignmentsLoading } = useQuery({
        queryKey: ["assignments", room?.id],
        queryFn: () => api.entities.Assignment.filter({ room_id: room!.id }),
        enabled: !!room?.id,
    });

    const updatePriceMutation = useMutation({
        mutationFn: (newPrice: string) =>
            api.entities.Room.update(room!.id, {
                price_limit: parseFloat(newPrice),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["room", adminToken] });
            setNewPriceLimit("");
        },
    });

    const copyToClipboard = (token: string, name: string) => {
        const baseUrl =
            window.location.origin +
            window.location.pathname.replace(/\/[^/]*$/, "");
        const url = `${baseUrl}/#${createPageUrl(
            "Participant"
        )}?token=${token}`;
        navigator.clipboard.writeText(url);
        setCopiedToken(name);
        setTimeout(() => setCopiedToken(null), 2000);
    };

    if (!adminToken) {
        return (
            <div className="min-h-screen bg-[#FF6B9D] flex items-center justify-center p-4">
                <Card className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8">
                    <p className="text-2xl font-black mb-4">
                        Ungültiger Admin-Link!
                    </p>
                    <Button
                        onClick={() =>
                            navigate(createPageUrl("AdminDashboard"))
                        }
                        className="border-4 border-black bg-[#A8E6CF] hover:bg-[#88D4AB] h-12 px-6 font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Zurück
                    </Button>
                </Card>
            </div>
        );
    }

    if (roomsLoading || (room && assignmentsLoading)) {
        return (
            <div className="min-h-screen bg-[#A8E6CF] flex items-center justify-center">
                <Card className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-12">
                    <div className="text-center">
                        <Loader2 className="w-16 h-16 animate-spin text-black mx-auto mb-4" />
                        <p className="text-2xl font-black text-black">
                            Lädt...
                        </p>
                    </div>
                </Card>
            </div>
        );
    }

    if (!room) {
        return (
            <div className="min-h-screen bg-[#FF6B9D] flex items-center justify-center p-4">
                <Card className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8">
                    <p className="text-2xl font-black mb-4">
                        Raum nicht gefunden!
                    </p>
                    <Button
                        onClick={() =>
                            navigate(createPageUrl("AdminDashboard"))
                        }
                        className="border-4 border-black bg-[#A8E6CF] hover:bg-[#88D4AB] h-12 px-6 font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Zurück
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFD93D] p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Back Button */}
                <Button
                    onClick={() => navigate(createPageUrl("AdminDashboard"))}
                    variant="outline"
                    className="border-4 border-black bg-white hover:bg-gray-100 h-12 px-6 font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    {t.backToAllRooms}
                </Button>

                {/* Header */}
                <div className="bg-[#FF6B9D] border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rotate-[-1deg]">
                    <h1 className="text-5xl font-black text-black mb-2">
                        {t.title}
                    </h1>
                    <p className="text-2xl font-bold text-black">
                        {room.room_name}
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                    <Card className="bg-[#A8E6CF] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-black p-3 rotate-[5deg]">
                                <Users className="w-8 h-8 text-[#A8E6CF]" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-black opacity-70">
                                    {t.participants}
                                </p>
                                <p className="text-4xl font-black text-black">
                                    {room.participant_names.length}
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-[#FDFB9C] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-black p-3 rotate-[-5deg]">
                                <DollarSign className="w-8 h-8 text-[#FDFB9C]" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-black opacity-70">
                                    {t.priceLimit}
                                </p>
                                <p className="text-4xl font-black text-black">
                                    {room.price_limit} {room.currency}
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-black p-3 rotate-[3deg]">
                                <LinkIcon className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-black opacity-70">
                                    Links
                                </p>
                                <p className="text-4xl font-black text-black">
                                    {assignments?.length || 0}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Update Price */}
                <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
                    <Label className="text-xl font-black text-black mb-3 block">
                        {t.updatePrice}
                    </Label>
                    <div className="flex gap-3">
                        <Input
                            type="number"
                            value={newPriceLimit}
                            onChange={(e) => setNewPriceLimit(e.target.value)}
                            placeholder={room.price_limit.toString()}
                            className="border-4 border-black h-12 text-lg font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                        <Button
                            onClick={() =>
                                updatePriceMutation.mutate(newPriceLimit)
                            }
                            disabled={
                                !newPriceLimit || updatePriceMutation.isPending
                            }
                            className="border-4 border-black bg-[#A8E6CF] hover:bg-[#88D4AB] h-12 px-6 text-lg font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50"
                        >
                            {updatePriceMutation.isPending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                t.updatePrice
                            )}
                        </Button>
                    </div>
                </Card>

                {/* Links */}
                <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 rotate-[0.5deg]">
                    <h2 className="text-3xl font-black text-black mb-6">
                        {t.shareLinks}
                    </h2>
                    <div className="space-y-4">
                        {assignments?.map((assignment) => {
                            const baseUrl =
                                window.location.origin +
                                window.location.pathname.replace(
                                    /\/[^/]*$/,
                                    ""
                                );
                            const participantUrl = `${baseUrl}/#${createPageUrl(
                                "Participant"
                            )}?token=${assignment.participant_token}`;

                            return (
                                <div
                                    key={assignment.id}
                                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-[#A8E6CF] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                                >
                                    <div className="flex-1">
                                        <p className="text-xl font-black text-black mb-1">
                                            {assignment.participant_name}
                                        </p>
                                        <p className="text-xs font-bold text-black opacity-60 break-all">
                                            {participantUrl}
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() =>
                                            copyToClipboard(
                                                assignment.participant_token,
                                                assignment.participant_name
                                            )
                                        }
                                        className="border-4 border-black bg-[#FFD93D] hover:bg-[#FFC700] px-6 h-12 text-lg font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all whitespace-nowrap"
                                    >
                                        <Copy className="w-5 h-5 mr-2" />
                                        {copiedToken ===
                                        assignment.participant_name
                                            ? t.copied
                                            : t.copyLink}
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>
        </div>
    );
}
