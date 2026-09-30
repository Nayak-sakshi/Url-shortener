import { formatNumber } from "../utils/format";

export default function StatStrip({ items }) {
    return (
        <dl className="stats">
            {items.map(({ label, value, tone }) => (
                <div key={label} className={`stat${tone ? ` stat-${tone}` : ""}`}>
                    <dt>{label}</dt>
                    <dd>{formatNumber(value)}</dd>
                </div>
            ))}
        </dl>
    );
}
