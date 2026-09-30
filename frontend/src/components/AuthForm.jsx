import { Link } from "react-router-dom";

// Shared frame for the log in and create account pages.
export default function AuthForm({
    title,
    submitLabel,
    pendingLabel,
    pending,
    error,
    onSubmit,
    switchText,
    switchTo,
    switchLabel,
    children
}) {
    return (
        <section className="auth">
            <h1>{title}</h1>

            <form className="stack" onSubmit={onSubmit} noValidate>
                {children}

                {error && (
                    <p className="form-error" role="alert">
                        {error}
                    </p>
                )}

                <button type="submit" className="btn btn-primary btn-block" disabled={pending}>
                    {pending ? pendingLabel : submitLabel}
                </button>
            </form>

            <p className="auth-switch">
                {switchText} <Link to={switchTo}>{switchLabel}</Link>
            </p>
        </section>
    );
}
