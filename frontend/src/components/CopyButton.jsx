import { useEffect, useState } from "react";

export default function CopyButton({ text, className = "btn btn-outline" }) {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) {
            return undefined;
        }

        const timer = setTimeout(() => setCopied(false), 1600);

        return () => clearTimeout(timer);
    }, [copied]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
        } catch {
            window.prompt("Copy this link", text);
        }
    };

    return (
        <button type="button" className={className} onClick={handleCopy}>
            <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
        </button>
    );
}
