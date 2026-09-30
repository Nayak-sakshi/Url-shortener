import { useCallback, useState } from "react";

// Wraps a form action with pending + error state.
export function useSubmit(action) {
    const [pending, setPending] = useState(false);
    const [error, setError] = useState("");

    const submit = useCallback(
        async (...args) => {
            setPending(true);
            setError("");

            try {
                return await action(...args);
            } catch (err) {
                setError(err.message);
                return undefined;
            } finally {
                setPending(false);
            }
        },
        [action]
    );

    return { submit, pending, error, setError };
}
