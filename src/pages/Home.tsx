import { useState } from "react";
import { api } from "@/api/apiClient";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Sparkles, Loader2 } from "lucide-react";
import logo from "@/assets/logo.png";

const translations = {
    de: {
        title: "Wichteln",
        subtitle: "Organisiere dein geheimes Wichteln",
        roomName: "Raum Name",
        roomNamePlaceholder: "z.B. Weihnachten 2024",
        participants: "Teilnehmer",
        participantPlaceholder: "Name eingeben",
        addParticipant: "Teilnehmer hinzufügen",
        priceLimit: "Preisobergrenze",
        currency: "Währung",
        language: "Sprache",
        createRoom: "Raum erstellen",
        minParticipants: "Mindestens 3 Teilnehmer erforderlich",
        viewAllRooms: "Alle Räume anzeigen",
    },
    en: {
        title: "Secret Santa",
        subtitle: "Organize your Secret Santa",
        roomName: "Room Name",
        roomNamePlaceholder: "e.g. Christmas 2024",
        participants: "Participants",
        participantPlaceholder: "Enter name",
        addParticipant: "Add Participant",
        priceLimit: "Price Limit",
        currency: "Currency",
        language: "Language",
        createRoom: "Create Room",
        minParticipants: "At least 3 participants required",
        viewAllRooms: "View All Rooms",
    },
};

export default function Home() {
    const navigate = useNavigate();
    const [language, setLanguage] = useState<"de" | "en">("de");
    const [roomName, setRoomName] = useState("");
    const [participants, setParticipants] = useState(["", "", ""]);
    const [priceLimit, setPriceLimit] = useState("");
    const [currency, setCurrency] = useState<"EUR" | "USD" | "GBP" | "CHF">(
        "EUR"
    );
    const [isCreating, setIsCreating] = useState(false);

    const t = translations[language];

    const addParticipant = () => {
        setParticipants([...participants, ""]);
    };

    const removeParticipant = (index: number) => {
        if (participants.length > 3) {
            setParticipants(participants.filter((_, i) => i !== index));
        }
    };

    const updateParticipant = (index: number, value: string) => {
        const newParticipants = [...participants];
        newParticipants[index] = value;
        setParticipants(newParticipants);
    };

    const isFormValid = () => {
        const filteredParticipants = participants.filter(
            (p) => p.trim() !== ""
        );
        return (
            roomName.trim() !== "" &&
            priceLimit.trim() !== "" &&
            parseFloat(priceLimit) > 0 &&
            filteredParticipants.length >= 3
        );
    };

    const generateValidAssignments = (participantsList: string[]) => {
        let attempts = 0;
        const maxAttempts = 100;

        while (attempts < maxAttempts) {
            const shuffled = [...participantsList];

            // Fisher-Yates shuffle
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }

            // Check if anyone got themselves
            let valid = true;
            for (let i = 0; i < participantsList.length; i++) {
                if (participantsList[i] === shuffled[i]) {
                    valid = false;
                    break;
                }
            }

            if (valid) {
                return shuffled;
            }

            attempts++;
        }

        // Fallback: use a circular shift if random attempts fail
        const result = [];
        for (let i = 0; i < participantsList.length; i++) {
            result.push(participantsList[(i + 1) % participantsList.length]);
        }
        return result;
    };

    const createRoom = async () => {
        const filteredParticipants = participants.filter(
            (p) => p.trim() !== ""
        );

        if (filteredParticipants.length < 3) {
            alert(t.minParticipants);
            return;
        }

        setIsCreating(true);

        const adminToken =
            Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);

        const room = await api.entities.Room.create({
            room_name: roomName,
            participant_names: filteredParticipants,
            price_limit: parseFloat(priceLimit),
            currency,
            language,
            admin_token: adminToken,
            is_drawn: true,
        });

        // Generate valid assignments where no one draws themselves
        const drawnNames = generateValidAssignments(filteredParticipants);

        const assignments = [];

        for (let i = 0; i < filteredParticipants.length; i++) {
            const participant = filteredParticipants[i];
            const drawn = drawnNames[i];

            const token =
                Math.random().toString(36).substring(2, 15) +
                Math.random().toString(36).substring(2, 15);

            assignments.push({
                room_id: room.id,
                participant_name: participant,
                drawn_name: drawn,
                participant_token: token,
                wishes: [],
                has_viewed: false,
            });
        }

        await api.entities.Assignment.bulkCreate(assignments);

        navigate(createPageUrl("RoomAdmin") + `?token=${adminToken}`);
    };

    return (
        <div className="min-h-screen bg-[#FDFB9C] p-4 md:p-8">
            <div className="max-w-3xl mx-auto">
                {/* Hero */}
                <div className="text-center mb-12 mt-8">
                    <div className="inline-block bg-[#FF6B9D] border-4 border-black p-4 rotate-[-2deg] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-6">
                        <img
                            src={logo}
                            alt="Secret Santa Logo"
                            className="w-16 h-16 mx-auto"
                        />
                    </div>
                    <h1
                        className="text-6xl md:text-7xl font-black mb-4 text-black tracking-tight"
                        style={{ textShadow: "4px 4px 0px #FF6B9D" }}
                    >
                        {t.title}
                    </h1>
                    <p className="text-2xl font-bold text-black">
                        {t.subtitle}
                    </p>
                </div>

                <div className="mb-6 text-center">
                    <Button
                        onClick={() =>
                            navigate(createPageUrl("AdminDashboard"))
                        }
                        variant="outline"
                        className="border-4 border-black bg-white hover:bg-gray-100 h-12 text-lg font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                    >
                        {t.viewAllRooms}
                    </Button>
                </div>

                {/* Main Form */}
                <Card className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 rotate-[0.5deg]">
                    <div className="space-y-6">
                        {/* Language Selection */}
                        <div className="space-y-2">
                            <Label className="text-xl font-black text-black">
                                {t.language}
                            </Label>
                            <Select
                                value={language}
                                onValueChange={(value) =>
                                    setLanguage(value as "de" | "en")
                                }
                            >
                                <SelectTrigger
                                    className="border-4 border-black bg-[#A8E6CF] text-lg font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                                    size="default"
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="border-4 border-black">
                                    <SelectItem
                                        value="de"
                                        className="text-lg font-bold"
                                    >
                                        <span
                                            style={{
                                                fontFamily:
                                                    '"Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif',
                                            }}
                                        >
                                            🇩🇪
                                        </span>{" "}
                                        Deutsch
                                    </SelectItem>
                                    <SelectItem
                                        value="en"
                                        className="text-lg font-bold"
                                    >
                                        <span
                                            style={{
                                                fontFamily:
                                                    '"Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif',
                                            }}
                                        >
                                            🇬🇧
                                        </span>{" "}
                                        English
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Room Name */}
                        <div className="space-y-2">
                            <Label className="text-xl font-black text-black">
                                {t.roomName}
                            </Label>
                            <Input
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                                placeholder={t.roomNamePlaceholder}
                                className="border-4 border-black h-14 text-lg font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                        </div>

                        {/* Participants */}
                        <div className="space-y-2">
                            <Label className="text-xl font-black text-black">
                                {t.participants}
                            </Label>
                            <div className="space-y-3">
                                {participants.map((participant, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            value={participant}
                                            onChange={(e) =>
                                                updateParticipant(
                                                    index,
                                                    e.target.value
                                                )
                                            }
                                            placeholder={`${
                                                t.participantPlaceholder
                                            } ${index + 1}`}
                                            className="border-4 border-black h-12 text-lg font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0 focus-visible:ring-offset-0"
                                        />
                                        {participants.length > 3 && (
                                            <Button
                                                onClick={() =>
                                                    removeParticipant(index)
                                                }
                                                variant="outline"
                                                className="border-4 border-black bg-[#FFD93D] hover:bg-[#FFC700] h-12 w-12 p-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                                            >
                                                <Trash2 className="w-5 h-5 text-black" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <Button
                                onClick={addParticipant}
                                variant="outline"
                                className="w-full border-4 border-black bg-[#A8E6CF] hover:bg-[#88D4AB] h-12 text-lg font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                {t.addParticipant}
                            </Button>
                        </div>

                        {/* Price Limit */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xl font-black text-black">
                                    {t.priceLimit}
                                </Label>
                                <Input
                                    type="number"
                                    value={priceLimit}
                                    onChange={(e) =>
                                        setPriceLimit(e.target.value)
                                    }
                                    placeholder="20"
                                    className="border-4 border-black h-14 text-lg font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xl font-black text-black">
                                    {t.currency}
                                </Label>
                                <Select
                                    value={currency}
                                    onValueChange={(value) =>
                                        setCurrency(
                                            value as
                                                | "EUR"
                                                | "USD"
                                                | "GBP"
                                                | "CHF"
                                        )
                                    }
                                >
                                    <SelectTrigger
                                        className="border-4 border-black bg-white h-14 text-lg font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                                        style={{ height: "56px" }}
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="border-4 border-black">
                                        <SelectItem
                                            value="EUR"
                                            className="text-lg font-bold"
                                        >
                                            EUR €
                                        </SelectItem>
                                        <SelectItem
                                            value="USD"
                                            className="text-lg font-bold"
                                        >
                                            USD $
                                        </SelectItem>
                                        <SelectItem
                                            value="GBP"
                                            className="text-lg font-bold"
                                        >
                                            GBP £
                                        </SelectItem>
                                        <SelectItem
                                            value="CHF"
                                            className="text-lg font-bold"
                                        >
                                            CHF
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Create Button */}
                        <Button
                            onClick={createRoom}
                            disabled={isCreating || !isFormValid()}
                            className="w-full border-4 border-black bg-[#FF6B9D] hover:bg-[#FF4081] h-16 text-2xl font-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isCreating ? (
                                <>
                                    <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                                    ...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-6 h-6 mr-2" />
                                    {t.createRoom}
                                </>
                            )}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
