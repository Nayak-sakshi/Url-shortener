import { useState } from "react";

import { formatNumber } from "../utils/format";

const DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

const weekdayFormatter = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    timeZone: "UTC"
});

const fullDateFormatter = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC"
});

// The API only returns days that had clicks (grouped by UTC date),
// so fill the gaps to always show a full week.
const buildWeek = (rows) => {
    const clicksByDate = new Map(rows.map((row) => [row.date, row.clicks]));

    return Array.from({ length: DAYS }, (_, index) => {
        const date = new Date(Date.now() - (DAYS - 1 - index) * DAY_MS);
        const key = date.toISOString().slice(0, 10);
        const utcDate = new Date(`${key}T00:00:00Z`);

        return {
            key,
            clicks: clicksByDate.get(key) ?? 0,
            weekday: weekdayFormatter.format(utcDate),
            fullDate: fullDateFormatter.format(utcDate)
        };
    });
};

// Round the axis up to a clean number: 4, 10, 20, 50, 100…
const niceMax = (value) => {
    if (value <= 4) {
        return 4;
    }

    const magnitude = 10 ** Math.floor(Math.log10(value));
    const step = [1, 2, 5, 10].find((factor) => factor * magnitude >= value);

    return step * magnitude;
};

export default function ClicksChart({ rows }) {
    const [activeKey, setActiveKey] = useState(null);

    const week = buildWeek(rows);
    const peak = Math.max(...week.map((day) => day.clicks));
    const axisMax = niceMax(peak);
    const ticks = [axisMax, axisMax / 2, 0];
    const peakKey = peak > 0 ? week.find((day) => day.clicks === peak).key : null;

    return (
        <figure className="chart">
            <figcaption>Clicks per day, last 7 days</figcaption>

            <div className="chart-body">
                <div className="chart-axis" aria-hidden="true">
                    {ticks.map((tick) => (
                        <span key={tick}>{formatNumber(tick)}</span>
                    ))}
                </div>

                <div className="chart-plot" onMouseLeave={() => setActiveKey(null)}>
                    <div className="chart-grid" aria-hidden="true">
                        {ticks.map((tick) => (
                            <span key={tick} />
                        ))}
                    </div>

                    {week.map((day) => {
                        const active = activeKey === day.key;
                        const height = (day.clicks / axisMax) * 100;

                        return (
                            <button
                                key={day.key}
                                type="button"
                                className={`chart-col${active ? " is-active" : ""}`}
                                aria-label={`${day.fullDate}: ${formatNumber(day.clicks)} clicks`}
                                onMouseEnter={() => setActiveKey(day.key)}
                                onFocus={() => setActiveKey(day.key)}
                                onBlur={() => setActiveKey(null)}
                            >
                                <span className="chart-track">
                                    <span className="chart-bar" style={{ height: `${height}%` }}>
                                        {(active || day.key === peakKey) && (
                                            <span className={`chart-value${active ? " is-tip" : ""}`}>
                                                {active ? (
                                                    <>
                                                        <strong>{formatNumber(day.clicks)}</strong>{" "}
                                                        {day.clicks === 1 ? "click" : "clicks"}
                                                    </>
                                                ) : (
                                                    formatNumber(day.clicks)
                                                )}
                                            </span>
                                        )}
                                    </span>
                                </span>
                                <span className="chart-day">{day.weekday}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <details className="chart-table">
                <summary>Show as a table</summary>
                <table>
                    <thead>
                        <tr>
                            <th scope="col">Day</th>
                            <th scope="col" className="num">Clicks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {week.map((day) => (
                            <tr key={day.key}>
                                <td>{day.fullDate}</td>
                                <td className="num">{formatNumber(day.clicks)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </details>
        </figure>
    );
}
