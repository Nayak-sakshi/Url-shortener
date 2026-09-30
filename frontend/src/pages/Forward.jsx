import { useEffect } from "react";
import { useParams } from "react-router-dom";

import { API_BASE } from "../api/client";

// A short link opened on this site: hand it to the API, which counts the
// click and redirects to the destination.
export default function Forward() {
    const { shortCode } = useParams();

    useEffect(() => {
        window.location.replace(`${API_BASE}/urls/${encodeURIComponent(shortCode)}`);
    }, [shortCode]);

    return <p className="forward">Opening link…</p>;
}
