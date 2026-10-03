# Event-code → status map (seed from #power-plant-alerts)

*Harvested from the Slack "Solar inverter event briefing" feed (2026-07-09/10). This is the seed input for the PBI 2.1 normalizer and the source for the DR conditions table (illustrative subset only). NOT authoritative or complete: it is the codes observed recently, to be reconciled against the platform's full event-code catalog from the API. **The incompleteness is now measured rather than assumed (live capture 2026-08-02): 20 of 50 events, 40%, carried a code absent from `EVENT_CODE_STATUS` (`W025`, `W027`, `W016`), against 0% in the `mockData` fixture.** So production coverage is materially worse than the fixture suggests, and because the vocabulary is vendor- and firmware-specific it is effectively unbounded and will keep drifting as plant types onboard. Two consequences recorded elsewhere and worth knowing here: a partially-filled map **degrades silently**, since an uncovered code falls back to the raw enum (which is why DL-26 has Area 1 exclude-and-count rather than fabricate a severity), and Area 3 must therefore list severity-underivable events in full, because a summary may edit and a record may not. Proposed statuses are Claude's mapping to Peter's five-status model; ambiguous ones are flagged for Peter.*

> **⚠️ AS-OF DOCUMENT, banner added 2026-09-18.** Harvested **2026-07-09 and 10**, 71 days ago, from a
> Slack feed rather than from the API, so it is a seed and not a contract. ✅ **Checked against the live
> taxonomy today and it is CONSISTENT**, its Normal, Offline, Warning and Fault mappings and its finding that
> anomaly is derived rather than device-emitted all match the two-level model in the memory wiki, including
> the online-folds-into-normal rule. **So nothing here needs negating.**
>
> ⚠️ **What it is NOT.** It is not an exhaustive code list, its Confidence column is a judgement made from
> briefing text, and the normalizer that shipped is the authority on behaviour. **Where this file and
> `app/utils/status.ts` disagree, the code wins and this file gets a note.**


## Key findings (these change how we think about the model)

1. **The platform already emits a top-level status.** The "Inverter with non normal status" briefings list inverters directly as `status is offline` / `status is warning`. So level-1 status (at least Offline / Warning / Normal) is partly platform-provided, and the event codes below are the level-2 *conditions*. This supports the two-level model and means the normalizer may consume a native status field, not only derive from codes.
2. **Two code schemes by manufacturer.** EG4 and Lux use `W###` / `E###` (W = warning, E = error). SolArk uses named codes (`AC_OverFreq_Fault`) plus a numeric id. The normalizer has to handle both, which is concretely why Peter said the control/settings spec differs per manufacturer.
3. **Manufacturer severity ≠ our status.** Many SolArk `_Fault` codes are grid/electrical conditions (over/under voltage, over-frequency, grid current high) that are **Warnings** by Peter's definition (electrical out of bounds), not hardware **Faults**. So we cannot blindly map `_Fault → Fault` or `W → Warning`. This is the main area needing Peter's call.
4. **Anomaly is derived, confirmed.** No code corresponds to "PV production collapsed / battery contribution collapsed / grid unstable." Anomaly is computed, not device-emitted, exactly as we hypothesized.
5. **Informational (non-incident) events exist.** e.g. `Grid_Mode_changed` is not an issue; it belongs in the notifications inbox, not the incidents console (ties to the notifications-vs-incidents split).
6. **"No AC Connection" / "No utility" is not the same as platform "offline."** The inverter is reporting (not offline) but has lost grid/AC input. Don't conflate.

## Mapping

### Platform top-level status (emitted directly)

| Value | Proposed status | Confidence |
|---|---|---|
| offline | Offline | High (native) |
| warning | Warning | High (native) |
| (implied healthy) | Normal | High |

### EG4 18kpv / Lux 12k (W### / E###)

| Code | Name | Seen on | Proposed status | Confidence / note |
|---|---|---|---|---|
| W026 | Battery voltage low | EG4, Lux | Warning | High (electrical, battery low) |
| W021 | Leakage I high | EG4 | Warning (safety) | High (feed treats it as a safety leakage warning) |
| W017 | Grid voltage abnormality / AC voltage out of range | EG4, Lux | Warning | High (matches "AC voltage out of bounds") |
| W018 | Grid frequency abnormality | EG4 | Warning | High (grid quality) |
| W010 | AC over load | EG4 | Warning | Medium (overload; may escalate to a trip) |
| W016 | No AC Connection | EG4, Lux | **Warning or Offline?** | AMBIGUOUS (grid-input lost; NOT platform-offline) |
| W009 | Fan Stuck | EG4 | **Warning or Fault?** | AMBIGUOUS (cooling hardware, but a W code) |
| W027 | Battery open | EG4, Lux | **Fault or Warning?** | AMBIGUOUS (battery path open) |
| W000 | Communication failure with battery | EG4 | Fault (comms) | Medium (comms cluster) |
| W030 | Grid Boss CAN Loss | EG4 | **Fault or Warning?** | AMBIGUOUS (comms/config cluster) |
| E000 | Internal communication fault 1 | EG4 | Fault | Medium (E = error, internal comms) |
| E019 | Bus voltage high | EG4, Lux | Fault | Medium (DC bus, E = error) |

*Also seen without a code shown (resolved/older): EPS Over load, Communication failure with meters, Grid Boss Breaker Open, No master setting for parallel system, Battery voltage high. Capture codes when reconciling with the API catalog.*

### SolArk (named + numeric)

| Code | Name | Proposed status | Confidence / note |
|---|---|---|---|
| 18 | HW_Ac_OverCurr_Fault | Fault | Medium (HW = hardware overcurrent) |
| 26 | BusUnbalance_Fault | Fault | Medium (DC bus imbalance) |
| 1 | DC Inversed Failure | Fault (safety) | High (reversed DC polarity; safety-critical) |
| (—) | Tz_Dc_OverCurr_Fault | Fault | Medium (DC overcurrent) |
| (—) | Arc_Fault | Fault (safety) | High (arc; safety-critical) |
| 45 | AC_UV_OverVolt_Fault | **Warning (grid voltage)** | AMBIGUOUS (named _Fault, but grid voltage = Warning by Peter's def) |
| 47 | AC_OverFreq_Fault | **Warning (grid freq)** | AMBIGUOUS (same reasoning) |
| 59 | AC_V_GridCurr_High_Fault | **Warning (grid current)** | AMBIGUOUS |
| (—) | AC_NoUtility_Fault | **Warning or Offline?** | AMBIGUOUS (grid loss; like No AC Connection) |
| 34 | AC_Overload_Fault | Warning | Medium (overload) |
| 56 | DC_VoltLow_Fault | **Warning or Fault?** | AMBIGUOUS (DC low voltage; named _Fault) |
| 15 | SW_AC_OverCurr_Fault | **Warning or Fault?** | AMBIGUOUS (software overcurrent trip) |
| 23 | Tz_GFCI_OC_Fault | **Warning (safety) or Fault?** | AMBIGUOUS (GFCI/ground-fault trip; safety) |
| 41 | Parallel_System_Stop | **Fault or system-stop?** | AMBIGUOUS (often a secondary cascade shutdown) |
| (—) | Grid_Mode_changed | Normal / informational | High (not an issue; inbox-only, not an incident) |

### Anomaly (derived, no code)

PV production drop/collapse, battery contribution collapse, grid instability, missing unit in a multi-battery/parallel system. Backend-computed; no device code maps here.

## The calls that need Peter (or your decision)

- **The `_Fault`-named grid/electrical codes** (AC_UV_OverVolt 45, AC_OverFreq 47, AC_V_GridCurr_High 59, DC_VoltLow 56, SW_AC_OverCurr 15): Warning (grid/electrical out of bounds) or Fault (protection trip)? This is the biggest bucket.
- **Fan Stuck (W009):** Warning or Fault?
- **Battery open (W027):** Fault or Warning?
- **No AC Connection (W016) / AC_NoUtility:** Warning, or a grid-loss state distinct from Offline?
- **GFCI/leakage:** W021 Leakage (mapped Warning) vs Tz_GFCI_OC_Fault 23 (a harder trip) — same family, different severity?
- **Parallel_System_Stop (41):** its own state, or Fault? (Usually secondary to another inverter's fault.)
- **Comms cluster** (W000, E000, W030, internal comms): own handling, or fold into Fault?
