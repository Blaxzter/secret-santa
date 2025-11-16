import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import RoomAdmin from "./pages/RoomAdmin";
import Participant from "./pages/Participant";
import "./App.css";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/room" element={<RoomAdmin />} />
                    <Route path="/participant" element={<Participant />} />
                </Routes>
            </Router>
        </QueryClientProvider>
    );
}

export default App;
