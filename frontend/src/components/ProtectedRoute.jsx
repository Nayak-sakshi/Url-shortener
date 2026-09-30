import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import StatusMessage from "./StatusMessage";

export default function ProtectedRoute() {
    const { user, ready } = useAuth();
    const location = useLocation();

    if (!ready) {
        return <StatusMessage>Loading your account…</StatusMessage>;
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return <Outlet />;
}
