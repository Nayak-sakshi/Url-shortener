import { Link, useNavigate, useParams } from "react-router-dom";

import { getUrlAnalytics } from "../api/analytics.api";
import { getUrl } from "../api/url.api";
import ClicksChart from "../components/ClicksChart";
import CopyButton from "../components/CopyButton";
import DeleteLink from "../components/DeleteLink";
import EditLinkForm from "../components/EditLinkForm";
import StatStrip from "../components/StatStrip";
import StatusMessage from "../components/StatusMessage";
import { useAsync } from "../hooks/useAsync";
import { formatDate, formatDateTime, isExpired } from "../utils/format";
import { displayUrl, getShortUrl } from "../utils/url";

const loadLink = async (id) => {
    const [link, stats] = await Promise.all([getUrl(id), getUrlAnalytics(id)]);

    return { link, analytics: stats.analytics };
};

export default function LinkDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data, error, loading, reload } = useAsync(() => loadLink(id), [id]);

    const backLink = (
        <Link to="/dashboard" className="back">
            All links
        </Link>
    );

    if (loading && !data) {
        return <StatusMessage>Loading link…</StatusMessage>;
    }

    if (error) {
        return (
            <>
                {backLink}
                <StatusMessage tone="error">{error.message}</StatusMessage>
            </>
        );
    }

    const { link, analytics } = data;
    const shortUrl = getShortUrl(link.shortCode);
    const expired = isExpired(link.expiresAt);

    return (
        <div className="detail">
            {backLink}

            <header className="detail-head">
                <div className="result-row">
                    <h1>
                        <a href={shortUrl} target="_blank" rel="noreferrer">
                            {displayUrl(shortUrl)}
                        </a>
                    </h1>
                    <CopyButton text={shortUrl} />
                </div>

                <p className="detail-meta">
                    Created {formatDate(link.createdAt)}.{" "}
                    {link.expiresAt &&
                        (expired
                            ? `Expired ${formatDateTime(link.expiresAt)}.`
                            : `Stops working on ${formatDateTime(link.expiresAt)}.`)}
                </p>
            </header>

            <div className="detail-grid">
                <section className="panel" aria-labelledby="clicks-title">
                    <h2 id="clicks-title">Clicks</h2>

                    <StatStrip
                        items={[
                            { label: "All time", value: analytics.totalClicks, tone: "clicks" },
                            { label: "Today", value: analytics.todayClicks, tone: "clicks" }
                        ]}
                    />

                    <ClicksChart rows={analytics.last7Days} />

                    <p className="footnote">Click counts can take a minute to update.</p>
                </section>

                <div className="detail-side">
                    <section className="panel" aria-labelledby="edit-title">
                        <h2 id="edit-title">Edit link</h2>
                        <EditLinkForm link={link} onSaved={reload} />
                    </section>

                    <section className="panel" aria-labelledby="delete-title">
                        <h2 id="delete-title">Delete link</h2>
                        <DeleteLink linkId={link._id} onDeleted={() => navigate("/dashboard")} />
                    </section>
                </div>
            </div>
        </div>
    );
}
