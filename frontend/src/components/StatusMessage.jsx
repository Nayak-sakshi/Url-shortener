// Loading, empty and error states share one shape.
export default function StatusMessage({ tone = "neutral", action, children }) {
    return (
        <div
            className={`status status-${tone}`}
            role={tone === "error" ? "alert" : "status"}
        >
            <p>{children}</p>
            {action}
        </div>
    );
}
