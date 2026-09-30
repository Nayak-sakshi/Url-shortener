export default function Pagination({ pagination, onChange }) {
    const { page, totalPages, total, hasNextPage, hasPreviousPage } = pagination;

    if (totalPages <= 1) {
        return null;
    }

    return (
        <nav className="pagination" aria-label="Pages of links">
            <button
                type="button"
                className="btn btn-outline"
                disabled={!hasPreviousPage}
                onClick={() => onChange(page - 1)}
            >
                Previous
            </button>
            <p>
                Page {page} of {totalPages}, {total} links
            </p>
            <button
                type="button"
                className="btn btn-outline"
                disabled={!hasNextPage}
                onClick={() => onChange(page + 1)}
            >
                Next
            </button>
        </nav>
    );
}
