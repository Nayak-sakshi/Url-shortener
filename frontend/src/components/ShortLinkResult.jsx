import { formatDateTime } from "../utils/format";
import { displayUrl, getShortUrl } from "../utils/url";
import CopyButton from "./CopyButton";

export default function ShortLinkResult({ link, children }) {
    const shortUrl = getShortUrl(link.shortCode);

    return (
        <section className="result" aria-live="polite" aria-label="Your short link">
            <p className="result-from" title={link.originalUrl}>
                {displayUrl(link.originalUrl)}
            </p>

            <div className="result-row">
                <a className="result-link" href={shortUrl} target="_blank" rel="noreferrer">
                    {displayUrl(shortUrl)}
                </a>
                <CopyButton text={shortUrl} className="btn btn-primary" />
            </div>

            {link.expiresAt && (
                <p className="result-note">
                    Stops working on {formatDateTime(link.expiresAt)}.
                </p>
            )}

            {children}
        </section>
    );
}
