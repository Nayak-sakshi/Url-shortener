export const ALIAS_PATTERN = /^[a-zA-Z0-9-_]{3,30}$/;

// Short links live on this site: /<code> forwards to the API redirect.
export const getShortUrl = (shortCode) =>
    `${window.location.origin}/${shortCode}`;

// "example.com/page" -> "https://example.com/page"
export const normalizeUrl = (value) => {
    const trimmed = value.trim();

    if (!trimmed) {
        return "";
    }

    return /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
        ? trimmed
        : `https://${trimmed}`;
};

export const isValidHttpUrl = (value) => {
    try {
        const { protocol, hostname } = new URL(value);

        return (
            (protocol === "http:" || protocol === "https:") &&
            hostname.includes(".")
        );
    } catch {
        return false;
    }
};

// Drops the protocol so the part people read comes first
export const displayUrl = (value) =>
    value.replace(/^https?:\/\//i, "").replace(/\/$/, "");
