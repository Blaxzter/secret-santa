import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Users,
  DollarSign,
  Calendar,
  ArrowRight,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { getUserId } from "./Home";
import { UserIdDialog } from "@/components/UserIdDialog";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [userId, setUserIdState] = useState(getUserId());

  const { data: rooms, isLoading } = useQuery({
    queryKey: ["my-rooms", userId],
    queryFn: () => api.entities.Room.filter({ owner_id: userId }),
    enabled: !!userId,
  });

  const deleteMutation = useMutation({
    mutationFn: (roomId: string) => api.entities.Room.delete(roomId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-rooms", userId] });
      setDeleteConfirm(null);
    },
  });

  const handleDelete = (e: React.MouseEvent, roomId: string) => {
    e.stopPropagation();
    if (deleteConfirm === roomId) {
      deleteMutation.mutate(roomId);
    } else {
      setDeleteConfirm(roomId);
    }
  };

  const handleUserIdChange = (newId: string) => {
    setUserIdState(newId);
    queryClient.invalidateQueries({ queryKey: ["my-rooms"] });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#A8E6CF] flex items-center justify-center">
        <Card className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-12">
          <Loader2 className="w-16 h-16 animate-spin text-black" />
        </Card>
        <UserIdDialog onUserIdChange={handleUserIdChange} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFD93D] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-[#FF6B9D] border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rotate-[-1deg] mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-5xl font-black text-black mb-2">
                Alle Räume
              </h1>
              <p className="text-xl font-bold text-black">
                {rooms?.length || 0} Wichtel-Räume
              </p>
            </div>
            <Button
              onClick={() => navigate(createPageUrl("Home"))}
              className="border-4 border-black bg-[#A8E6CF] hover:bg-[#88D4AB] h-14 px-6 text-lg font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <Plus className="w-5 h-5 mr-2" />
              Neuer Raum
            </Button>
          </div>
        </div>

        {/* Rooms Grid */}
        {!rooms || rooms.length === 0 ? (
          <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-12 text-center">
            <div className="text-6xl mb-4">🎁</div>
            <h2 className="text-3xl font-black text-black mb-4">
              Noch keine Räume
            </h2>
            <p className="text-xl font-bold text-black mb-6">
              Erstelle deinen ersten Wichtel-Raum!
            </p>
            <Button
              onClick={() => navigate(createPageUrl("Home"))}
              className="border-4 border-black bg-[#FF6B9D] hover:bg-[#FF4081] h-14 px-8 text-lg font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <Plus className="w-5 h-5 mr-2" />
              Raum erstellen
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room, index) => (
              <Card
                key={room.id}
                className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all cursor-pointer"
                style={{
                  transform: `rotate(${index % 2 === 0 ? "1deg" : "-1deg"})`,
                }}
                onClick={() =>
                  navigate(createPageUrl("RoomAdmin") + `?id=${room.id}`)
                }
              >
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-black text-black mb-2">
                      {room.room_name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm font-bold text-black opacity-60">
                      <Calendar className="w-4 h-4" />
                      {room.created_date &&
                        format(new Date(room.created_date), "dd.MM.yyyy")}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-[#A8E6CF] border-2 border-black">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-black" />
                        <span className="font-black text-black">
                          Teilnehmer
                        </span>
                      </div>
                      <span className="text-xl font-black text-black">
                        {room.participant_names.length}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-[#FFD93D] border-2 border-black">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-black" />
                        <span className="font-black text-black">Budget</span>
                      </div>
                      <span className="text-xl font-black text-black">
                        {room.price_limit} {room.currency}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    {room.is_drawn ? (
                      <div className="bg-green-400 text-black p-2 border-2 border-black text-center font-black">
                        ✓ Links generiert
                      </div>
                    ) : (
                      <div className="bg-orange-300 text-black p-2 border-2 border-black text-center font-black">
                        ⏳ Noch nicht gezogen
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1 border-4 border-black bg-[#FF6B9D] hover:bg-[#FF4081] h-12 text-lg font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      Raum öffnen <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                    <Button
                      onClick={(e) => handleDelete(e, room.id)}
                      className={`border-4 border-black h-12 px-4 font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                        deleteConfirm === room.id
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Floating User ID Dialog */}
      <UserIdDialog onUserIdChange={handleUserIdChange} />
    </div>
  );
}
