import { useState } from "react";
import { Navigate } from "react-router-dom";

import AuthForm from "../components/AuthForm";
import Field from "../components/Field";
import { useAuth } from "../context/AuthContext";
import { useSubmit } from "../hooks/useSubmit";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mirrors the backend rules so problems show before the request
const validate = ({ name, email, password }) => {
    if (name.length < 3 || name.length > 50) {
        return "Enter a name between 3 and 50 characters.";
    }

    if (!EMAIL_PATTERN.test(email)) {
        return "Enter a valid email address.";
    }

    if (password.length < 6 || password.length > 20) {
        return "Choose a password between 6 and 20 characters.";
    }

    return "";
};

export default function Register() {
    const { user, register } = useAuth();

    const [form, setForm] = useState({ name: "", email: "", password: "" });

    const { submit, pending, error, setError } = useSubmit(register);

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    const setField = (name) => (event) =>
        setForm((current) => ({ ...current, [name]: event.target.value }));

    const handleSubmit = async (event) => {
        event.preventDefault();

        const details = {
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password
        };

        const problem = validate(details);

        if (problem) {
            setError(problem);
            return;
        }

        await submit(details);
    };

    return (
        <AuthForm
            title="Create account"
            submitLabel="Create account"
            pendingLabel="Creating account…"
            pending={pending}
            error={error}
            onSubmit={handleSubmit}
            switchText="Already have an account?"
            switchTo="/login"
            switchLabel="Log in"
        >
            <Field
                label="Name"
                autoComplete="name"
                value={form.name}
                onChange={setField("name")}
            />
            <Field
                label="Email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={setField("email")}
            />
            <Field
                label="Password"
                hint="6 to 20 characters."
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={setField("password")}
            />
        </AuthForm>
    );
}
