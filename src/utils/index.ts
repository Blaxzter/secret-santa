export function createPageUrl(pageName: string): string {
    // Convert page name to URL path
    const routes: Record<string, string> = {
        Home: "/",
        AdminDashboard: "/admin",
        RoomAdmin: "/room",
        Participant: "/participant",
    };
    return routes[pageName] || "/";
}
