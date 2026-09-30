import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

import AuthForm from "../components/AuthForm";
import Field from "../components/Field";
import { useAuth } from "../context/AuthContext";
import { useSubmit } from "../hooks/useSubmit";

export default function Login() {
    const { user, login } = useAuth();
    const location = useLocation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const { submit, pending, error, setError } = useSubmit(login);

    const destination = location.state?.from || "/dashboard";

    if (user) {
        return <Navigate to={destination} replace />;
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!email.trim() || !password) {
            setError("Enter your email and password.");
            return;
        }

        await submit({ email: email.trim(), password });
    };

    return (
        <AuthForm
            title="Log in"
            submitLabel="Log in"
            pendingLabel="Logging in…"
            pending={pending}
            error={error}
            onSubmit={handleSubmit}
            switchText="New here?"
            switchTo="/register"
            switchLabel="Create an account"
        >
            <Field
                label="Email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
            />
            <Field
                label="Password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
            />
        </AuthForm>
    );
}
