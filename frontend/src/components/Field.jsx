import { useId } from "react";

export default function Field({ label, hint, error, prefix, ...inputProps }) {
    const id = useId();
    const hintId = `${id}-hint`;

    return (
        <div className={`field${error ? " has-error" : ""}`}>
            <label htmlFor={id}>{label}</label>

            <div className="field-control">
                {prefix && <span className="field-prefix">{prefix}</span>}
                <input
                    id={id}
                    aria-describedby={hint || error ? hintId : undefined}
                    aria-invalid={error ? true : undefined}
                    {...inputProps}
                />
            </div>

            {(error || hint) && (
                <p id={hintId} className="field-hint">
                    {error || hint}
                </p>
            )}
        </div>
    );
}
