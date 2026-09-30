const dateFormatter = new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric"
});

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
});

const numberFormatter = new Intl.NumberFormat();

export const formatDate = (value) =>
    value ? dateFormatter.format(new Date(value)) : "";

export const formatDateTime = (value) =>
    value ? dateTimeFormatter.format(new Date(value)) : "";

export const formatNumber = (value) => numberFormatter.format(value ?? 0);

export const isExpired = (expiresAt) =>
    Boolean(expiresAt) && new Date(expiresAt) <= new Date();

// ISO date -> value for <input type="datetime-local"> in local time
export const toDateTimeInput = (value) => {
    if (!value) {
        return "";
    }

    const date = new Date(value);
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);

    return local.toISOString().slice(0, 16);
};

// <input type="datetime-local"> value -> ISO string (or null when empty)
export const fromDateTimeInput = (value) =>
    value ? new Date(value).toISOString() : null;
