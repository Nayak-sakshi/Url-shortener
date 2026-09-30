import { useCallback, useState } from "react";

import { updateUrl } from "../api/url.api";
import { useSubmit } from "../hooks/useSubmit";
import { fromDateTimeInput, toDateTimeInput } from "../utils/format";
import { isValidHttpUrl, normalizeUrl } from "../utils/url";
import Field from "./Field";

export default function EditLinkForm({ link, onSaved }) {
    const [originalUrl, setOriginalUrl] = useState(link.originalUrl);
    const [expiresAt, setExpiresAt] = useState(toDateTimeInput(link.expiresAt));
    const [saved, setSaved] = useState(false);

    const save = useCallback((data) => updateUrl(link._id, data), [link._id]);

    const { submit, pending, error, setError } = useSubmit(save);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaved(false);

        const destination = normalizeUrl(originalUrl);

        if (!isValidHttpUrl(destination)) {
            setError("Enter a full web address, like https://example.com/page.");
            return;
        }

        const updated = await submit({
            originalUrl: destination,
            expiresAt: fromDateTimeInput(expiresAt)
        });

        if (updated) {
            setOriginalUrl(updated.originalUrl);
            setSaved(true);
            onSaved?.(updated);
        }
    };

    return (
        <form className="stack" onSubmit={handleSubmit} noValidate>
            <Field
                label="Goes to"
                type="url"
                inputMode="url"
                spellCheck="false"
                value={originalUrl}
                onChange={(event) => setOriginalUrl(event.target.value)}
            />
            <Field
                label="Stops working on"
                hint="Leave empty to keep it forever."
                type="datetime-local"
                value={expiresAt}
                onChange={(event) => setExpiresAt(event.target.value)}
            />

            {error && (
                <p className="form-error" role="alert">
                    {error}
                </p>
            )}

            <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={pending}>
                    {pending ? "Saving…" : "Save changes"}
                </button>
                {saved && <span className="form-saved" role="status">Changes saved</span>}
            </div>
        </form>
    );
}
