import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import * as authApi from "../api/auth.api";
import { AUTH_EXPIRED_EVENT } from "../api/client";
import { clearToken, getToken, setToken } from "../utils/storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [ready, setReady] = useState(() => !getToken());

    // Restore the session from a saved token
    useEffect(() => {
        if (!getToken()) {
            return;
        }

        authApi
            .getProfile()
            .then(setUser)
            .catch(() => clearToken())
            .finally(() => setReady(true));
    }, []);

    useEffect(() => {
        const handleExpired = () => setUser(null);

        window.addEventListener(AUTH_EXPIRED_EVENT, handleExpired);

        return () =>
            window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpired);
    }, []);

    const startSession = useCallback((result) => {
        setToken(result.token);
        setUser(result.user);
    }, []);

    const login = useCallback(
        async (credentials) => startSession(await authApi.login(credentials)),
        [startSession]
    );

    const register = useCallback(
        async (details) => startSession(await authApi.register(details)),
        [startSession]
    );

    const logout = useCallback(() => {
        clearToken();
        setUser(null);
    }, []);

    const value = useMemo(
        () => ({ user, ready, login, register, logout }),
        [user, ready, login, register, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
