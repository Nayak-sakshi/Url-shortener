import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate("/");
        logout();
    };

    return (
        <div className="shell">
            <header className="topbar">
                <Link to="/" className="wordmark">
                    url shortener
                </Link>

                <nav className="topnav" aria-label="Main">
                    {user ? (
                        <>
                            <NavLink to="/dashboard" className="topnav-link">
                                Your links
                            </NavLink>
                            <span className="topnav-user">{user.name}</span>
                            <button
                                type="button"
                                className="btn btn-quiet"
                                onClick={handleLogout}
                            >
                                Log out
                            </button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login" className="topnav-link">
                                Log in
                            </NavLink>
                            <Link to="/register" className="btn btn-outline">
                                Create account
                            </Link>
                        </>
                    )}
                </nav>
            </header>

            <main className="page">
                <Outlet />
            </main>
        </div>
    );
}
