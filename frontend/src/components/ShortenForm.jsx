import { useCallback, useState } from "react";

import { createShortUrl } from "../api/url.api";
import { useSubmit } from "../hooks/useSubmit";
import { fromDateTimeInput, toDateTimeInput } from "../utils/format";
import { ALIAS_PATTERN, isValidHttpUrl, normalizeUrl } from "../utils/url";
import Field from "./Field";

const EMPTY_FORM = { originalUrl: "", customAlias: "", expiresAt: "" };

const validate = ({ originalUrl, customAlias, expiresAt }) => {
    if (!isValidHttpUrl(originalUrl)) {
        return "Enter a full web address, like https://example.com/page.";
    }

    if (customAlias && !ALIAS_PATTERN.test(customAlias)) {
        return "A custom ending needs 3–30 letters, numbers, dashes or underscores.";
    }

    if (expiresAt && new Date(expiresAt) <= new Date()) {
        return "Pick an expiry time in the future.";
    }

    return "";
};

export default function ShortenForm({ onCreated, size = "regular" }) {
    const [form, setForm] = useState(EMPTY_FORM);

    const create = useCallback(async (values) => {
        const payload = { originalUrl: values.originalUrl };

        if (values.customAlias) {
            payload.customAlias = values.customAlias;
        }

        if (values.expiresAt) {
            payload.expiresAt = fromDateTimeInput(values.expiresAt);
        }

        return createShortUrl(payload);
    }, []);

    const { submit, pending, error, setError } = useSubmit(create);

    const setField = (name) => (event) =>
        setForm((current) => ({ ...current, [name]: event.target.value }));

    const handleSubmit = async (event) => {
        event.preventDefault();

        const values = {
            ...form,
            originalUrl: normalizeUrl(form.originalUrl),
            customAlias: form.customAlias.trim()
        };

        const problem = validate(values);

        if (problem) {
            setError(problem);
            return;
        }

        const created = await submit(values);

        if (created) {
            setForm(EMPTY_FORM);
            onCreated?.(created);
        }
    };

    return (
        <form className={`shorten shorten-${size}`} onSubmit={handleSubmit} noValidate>
            <div className="shorten-bar">
                <label htmlFor="long-url" className="sr-only">
                    Long link
                </label>
                <input
                    id="long-url"
                    type="url"
                    inputMode="url"
                    autoComplete="off"
                    spellCheck="false"
                    placeholder="Paste a long link"
                    value={form.originalUrl}
                    onChange={setField("originalUrl")}
                />
                <button type="submit" className="btn btn-primary" disabled={pending}>
                    {pending ? "Shortening…" : "Shorten link"}
                </button>
            </div>

            {error && (
                <p className="form-error" role="alert">
                    {error}
                </p>
            )}

            <details className="shorten-options">
                <summary>Choose the ending or set an expiry</summary>

                <div className="shorten-options-grid">
                    <Field
                        label="Custom ending"
                        hint="Optional. Saved in lowercase."
                        prefix={`${window.location.host}/`}
                        placeholder="summer-sale"
                        autoComplete="off"
                        spellCheck="false"
                        maxLength={30}
                        value={form.customAlias}
                        onChange={setField("customAlias")}
                    />
                    <Field
                        label="Stops working on"
                        hint="Optional. Leave empty to keep it forever."
                        type="datetime-local"
                        min={toDateTimeInput(new Date())}
                        value={form.expiresAt}
                        onChange={setField("expiresAt")}
                    />
                </div>
            </details>
        </form>
    );
}
