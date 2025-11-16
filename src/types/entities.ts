// TypeScript types based on entity definitions

export interface Room {
    id: string;
    room_name: string;
    participant_names: string[];
    price_limit: number;
    currency: "EUR" | "USD" | "GBP" | "CHF";
    language: "de" | "en";
    is_drawn: boolean;
    admin_token: string;
    created_date?: string;
}

export interface Assignment {
    id: string;
    room_id: string;
    participant_name: string;
    drawn_name: string;
    participant_token: string;
    wishes: string[];
    has_viewed: boolean;
    drawn_participant_wishes?: string[]; // Wishes of the person you drew (only included when querying by participant_token)
}

export type CreateRoomInput = Omit<Room, "id" | "created_date">;
export type CreateAssignmentInput = Omit<Assignment, "id">;
export type UpdateRoomInput = Partial<Omit<Room, "id" | "created_date">>;
export type UpdateAssignmentInput = Partial<Omit<Assignment, "id">>;
