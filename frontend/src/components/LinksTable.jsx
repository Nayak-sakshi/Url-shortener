import { Link } from "react-router-dom";

import { formatDate, formatNumber, isExpired } from "../utils/format";
import { displayUrl, getShortUrl } from "../utils/url";
import CopyButton from "./CopyButton";

export default function LinksTable({ links }) {
    return (
        <div className="table-wrap">
            <table className="links">
                <thead>
                    <tr>
                        <th scope="col">Short link</th>
                        <th scope="col" className="col-wide">Goes to</th>
                        <th scope="col" className="num">Clicks</th>
                        <th scope="col" className="col-wide">Created</th>
                        <th scope="col"><span className="sr-only">Actions</span></th>
                    </tr>
                </thead>
                <tbody>
                    {links.map((link) => {
                        const shortUrl = getShortUrl(link.shortCode);

                        return (
                            <tr key={link._id}>
                                <td>
                                    <Link
                                        to={`/dashboard/links/${link._id}`}
                                        className="links-short"
                                    >
                                        /{link.shortCode}
                                    </Link>
                                    {isExpired(link.expiresAt) && (
                                        <span className="tag tag-expired">Expired</span>
                                    )}
                                    <span className="links-dest-inline" title={link.originalUrl}>
                                        {displayUrl(link.originalUrl)}
                                    </span>
                                </td>
                                <td className="col-wide">
                                    <span className="links-dest" title={link.originalUrl}>
                                        {displayUrl(link.originalUrl)}
                                    </span>
                                </td>
                                <td className="num">{formatNumber(link.clicks)}</td>
                                <td className="col-wide nowrap">{formatDate(link.createdAt)}</td>
                                <td className="links-actions">
                                    <CopyButton text={shortUrl} className="btn btn-quiet" />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
