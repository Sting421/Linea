# 08 · Messaging and charts

Chips, banners, toasts, and how more than two charts are laid out.

Why in `memory/topics/design-system.md`, "BANNERS, NOTIFICATIONS AND CHIPS" and "THE TRENDS NINE". Chart
layout is also `decision-log.md` DL-64.

---

## The governing principle

**These three differ by who started it and what a miss costs.** Everything else follows from that one line.

| | Started by | Lives | Leaves | A miss costs |
|---|---|---|---|---|
| **chip** | nobody. It is a FACT | inline, in a card | with its parent only | nothing, it is still on screen |
| **banner** (`Callout`) | a CONDITION | **in** the layout | user dismiss, or the condition clears. ⛔ **NEVER a timeout** | a lot |
| **notification** (toast) | an EVENT | **above** the layout | a timer | **nothing, and that is the constraint** |

⛔ **A TOAST IS NEVER THE ONLY CARRIER. This is a correctness rule, not a UX preference.** Everything a toast
says must ALSO land in the notification inbox or the alerts list as the durable record. **An operator who
looked away for four seconds must not lose a fault.** If a message has nowhere durable to live, **it is a
banner, not a toast.**

⛔ **ONE CHANNEL PER MESSAGE.** The same event never fires both a toast and a banner.

⚠️ **Read the right template.** `Chip` exists twice and `SeverityBadge` exists twice. **The standalone folder
is canonical in both cases**, `ui-chip/` and `severity-system/`, not the `domain-control-readout/` copies.
⛔ **There is NO toast or snackbar template anywhere in the DS.** `NotificationInbox` is a persistent LIST,
not a transient notification. **Do not build a toast from it.**

---

## Chip · no lifecycle, it changes value

**Values, from `ui-chip/Chip.dc.html`.** Display face 600 at **12.5px** (→ the `label` token at 12px, per
`03-typography.md`), `line-height: 1`, `border-radius: 999px`, `padding: 5px 12px`, optional 7px leading dot,
nine colour families. **One size. No variants.**

- **Appears with its parent. No entrance of its own.**
  ⛔ **NEVER animate chips in on a data refresh.** They render in rows of five to ten, so a stagger on every
  poll is a frequency problem rather than a polish one.
- **A VALUE change cross fades the LABEL only**, opacity around 150ms.
  ⛔ **Never animate the pill's width.** It reflows the row.
- **A STATUS FAMILY change** (green to red) transitions colour over 100 to 160ms on plain `ease`. **That one
  should be noticed.**
- ⚠️ **An INTERACTIVE chip, meaning a filter or a selection token, is a DIFFERENT COMPONENT** and takes the
  full six state contract in `04-interaction.md`. A fact and a control that look alike is the trap here.

---

## Banner (`Callout`) · in the layout, so it reflows

**Values, from `callout/Callout.dc.html`.** `padding: 14px 16px`, radius 10px, tinted background with a 1px
matching border, 22px circular severity icon, title 13.5px, body 13px, action link 12.5px.

- **Appears by animating its own HEIGHT plus opacity**, 150 to 250ms on `cubic-bezier(0.23,1,0.32,1)`. It
  pushes content, so without the height animation the page jumps. ⛔ Never from `scale(0)`, and never a slide,
  because it is inline.
- ⛔ **PERSISTENT. No timeout, ever, at any severity.** It may update its text in place.
- **A second banner of the same severity COALESCES WITH A COUNT. It does not stack.** ⛔ **Max two visible.**
- **Exits at 120 to 180ms, the reverse of its enter, collapsing its height** so content does not snap upward.
- ⛔ **Dismissal is remembered per CONDITION INSTANCE, not per session.** A banner that returns on every
  navigation trains people to dismiss without reading, which is how the one that mattered gets dismissed.
- ⛔ **A banner carrying a FAULT is never dismiss only.** Dismissing hides the notice, not the condition, so
  the condition stays visible on its own surface.

⚠️ **Its dismiss `x` diverges from the close button spec.** `#7FA8BE`, 16px, no outline. **The close button
spec wins.** Reconcile the Callout toward it, see `04-interaction.md`.

---

## Notification (toast) · does not exist yet, build to this

⛔ **The first version of this spec violated three house rules at once. All three corrections are folded in
below. Do not re-derive it from the earlier text.**

**Placement.** One corner, always the same one. **Recommended top right, so the transient copy sits beside the
inbox icon holding the durable copy.**

**Enter.** ⛔ **A PERCENTAGE translate of its own size, `translateY(100%)` or `translateX(100%)`, NEVER a
hardcoded px offset.** 200ms on `cubic-bezier(0.23,1,0.32,1)`. The earlier "~8px offset" was wrong on both
counts.

⛔ **CSS TRANSITIONS, NEVER KEYFRAMES.** Toasts are the named case for this: **keyframes restart from zero,
transitions retarget**, and toasts are added rapidly. Use `@starting-style` for entry without JS.

**Exit.** ⛔ **REVERSES the enter path**, the same translate percentage back out, around 150ms so it is faster
than the enter. **Symmetric PATH, asymmetric DURATION.** The earlier "fade plus slot collapse" is a different
geometry from the enter and is exactly what the symmetric paths rule prohibits. The remaining stack then
reflows on `cubic-bezier(0.77,0,0.175,1)`, the on screen movement curve.

**Dismiss.** ⭐ **Swipe to dismiss is the named house idiom.** Dismiss on **velocity, not distance**,
`Math.abs(distance) / elapsedMs > ~0.11`, so a flick is enough. **Rubber band at the boundary** rather than
hard stopping.

**Dwell, and the timer PAUSES on hover and on focus-within.**

| Severity | Dwell |
|---|---|
| info | 4s |
| success | 4s |
| warning | 8s |
| ⛔ **error and fault** | **NEVER auto dismiss** |

⛔ **Never under 4s, unreadable. Never over 10s for anything that auto dismisses.**

⛔ **MAX THREE visible.** Newest nearest the origin corner. Past three, coalesce into "+N more" pointing at
the inbox. **A wall of toasts blocks the UI it is reporting on.**

**Keyboard dismiss removes it immediately, no exit animation**, per the contract's prohibition on animating
keyboard initiated actions.

**Reduced motion.** Fade only, no slide, and the stack reflow lands instantly.

**Accessibility.** `role="status"` with `aria-live="polite"` for info and success. `role="alert"` with
`aria-live="assertive"` for warning and error. ⚠️ **Pause on focus is what makes the dwell timer safe for a
screen reader user** who is still being read the message when the timer expires.

⛔ **The error asymmetry is the whole point. You cannot auto dismiss a fault.** An error toast holds until
dismissed. **If that feels wrong for a case, the message was a banner all along.**

---

## ⛔ CHART LAYOUT · DL-64

**Binds any surface carrying more than two charts.**

✅ **Charts on a SHARED axis are laid out so the axis lines up, and the axis is drawn ONCE, not per chart.**

✅ **Charts on a DIFFERENT axis are separated into their own zone.**

⭐ **The reason is a correctness argument, not a preference.** A two column grid renders two charts at
different pixel widths over different ranges, **so a reader who scans a vertical slice down the page concludes
something false.** Alignment is what makes a vertical scan mean anything.

⚠️ **F-pattern and Z-pattern are the WRONG models for a dense analytical surface and were considered and
rejected. Do not reintroduce them.**

⚠️ **ON THE TRENDS GRID, DL-113 (2026-09-25) supersedes "drawn ONCE".** Every Trends chart sits in its own card
with its own date axis, one column below 1280 and two from 1280. Alignment still holds, because every card has one
width and one domain.

**Measurements that exist.** A stacked chart height of 260px plus an axis gutter for the shared axis zone; the
second zone keeps 400. Exact values and the rejected options are in the wiki section, deliberately not
duplicated here so the two cannot drift.

---

## State text that asks for an action carries a button · DL-114

✅ **When a state line asks the reader to do something, a button below the text names the action**, for example
**Change date range**. A state that asks for nothing (no blackouts recorded, loading, not built yet) has no button.

⛔ **Never make a word inside the sentence the control.** The clickable "range" of 2026-08-20 is superseded for
new work. The button follows `05-buttons.md`, the secondary until the elevation tokens land.

---

## The categorical palette in use

Full table in `01-foundations.md`. What binds on a chart:

⛔ **A series colour comes from `cat-*` or the brand ramp. Never from `status-*`, and never a raw hex.**
Status hues mean status. A series that borrows one is claiming a severity it does not have.

⭐ **The inverter series deliberately do NOT take a categorical value. They take `hue-sky-600`**, because
`total_dc_to_ac` and `inverter_power` are throughput totals rather than categories (DL-86). **A total is not a
category, and colouring it like one puts it in a legend it does not belong to.**

⛔⛔ **KNOWN DEBT, and it is a filed item rather than a convention gap. The seven Trends charts carry 51 raw
six digit hex literals between them and ZERO reads of `statusToHex`, `status-*` or `hue-*`.** The fills are
Recharts documentation defaults nobody replaced. **Do NOT fix these incidentally inside another item.** One
Trends design item owns all four parts at once, axis normalisation, tokens, the card system and the DL-64
layout, and a partial drive-by makes that item's diff unreadable.

⚠️ **`theme/categorical.ts` exists but check which branch you are standing on.** It has landed on the Trends
design branch and `cat-*` utilities do not resolve for anyone still on `dev`.

## Chart treatment · DL-122, ⏳ on `!1049`, NOT yet on `dev`

Keith's finished Trends pass, and the set he carries to Overview and the Area 1 pass. ⛔ Until `!1049` merges, `dev` still
draws the old charts, so do not describe `dev` this way. Built pieces live on `feature/1022-trends-design-pass` in
`Trends/trendsChartFills.tsx`, `trendsEntrance.tsx`, `trendsTicks.tsx`, `trendsCursor.tsx` and `app/utils/trendsAxis.ts`.

- **Bars.** Tops round at **4px**, the micro mark band, drawn as a squircle and capped at half the bar's width. One
  gradient runs down the whole chart, so stacked segments meet as one column. Bar charts sit on a dotted graph paper
  grid, dots at each value tick and between periods, never a line through a bar. Hover lights a soft band.
- **Axes.** They recede behind the data. No axis titles. Value ticks carry their unit. An energy axis takes one unit for
  all its ticks, chosen by its largest (kWh, MWh, GWh). Minutes and bare counts use k. Each value axis is as wide as
  its own labels, with an even margin either side.
- **Dates.** Mar ’25, a two digit year after a typographic apostrophe, with the header's month names (Sept). A label at
  a plot end moves in only as far as it must, and gives way rather than crowd.
- **Legends.** One inset panel under the plot, items centred. **Hovering an item ISOLATES its series**, the rest to 0 and
  the hovered one to the foot of its stack, as How Loads Are Met does. It does not dim.
- **Tooltip.** The shared `ChartTooltip`, 24px from the point, rows may carry a status chip and a square marker. Dots draw
  in front, the hover line draws in front of fills, and the line and band glide between periods over 200ms.
- **Motion.** A chart draws in once on first view and once in full screen, never again on closing it. Stacked bars rise
  as whole columns from the x axis. Reduced motion skips all of it. ⚠️ This animates geometry, a knowing departure from
  the transform and opacity rule in `04-interaction.md`, taken on Keith's ask for charts only.
- **Grid Quality.** Frequency and voltage on one chart, two value axes each centred on the payload's nominal. Status
  lives on chips, and a nominal reading's chip says **Normal**. Frequency more than 2% or voltage more than 50% off
  nominal reads as no reading, like an exact 0, since such buckets average offline time in.
- **Units.** A unit that cannot be established stays off, unless it is labelled provisional and the pull request says so
  (balance of systems' kW).
- **Overview (DL-123).** The same treatment, on `!1043` and not yet on `dev`. Donuts add two of their own, a hovered item keeps
  a grey outline of the ring and its figure shows in the centre. The weather card's chosen day is one highlight that slides.
  The energy price row reads per kWh with no currency sign.

---

## Changelog

- 2026-09-22: created from the full design-system read.
- 2026-09-25: DL-113's per-card axis noted under CHART LAYOUT, and DL-114's state action button added.
- 2026-09-27 22:05: the Trends chart treatment added from DL-122, marked as living on `!1049` until it merges.
- 2026-09-28 09:22: Overview's share of the treatment noted from DL-123, on `!1043` until it merges.
