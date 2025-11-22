// Cloudflare Worker API with D1 Database

interface Env {
    secret_santa_db: D1Database;
}

// Helper function to generate unique IDs
function generateId(): string {
    return crypto.randomUUID();
}

// Helper function to generate tokens
function generateToken(): string {
    return crypto.randomUUID();
}

// Helper to parse request body
async function parseBody(request: Request): Promise<any> {
    try {
        return await request.json();
    } catch {
        throw new Error("Invalid JSON body");
    }
}

// Helper to create JSON response
function jsonResponse(data: any, status = 200): Response {
    return Response.json(data, {
        status,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
    });
}

// Room handlers
async function listRooms(env: Env, url: URL): Promise<Response> {
    const orderBy = url.searchParams.get("orderBy");
    const adminToken = url.searchParams.get("admin_token");
    const id = url.searchParams.get("id");

    let query = "SELECT * FROM rooms";
    const params: any[] = [];

    if (id) {
        query += " WHERE id = ?";
        params.push(id);
    } else if (adminToken) {
        query += " WHERE admin_token = ?";
        params.push(adminToken);
    }

    if (orderBy) {
        const direction = orderBy.startsWith("-") ? "DESC" : "ASC";
        const field = orderBy.replace(/^-/, "");
        query += ` ORDER BY ${field} ${direction}`;
    }

    const { results } = await env.secret_santa_db
        .prepare(query)
        .bind(...params)
        .all();

    // Parse JSON fields
    const rooms = results.map((row: any) => ({
        ...row,
        participant_names: JSON.parse(row.participant_names || "[]"),
        is_drawn: Boolean(row.is_drawn),
    }));

    return jsonResponse(rooms);
}

async function createRoom(env: Env, request: Request): Promise<Response> {
    const data = await parseBody(request);

    const id = generateId();
    const admin_token = data.admin_token || generateToken();
    const created_date = new Date().toISOString();

    await env.secret_santa_db
        .prepare(
            `INSERT INTO rooms (id, room_name, participant_names, price_limit, currency, language, is_drawn, admin_token, created_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
            id,
            data.room_name,
            JSON.stringify(data.participant_names || []),
            data.price_limit,
            data.currency || "EUR",
            data.language || "de",
            data.is_drawn ? 1 : 0,
            admin_token,
            created_date
        )
        .run();

    const room = {
        id,
        room_name: data.room_name,
        participant_names: data.participant_names || [],
        price_limit: data.price_limit,
        currency: data.currency || "EUR",
        language: data.language || "de",
        is_drawn: data.is_drawn || false,
        admin_token,
        created_date,
    };

    return jsonResponse(room, 201);
}

async function updateRoom(
    env: Env,
    id: string,
    request: Request
): Promise<Response> {
    const data = await parseBody(request);

    const updates: string[] = [];
    const params: any[] = [];

    if (data.price_limit !== undefined) {
        updates.push("price_limit = ?");
        params.push(data.price_limit);
    }
    if (data.is_drawn !== undefined) {
        updates.push("is_drawn = ?");
        params.push(data.is_drawn ? 1 : 0);
    }
    if (data.room_name !== undefined) {
        updates.push("room_name = ?");
        params.push(data.room_name);
    }
    if (data.participant_names !== undefined) {
        updates.push("participant_names = ?");
        params.push(JSON.stringify(data.participant_names));
    }

    if (updates.length === 0) {
        return jsonResponse({ error: "No valid fields to update" }, 400);
    }

    params.push(id);

    await env.secret_santa_db
        .prepare(`UPDATE rooms SET ${updates.join(", ")} WHERE id = ?`)
        .bind(...params)
        .run();

    const { results } = await env.secret_santa_db
        .prepare("SELECT * FROM rooms WHERE id = ?")
        .bind(id)
        .all();

    if (results.length === 0) {
        return jsonResponse({ error: "Room not found" }, 404);
    }

    const room = results[0] as any;
    return jsonResponse({
        ...room,
        participant_names: JSON.parse(room.participant_names || "[]"),
        is_drawn: Boolean(room.is_drawn),
    });
}

async function deleteRoom(env: Env, id: string): Promise<Response> {
    // First check if room exists
    const { results } = await env.secret_santa_db
        .prepare("SELECT id FROM rooms WHERE id = ?")
        .bind(id)
        .all();

    if (results.length === 0) {
        return jsonResponse({ error: "Room not found" }, 404);
    }

    // Delete associated assignments first
    await env.secret_santa_db
        .prepare("DELETE FROM assignments WHERE room_id = ?")
        .bind(id)
        .run();

    // Delete the room
    await env.secret_santa_db
        .prepare("DELETE FROM rooms WHERE id = ?")
        .bind(id)
        .run();

    return jsonResponse({ success: true, message: "Room deleted" });
}

async function reshuffleRoom(env: Env, id: string): Promise<Response> {
    // Get room and current assignments
    const { results: roomResults } = await env.secret_santa_db
        .prepare("SELECT * FROM rooms WHERE id = ?")
        .bind(id)
        .all();

    if (roomResults.length === 0) {
        return jsonResponse({ error: "Room not found" }, 404);
    }

    const room = roomResults[0] as any;
    const participantNames = JSON.parse(room.participant_names || "[]");

    if (participantNames.length < 2) {
        return jsonResponse({ error: "Need at least 2 participants" }, 400);
    }

    // Shuffle algorithm (Fisher-Yates)
    const shuffled = [...participantNames];
    let valid = false;
    let attempts = 0;
    const maxAttempts = 100;

    while (!valid && attempts < maxAttempts) {
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        // Validate: no one draws themselves
        valid = participantNames.every(
            (name: string, idx: number) => name !== shuffled[idx]
        );
        attempts++;
    }

    if (!valid) {
        return jsonResponse(
            {
                error: "Could not create valid assignment after multiple attempts",
            },
            500
        );
    }

    // Update all assignments with new drawn names
    const { results: assignmentResults } = await env.secret_santa_db
        .prepare("SELECT * FROM assignments WHERE room_id = ?")
        .bind(id)
        .all();

    const updatedAssignments = [];

    for (let i = 0; i < participantNames.length; i++) {
        const participantName = participantNames[i];
        const drawnName = shuffled[i];

        // Find the assignment for this participant
        const assignment = assignmentResults.find(
            (a: any) => a.participant_name === participantName
        ) as any;

        if (assignment) {
            // Update the assignment
            await env.secret_santa_db
                .prepare(
                    "UPDATE assignments SET drawn_name = ?, has_viewed = ? WHERE id = ?"
                )
                .bind(drawnName, 0, assignment.id)
                .run();

            updatedAssignments.push({
                ...assignment,
                drawn_name: drawnName,
                has_viewed: false,
                wishes: JSON.parse(assignment.wishes || "[]"),
            });
        }
    }

    // Mark room as drawn
    await env.secret_santa_db
        .prepare("UPDATE rooms SET is_drawn = ? WHERE id = ?")
        .bind(1, id)
        .run();

    return jsonResponse(updatedAssignments);
}

// Assignment handlers
async function listAssignments(env: Env, url: URL): Promise<Response> {
    const roomId = url.searchParams.get("room_id");
    const participantToken = url.searchParams.get("participant_token");
    const participantName = url.searchParams.get("participant_name");

    let query = "SELECT * FROM assignments";
    const params: any[] = [];
    const conditions: string[] = [];

    if (roomId) {
        conditions.push("room_id = ?");
        params.push(roomId);
    }
    if (participantToken) {
        conditions.push("participant_token = ?");
        params.push(participantToken);
    }
    if (participantName) {
        conditions.push("participant_name = ?");
        params.push(participantName);
    }

    if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(" AND ")}`;
    }

    const { results } = await env.secret_santa_db
        .prepare(query)
        .bind(...params)
        .all();

    // Parse JSON fields and fetch drawn participant's wishes if querying by participant_token
    const assignments = await Promise.all(
        results.map(async (row: any) => {
            const assignment = {
                ...row,
                wishes: JSON.parse(row.wishes || "[]"),
                has_viewed: Boolean(row.has_viewed),
            };

            // If querying by participant_token, include drawn participant's wishes
            if (participantToken && row.drawn_name) {
                const drawnQuery = await env.secret_santa_db
                    .prepare(
                        "SELECT wishes FROM assignments WHERE room_id = ? AND participant_name = ?"
                    )
                    .bind(row.room_id, row.drawn_name)
                    .first();

                if (drawnQuery) {
                    assignment.drawn_participant_wishes = JSON.parse(
                        (drawnQuery as any).wishes || "[]"
                    );
                } else {
                    assignment.drawn_participant_wishes = [];
                }
            }

            return assignment;
        })
    );

    return jsonResponse(assignments);
}

async function createAssignment(env: Env, request: Request): Promise<Response> {
    const data = await parseBody(request);

    const id = generateId();
    const participant_token = data.participant_token || generateToken();

    await env.secret_santa_db
        .prepare(
            `INSERT INTO assignments (id, room_id, participant_name, drawn_name, participant_token, wishes, has_viewed)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
            id,
            data.room_id,
            data.participant_name,
            data.drawn_name,
            participant_token,
            JSON.stringify(data.wishes || []),
            data.has_viewed ? 1 : 0
        )
        .run();

    return jsonResponse(
        {
            id,
            room_id: data.room_id,
            participant_name: data.participant_name,
            drawn_name: data.drawn_name,
            participant_token,
            wishes: data.wishes || [],
            has_viewed: data.has_viewed || false,
        },
        201
    );
}

async function bulkCreateAssignments(
    env: Env,
    request: Request
): Promise<Response> {
    const assignments = await parseBody(request);

    if (!Array.isArray(assignments)) {
        return jsonResponse({ error: "Expected array of assignments" }, 400);
    }

    const results = [];

    for (const data of assignments) {
        const id = generateId();
        const participant_token = data.participant_token || generateToken();

        await env.secret_santa_db
            .prepare(
                `INSERT INTO assignments (id, room_id, participant_name, drawn_name, participant_token, wishes, has_viewed)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
            )
            .bind(
                id,
                data.room_id,
                data.participant_name,
                data.drawn_name,
                participant_token,
                JSON.stringify(data.wishes || []),
                data.has_viewed ? 1 : 0
            )
            .run();

        results.push({
            id,
            room_id: data.room_id,
            participant_name: data.participant_name,
            drawn_name: data.drawn_name,
            participant_token,
            wishes: data.wishes || [],
            has_viewed: data.has_viewed || false,
        });
    }

    return jsonResponse(results, 201);
}

async function updateAssignment(
    env: Env,
    id: string,
    request: Request
): Promise<Response> {
    const data = await parseBody(request);

    const updates: string[] = [];
    const params: any[] = [];

    if (data.wishes !== undefined) {
        updates.push("wishes = ?");
        params.push(JSON.stringify(data.wishes));
    }
    if (data.has_viewed !== undefined) {
        updates.push("has_viewed = ?");
        params.push(data.has_viewed ? 1 : 0);
    }
    if (data.drawn_name !== undefined) {
        updates.push("drawn_name = ?");
        params.push(data.drawn_name);
    }

    if (updates.length === 0) {
        return jsonResponse({ error: "No valid fields to update" }, 400);
    }

    params.push(id);

    await env.secret_santa_db
        .prepare(`UPDATE assignments SET ${updates.join(", ")} WHERE id = ?`)
        .bind(...params)
        .run();

    const { results } = await env.secret_santa_db
        .prepare("SELECT * FROM assignments WHERE id = ?")
        .bind(id)
        .all();

    if (results.length === 0) {
        return jsonResponse({ error: "Assignment not found" }, 404);
    }

    const assignment = results[0] as any;
    return jsonResponse({
        ...assignment,
        wishes: JSON.parse(assignment.wishes || "[]"),
        has_viewed: Boolean(assignment.has_viewed),
    });
}

// Main handler
export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);

        // CORS preflight
        if (request.method === "OPTIONS") {
            return new Response(null, {
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods":
                        "GET, POST, PATCH, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
            });
        }

        try {
            // Room routes
            if (url.pathname === "/api/rooms") {
                if (request.method === "GET") {
                    return await listRooms(env, url);
                }
                if (request.method === "POST") {
                    return await createRoom(env, request);
                }
            }

            if (url.pathname.match(/^\/api\/rooms\/[^/]+$/)) {
                const id = url.pathname.split("/").pop()!;
                if (request.method === "PATCH") {
                    return await updateRoom(env, id, request);
                }
                if (request.method === "DELETE") {
                    return await deleteRoom(env, id);
                }
            }

            if (url.pathname.match(/^\/api\/rooms\/[^/]+\/reshuffle$/)) {
                const id = url.pathname.split("/")[3];
                if (request.method === "POST") {
                    return await reshuffleRoom(env, id);
                }
            }

            // Assignment routes
            if (url.pathname === "/api/assignments") {
                if (request.method === "GET") {
                    return await listAssignments(env, url);
                }
                if (request.method === "POST") {
                    return await createAssignment(env, request);
                }
            }

            if (url.pathname === "/api/assignments/bulk") {
                if (request.method === "POST") {
                    return await bulkCreateAssignments(env, request);
                }
            }

            if (url.pathname.match(/^\/api\/assignments\/[^/]+$/)) {
                const id = url.pathname.split("/").pop()!;
                if (request.method === "PATCH") {
                    return await updateAssignment(env, id, request);
                }
            }

            return jsonResponse({ error: "Not found" }, 404);
        } catch (error: any) {
            console.error("Worker error:", error);
            return jsonResponse(
                { error: error.message || "Internal server error" },
                500
            );
        }
    },
} satisfies ExportedHandler<Env>;
