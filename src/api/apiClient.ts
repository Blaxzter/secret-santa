// API Client for communicating with Cloudflare Worker endpoints
import type {
    Room,
    Assignment,
    CreateRoomInput,
    CreateAssignmentInput,
    UpdateRoomInput,
    UpdateAssignmentInput,
} from "@/types/entities";

const API_BASE = "/api";

class ApiClient {
    private async fetch<T>(
        endpoint: string,
        options?: RequestInit
    ): Promise<T> {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...options?.headers,
            },
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`API Error: ${response.status} - ${error}`);
        }

        return response.json();
    }

    // Room API
    rooms = {
        list: async (orderBy?: string): Promise<Room[]> => {
            const params = orderBy ? `?orderBy=${orderBy}` : "";
            return this.fetch<Room[]>(`/rooms${params}`);
        },

        filter: async (filters: Partial<Room>): Promise<Room[]> => {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) {
                    params.append(key, String(value));
                }
            });
            return this.fetch<Room[]>(`/rooms?${params.toString()}`);
        },

        create: async (data: CreateRoomInput): Promise<Room> => {
            return this.fetch<Room>("/rooms", {
                method: "POST",
                body: JSON.stringify(data),
            });
        },

        update: async (id: string, data: UpdateRoomInput): Promise<Room> => {
            return this.fetch<Room>(`/rooms/${id}`, {
                method: "PATCH",
                body: JSON.stringify(data),
            });
        },

        get: async (id: string): Promise<Room> => {
            return this.fetch<Room>(`/rooms/${id}`);
        },

        delete: async (
            id: string
        ): Promise<{ success: boolean; message: string }> => {
            return this.fetch<{ success: boolean; message: string }>(
                `/rooms/${id}`,
                {
                    method: "DELETE",
                }
            );
        },
    };

    // Assignment API
    assignments = {
        list: async (orderBy?: string): Promise<Assignment[]> => {
            const params = orderBy ? `?orderBy=${orderBy}` : "";
            return this.fetch<Assignment[]>(`/assignments${params}`);
        },

        filter: async (filters: Partial<Assignment>): Promise<Assignment[]> => {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) {
                    params.append(key, String(value));
                }
            });
            return this.fetch<Assignment[]>(
                `/assignments?${params.toString()}`
            );
        },

        create: async (data: CreateAssignmentInput): Promise<Assignment> => {
            return this.fetch<Assignment>("/assignments", {
                method: "POST",
                body: JSON.stringify(data),
            });
        },

        bulkCreate: async (
            data: CreateAssignmentInput[]
        ): Promise<Assignment[]> => {
            return this.fetch<Assignment[]>("/assignments/bulk", {
                method: "POST",
                body: JSON.stringify(data),
            });
        },

        update: async (
            id: string,
            data: UpdateAssignmentInput
        ): Promise<Assignment> => {
            return this.fetch<Assignment>(`/assignments/${id}`, {
                method: "PATCH",
                body: JSON.stringify(data),
            });
        },

        get: async (id: string): Promise<Assignment> => {
            return this.fetch<Assignment>(`/assignments/${id}`);
        },
    };
}

// Create a client instance that mimics api structure
export const apiClient = new ApiClient();

// Export entities structure to match api SDK pattern used in components
export const api = {
    entities: {
        Room: apiClient.rooms,
        Assignment: apiClient.assignments,
    },
};
