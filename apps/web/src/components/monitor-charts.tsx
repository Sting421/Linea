'use client';
import Link from 'next/link';
import type { CheckIn } from '@/lib/types';
import { dailyActivity, formatDate, monthMetrics } from '@/lib/semantics';
import { MetricHelp, Panel, Tooltip } from './ui';

type ReportRow = { label: string; value: number; color: string };

function ReportTable({ title, total, rows }: { title: string; total: number; rows: ReportRow[] }) {
  return (
    <table className="data-table report-table">
      <caption className="sr-only">
        {title}, {total} records
      </caption>
      <thead>
        <tr>
          <th scope="col">Report</th>
          <th scope="col" className="numeric">
            Count
          </th>
          <th scope="col" className="numeric">
            Share
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <th scope="row">
              <span className="report-label">
                <i style={{ background: row.color }} />
                {row.label}
              </span>
            </th>
            <td className="numeric">{row.value}</td>
            <td className="numeric secondary-text">
              {total ? `${Math.round((row.value / total) * 100)}%` : '—'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function MonitoringCharts({
  calls,
  month,
  today,
  medicine,
}: {
  calls: CheckIn[];
  month: string;
  today: string;
  medicine: string;
}) {
  const records = calls.filter((call) => call.local_date.startsWith(`${month}-`));
  const metrics = monthMetrics(records);
  const series = dailyActivity(records, month, today);
  const maximum = Math.max(2, 2 * Math.ceil(Math.max(0, ...series.map((day) => day.total)) / 2));
  const outcomes: ReportRow[] = [
    { label: 'Completed normally', value: metrics.outcomes.green, color: 'var(--status-green)' },
    { label: 'Needs a look', value: metrics.outcomes.yellow, color: 'var(--status-yellow)' },
    { label: 'Family attention', value: metrics.outcomes.red, color: 'var(--status-red)' },
  ];
  const medicineRows: ReportRow[] = [
    { label: 'Reported taken', value: metrics.medicine.taken, color: 'var(--purple-light)' },
    { label: 'Reported not taken', value: metrics.medicine.not_taken, color: 'var(--yellow)' },
    { label: 'Unknown', value: metrics.medicine.unknown, color: 'var(--text-muted)' },
  ];
  const days = Object.keys(metrics.days).length;
  let cumulative = 0;
  return (
    <div className="dashboard-charts">
      <Panel className="activity-panel">
        <div className="panel-heading">
          <div>
            <h2>Check-in activity</h2>
            <p>Daily recorded check-ins</p>
          </div>
          <MetricHelp label="How to read this chart">
            <p>
              Each bar counts logical check-ins, with completed, in-progress, and incomplete records
              shown separately. Reconnects and retries stay within their check-in. A missing day has
              no record; it is not a failed call.
            </p>
          </MetricHelp>
        </div>
        <div className="chart-key">
          <span>
            <i style={{ background: 'var(--purple-light)' }} />
            Completed
          </span>
          <span>
            <i style={{ background: 'var(--purple-mid)' }} />
            In progress
          </span>
          <span>
            <i style={{ background: 'var(--yellow)' }} />
            Incomplete
          </span>
          <span>
            <i className="no-record-key" />
            No record
          </span>
        </div>
        <div className="activity-chart" role="group" aria-label="Daily check-in activity">
          <div className="chart-axis" aria-hidden="true">
            <span>{maximum}</span>
            <span>{maximum / 2}</span>
            <span>0</span>
          </div>
          <div className="activity-viewport">
            <div
              className="activity-plot"
              style={{ gridTemplateColumns: `repeat(${series.length}, minmax(16px, 1fr))` }}
            >
              {series.map((day) => {
                const description = day.total
                  ? `${day.completed} completed, ${day.inProgress} in progress, ${day.incomplete} incomplete`
                  : day.upcoming
                    ? 'Upcoming'
                    : 'No check-in recorded';
                return (
                  <Tooltip
                    key={day.date}
                    className={`activity-day${day.upcoming && !day.total ? ' upcoming' : ''}`}
                    trigger={(id) => (
                      <Link
                        href={`/day/${day.date}`}
                        className="activity-hit"
                        aria-label={`${formatDate(day.date)}: ${description}`}
                        aria-describedby={id}
                      >
                        <span className="activity-bar-area" aria-hidden="true">
                          {day.total ? (
                            <span
                              className="activity-stack"
                              style={{ height: `${(day.total / maximum) * 100}%` }}
                            >
                              {day.incomplete > 0 && (
                                <span className="bar-incomplete" style={{ flex: day.incomplete }} />
                              )}
                              {day.completed > 0 && (
                                <span className="bar-completed" style={{ flex: day.completed }} />
                              )}
                              {day.inProgress > 0 && (
                                <span
                                  className="bar-in-progress"
                                  style={{ flex: day.inProgress }}
                                />
                              )}
                            </span>
                          ) : (
                            <span className="activity-no-record" />
                          )}
                        </span>
                        <span className="activity-tick" aria-hidden="true">
                          {day.day === 1 || day.day % 5 === 0 || day.day === series.length
                            ? day.day
                            : '\u00a0'}
                        </span>
                      </Link>
                    )}
                  >
                    <strong>{formatDate(day.date)}</strong>
                    <p>{description}</p>
                    {day.total > 0 && (
                      <p>
                        {day.total} recorded check-in{day.total === 1 ? '' : 's'}
                      </p>
                    )}
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </div>
        {!records.length && <p className="chart-empty">No check-ins recorded this month.</p>}
      </Panel>
      <div className="report-chart-grid">
        <Panel className="report-panel">
          <div className="panel-heading">
            <h2>Recorded day outcomes</h2>
            <span className="badge status-neutral">
              {days} Recorded {days === 1 ? 'Day' : 'Days'}
            </span>
          </div>
          <div className="outcome-ring">
            <svg
              viewBox="0 0 180 180"
              role="img"
              aria-label={
                days
                  ? outcomes
                      .map((row) => `${row.label}: ${row.value} of ${days} recorded days`)
                      .join('; ')
                  : 'No recorded day outcomes'
              }
            >
              <circle className="ring-track" cx="90" cy="90" r="68" fill="none" strokeWidth="18" />
              {outcomes
                .filter((row) => row.value > 0)
                .map((row) => {
                  const start = cumulative;
                  const share = (row.value / days) * 100;
                  cumulative += share;
                  return (
                    <circle
                      key={row.label}
                      cx="90"
                      cy="90"
                      r="68"
                      fill="none"
                      stroke={row.color}
                      strokeWidth="18"
                      pathLength="100"
                      strokeDasharray={`${share} ${100 - share}`}
                      strokeDashoffset={-start}
                      transform="rotate(-90 90 90)"
                    >
                      <title>{`${row.label}: ${row.value} of ${days} recorded days`}</title>
                    </circle>
                  );
                })}
            </svg>
            <div className="ring-value" aria-hidden="true">
              <strong>{days}</strong>
              <span>Recorded days</span>
            </div>
          </div>
          <ReportTable title="Recorded day outcomes" total={days} rows={outcomes} />
          <MetricHelp label="Day outcomes">
            <p>
              The highest recorded outcome determines each day: Priority before Attention before
              Completed. Handling an alert does not change its day outcome. Colors do not establish
              medical safety.
            </p>
          </MetricHelp>
        </Panel>
        <Panel className="report-panel medicine-chart">
          <div className="panel-heading">
            <div>
              <h2>Medicine reports</h2>
              <p>{medicine}</p>
            </div>
            <span className="badge status-neutral">
              {metrics.dosePeriods} Dose {metrics.dosePeriods === 1 ? 'Report' : 'Reports'}
            </span>
          </div>
          <div
            className="medicine-bars"
            role="img"
            aria-label={
              metrics.dosePeriods
                ? medicineRows
                    .map((row) => `${row.label}: ${row.value} of ${metrics.dosePeriods}`)
                    .join('; ')
                : 'No medicine reports'
            }
          >
            {medicineRows.map((row) => (
              <div className="medicine-bar-row" key={row.label}>
                <div>
                  <span>{row.label}</span>
                  <strong>{row.value}</strong>
                </div>
                <div className="medicine-bar-track">
                  <span
                    style={{
                      width: `${metrics.dosePeriods ? (row.value / metrics.dosePeriods) * 100 : 0}%`,
                      background: row.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <ReportTable
            title={`${medicine} reports`}
            total={metrics.dosePeriods}
            rows={medicineRows}
          />
          <MetricHelp label="Dose reports">
            <p>
              The latest report per local day counts once. Missing days are not missed doses.
              Unknown reports remain separate from not taken. These are reported doses, not verified
              doses.
            </p>
          </MetricHelp>
        </Panel>
      </div>
    </div>
  );
}
