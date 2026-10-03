import type { ReactNode } from 'react';
import { Panel } from './ui';

export function Skeleton({
  shape = 'line',
  width = 'full',
}: {
  shape?: 'line' | 'title' | 'value' | 'control' | 'avatar' | 'plot' | 'ring' | 'day';
  width?: 'short' | 'medium' | 'long' | 'full';
}) {
  return (
    <span className={`skeleton skeleton-${shape} skeleton-width-${width}`} aria-hidden="true" />
  );
}

function Lines() {
  return (
    <div className="skeleton-lines">
      <Skeleton width="long" />
      <Skeleton width="medium" />
    </div>
  );
}

function LoadingState({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="loading-state" role="status">
      <span className="sr-only">{label}</span>
      <div className="skeleton-content" aria-hidden="true" aria-busy="true">
        {children}
      </div>
    </div>
  );
}

function IdentitySkeleton() {
  return (
    <div className="connection-profile">
      <Skeleton shape="avatar" />
      <div className="skeleton-identity">
        <Skeleton shape="title" width="medium" />
        <Skeleton width="long" />
      </div>
    </div>
  );
}

function MonitoringSkeleton() {
  return (
    <>
      <Panel className="connection-card">
        <IdentitySkeleton />
        <div className="connection-schedule skeleton-lines">
          <Skeleton width="medium" />
          <Skeleton shape="value" width="short" />
          <Skeleton width="long" />
        </div>
        <div className="connection-action">
          <Skeleton shape="control" />
          <Skeleton width="medium" />
        </div>
      </Panel>
      <div className="month-navigation dashboard-range skeleton-range">
        <Skeleton shape="title" width="short" />
        <Skeleton shape="control" width="short" />
      </div>
      <div className="stat-grid">
        {Array.from({ length: 3 }, (_, i) => (
          <Panel className="stat-card" key={i}>
            <Skeleton width="long" />
            <div className="stat-value">
              <Skeleton shape="value" width="short" />
            </div>
            <Skeleton width="medium" />
          </Panel>
        ))}
      </div>
      <div className="dashboard-charts">
        <Panel>
          <div className="panel-heading">
            <Skeleton shape="title" width="short" />
          </div>
          <div className="chart-key">
            <Skeleton width="medium" />
          </div>
          <Skeleton shape="plot" />
          <div className="skeleton-chart-footer">
            <Skeleton width="long" />
          </div>
        </Panel>
        <div className="report-chart-grid">
          {['outcomes', 'medicine'].map((chart) => (
            <Panel className="report-panel" key={chart}>
              <div className="panel-heading">
                <Skeleton shape="title" width="medium" />
              </div>
              {chart === 'outcomes' ? (
                <Skeleton shape="ring" />
              ) : (
                <div className="skeleton-report-bars">
                  <Skeleton />
                  <Skeleton />
                  <Skeleton />
                </div>
              )}
              <ConfigurationRows />
            </Panel>
          ))}
        </div>
      </div>
      <div className="monitor-grid">
        <Panel className="calendar-panel">
          <div className="panel-heading">
            <Skeleton shape="title" width="medium" />
          </div>
          <div className="calendar skeleton-calendar">
            {Array.from({ length: 7 }, (_, i) => (
              <Skeleton width="short" key={`weekday-${i}`} />
            ))}
            {Array.from({ length: 35 }, (_, i) => (
              <Skeleton shape="day" key={i} />
            ))}
          </div>
        </Panel>
        <Panel>
          <div className="panel-heading">
            <Skeleton shape="title" width="medium" />
          </div>
          <ConfigurationRows />
        </Panel>
      </div>
    </>
  );
}

function AlertsSkeleton() {
  const columns = ['Recorded', 'Concern', 'Level', 'Reported detail', 'Status', 'Actions'];
  const widths = ['date', 'concern', 'level', 'evidence', 'status', 'actions'];
  return (
    <>
      <div className="filter-bar skeleton-filter">
        <Skeleton shape="control" />
        <Skeleton shape="control" />
        <Skeleton shape="control" />
      </div>
      <div className="alert-log">
        <table className="data-table">
          <colgroup>
            {widths.map((width) => (
              <col className={`log-col-${width}`} key={width} />
            ))}
          </colgroup>
          <thead>
            <tr>
              {columns.map((column) => (
                <th scope="col" key={column}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 4 }, (_, i) => (
              <tr key={i}>
                {columns.map((column) => (
                  <td
                    key={column}
                    data-label={column}
                    className={
                      column === 'Reported detail'
                        ? 'log-evidence'
                        : column === 'Actions'
                          ? 'log-actions'
                          : undefined
                    }
                  >
                    <Lines />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ProfileSkeleton() {
  return (
    <>
      <div className="profile-strip">
        <IdentitySkeleton />
        <Skeleton shape="control" width="short" />
      </div>
      <div className="setup-layout">
        <div className="profile-sections skeleton-profile-tabs">
          <Skeleton shape="control" />
          <Skeleton shape="control" />
          <Skeleton shape="control" />
        </div>
        <Panel className="setup-panel">
          <div className="panel-heading">
            <Skeleton shape="title" width="medium" />
          </div>
          <div className="skeleton-form">
            <div className="form-row">
              <div>
                <Skeleton width="short" />
                <Skeleton shape="control" />
              </div>
              <div>
                <Skeleton width="short" />
                <Skeleton shape="control" />
              </div>
            </div>
            {[0, 1].map((i) => (
              <div key={i}>
                <Skeleton width="short" />
                <Skeleton shape="control" />
              </div>
            ))}
            <Skeleton shape="control" width="short" />
          </div>
        </Panel>
      </div>
    </>
  );
}

function ConfigurationRows() {
  return (
    <div className="skeleton-rows">
      {Array.from({ length: 3 }, (_, i) => (
        <div className="skeleton-row" key={i}>
          <Skeleton width="medium" />
          <Skeleton width="short" />
        </div>
      ))}
    </div>
  );
}

export function ConfigurationSkeleton() {
  return (
    <LoadingState label="Loading connection status…">
      <ConfigurationRows />
    </LoadingState>
  );
}

function CheckInSkeleton({ call }: { call: boolean }) {
  return call ? (
    <div className="live-layout">
      <Panel className="live-room skeleton-call-room">
        <div className="live-orbit">
          <Skeleton shape="avatar" />
        </div>
        <Skeleton shape="title" width="medium" />
        <Skeleton width="long" />
        <div className="call-controls">
          <Skeleton shape="control" />
        </div>
      </Panel>
      <Panel>
        <div className="panel-heading">
          <Skeleton shape="title" width="medium" />
        </div>
        <ConfigurationRows />
      </Panel>
    </div>
  ) : (
    <Panel className="day-detail">
      <div className="panel-heading">
        <Skeleton shape="title" width="short" />
      </div>
      <Lines />
      <div className="medicine-readout">
        <div className="skeleton-identity">
          <Skeleton width="short" />
          <Skeleton shape="title" width="medium" />
          <Skeleton width="long" />
        </div>
      </div>
      <div className="section-label">
        <Skeleton shape="title" width="short" />
      </div>
      <ConfigurationRows />
    </Panel>
  );
}

export function WorkspaceSkeleton({
  section = 'Monitoring',
  date,
  callId,
}: {
  section?: string;
  date?: string;
  callId?: string;
}) {
  const title = date ? 'Day record' : callId ? 'Call' : section;
  return (
    <LoadingState label={`Loading ${title.toLowerCase()}…`}>
      {(date || callId) && (
        <div className="back-link">
          <Skeleton width="full" />
        </div>
      )}
      <div className="page-heading">
        <div className="skeleton-page-title">
          <h1>{title}</h1>
          <Skeleton width="long" />
        </div>
        <Skeleton shape="control" width="short" />
      </div>
      {date || callId ? (
        <CheckInSkeleton call={!date && !!callId} />
      ) : section === 'Alerts' ? (
        <AlertsSkeleton />
      ) : section === 'Elder profile' ? (
        <ProfileSkeleton />
      ) : section === 'Settings' ? (
        <div className="settings-grid">
          {Array.from({ length: 4 }, (_, i) => (
            <Panel key={i}>
              <div className="panel-heading">
                <Skeleton shape="title" width="medium" />
              </div>
              <ConfigurationRows />
            </Panel>
          ))}
        </div>
      ) : (
        <MonitoringSkeleton />
      )}
    </LoadingState>
  );
}
