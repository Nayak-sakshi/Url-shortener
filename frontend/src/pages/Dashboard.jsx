import { useState } from "react";

import { getDashboard } from "../api/dashboard.api";
import { getMyUrls } from "../api/url.api";
import LinksTable from "../components/LinksTable";
import Pagination from "../components/Pagination";
import ShortenForm from "../components/ShortenForm";
import ShortLinkResult from "../components/ShortLinkResult";
import StatStrip from "../components/StatStrip";
import StatusMessage from "../components/StatusMessage";
import { useAsync } from "../hooks/useAsync";

const PAGE_SIZE = 10;

const buildStats = (stats) => [
    { label: "Working links", value: stats.activeUrls - stats.expiredUrls },
    { label: "Expired", value: stats.expiredUrls },
    { label: "Deleted", value: stats.deletedUrls },
    { label: "Clicks recorded", value: stats.totalClicks, tone: "clicks" }
];

export default function Dashboard() {
    const [page, setPage] = useState(1);
    const [created, setCreated] = useState(null);

    const stats = useAsync(getDashboard);
    const links = useAsync(() => getMyUrls({ page, limit: PAGE_SIZE }), [page]);

    const handleCreated = (link) => {
        setCreated(link);
        stats.reload();

        if (page === 1) {
            links.reload();
        } else {
            setPage(1);
        }
    };

    const retry = (
        <button type="button" className="btn btn-outline" onClick={links.reload}>
            Try again
        </button>
    );

    return (
        <div className="dashboard">
            <h1>Your links</h1>

            <ShortenForm onCreated={handleCreated} />

            {created && <ShortLinkResult link={created} />}

            {stats.data && <StatStrip items={buildStats(stats.data)} />}

            <section aria-label="Links">
                {links.error && (
                    <StatusMessage tone="error" action={retry}>
                        {links.error.message}
                    </StatusMessage>
                )}

                {links.loading && !links.data && (
                    <StatusMessage>Loading your links…</StatusMessage>
                )}

                {links.data && links.data.urls.length === 0 && (
                    <StatusMessage>
                        No links yet. Paste a long link above to make your first one.
                    </StatusMessage>
                )}

                {links.data && links.data.urls.length > 0 && (
                    <>
                        <LinksTable links={links.data.urls} />
                        <Pagination pagination={links.data.pagination} onChange={setPage} />
                        <p className="footnote">
                            Click counts can take a minute to update.
                        </p>
                    </>
                )}
            </section>
        </div>
    );
}
