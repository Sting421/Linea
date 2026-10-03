# Cross-cutting shared components

> Built once, reused across areas. Spec each ONE way here so per-area specs stay consistent; when building any of these, update the owning area AND the reusing areas. Current as of 2026-07-16.

| Shared component | Built / owned by | Reused in | Notes |
|---|---|---|---|
| **Status/severity palette tokens** (Normal/Offline/Warning/Fault/Anomaly) | Area 3 keystone; shipped as PBI 2.1 + 820 | Areas 1, 2, 3 | The dependency everything status hangs off. Online folded into Normal (Peter 7/09); anomaly-as-status pending Peter's confirm. See [status-semantics](status-semantics.md). |
| **Severity badge / chip** (StatusBadge) + **StatusDot** | Area 3 / shipped as 2.2 (PR !981) | Areas 1, 2, 3 | On every incident/event/notification/plant-header badge. DS-faithfulness follow-up = #14 (post 820+2.2 merge). |
| **Shared map** (plant/incident overlay) | Area 1 | Areas 1, 3 | Fleet map + A3 incident overlay = same component. MapLibre GL + MapTiler. DS template: fleet-map/PlantMap (port = Cowork #9). |
| **Working-mode scheduler** (timeline: time-x, mode-y, drag-to-schedule, per-mode option panels) | Area 2 Control | Areas 2 (Control), 5 (Dispatch) | Peter: "Both, you can reuse the component." Per-mode option sets TABLED (7/09) pending the Ovanova-standard API abstraction. |
| **Cause + Suggestion fields** (API-provided; display as Sigen does, no decoding) | Area 3 | Areas 2 (Events), 3 | Same fields in the per-plant Events tab and the fleet console. |
| **Coverage qualifier / staleness label** | Area 1 (PBI 2.4) | Areas 1, 2 | "840 of 1,240 reporting" annotation; data facts in [codebase](codebase.md). |
| **Preview-widget card** (PreviewCard) | Area 1 (PBI 3.6) | Areas 1, 2 | Deep-link cards (Sector→A6, Financial→A7, savings/recent-events on A2). Missing from DS showcase; anatomy agreed. |
| **Categorical energy palette** (`--cat-*`) | DS (locked 7/15) | All energy charts | One canonical color per energy concept. See [design-system](design-system.md). |

## Changelog

- 2026-07-16: page created from §16, updated to the five-status palette and shipped-component reality.
