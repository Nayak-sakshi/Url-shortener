import { Route, Routes } from "react-router-dom";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Forward from "./pages/Forward";
import Home from "./pages/Home";
import LinkDetail from "./pages/LinkDetail";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";

// Page paths match the aliases the backend reserves (login, register,
// dashboard), so a short code can never collide with a page.
export default function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />

                <Route element={<ProtectedRoute />}>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="dashboard/links/:id" element={<LinkDetail />} />
                </Route>

                <Route path="*" element={<NotFound />} />
            </Route>

            <Route path=":shortCode" element={<Forward />} />
        </Routes>
    );
}
