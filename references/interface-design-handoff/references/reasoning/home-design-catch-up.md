# Home design catch up excerpts

Interface-relevant entries from the current Home design pass, dated 1–2 October 2026. Original entry numbers and dated headings are retained. Entry 23 supersedes 16. Historical test and browser figures are copied evidence, not measurements repeated by this handoff. Unrelated operational and attribution entries are omitted.

## 2026-10-01 15:24 (build, steps 1 to 8)

**1. The chart split takes two more props.**
Planned. D2 lists `{ series, trendsAxis, title?, help?, heading?, emptyBody? }`.
Actual. `EnergyGenerationChart` also takes `surface` and `onRetry`, `series` is typed `unknown` (the serialised loader type turns a promise into `EmptyObject`), and `heading` is a render prop `({ rows, note }) => ReactNode`. `ChartFailedCard` takes `onRetry` too.
Why. The chart renders its own loading, empty and failed cards, so D5 (solid on Home only) and D6 (reload on Home) can only reach them through the chart. Defaults are unchanged, and Trends renders byte for byte the same (10 states, 54,813 bytes before and after).
Likely doc impact. The D2 prop list in the plan and the wiki.

## 2026-10-01 15:24 (build, steps 1 to 8)

**4. PreviewCard lost more than the dashed default.**
Planned. D14 "Area pills and dashed default gone, the rest kept".
Actual. Also gone from `PreviewCard`, the `pendingNote` prop and pill (its default "Coming soon" would have shown on both unlinked Home cards), the 38px "—" stand-in figure (on the removed-copy list), and the decorative arrow on a card that links nowhere. `previewCardNote` lost its third parameter. Six existing tests were rewritten for those removals.
Why. The approved copy list and the v2 render both show an empty card as glyph plus one line, and an inert card should not carry an arrow.
Likely doc impact. D14 wording.

## 2026-10-01 (build, browser pass and merge simulation)

**8. A StatCard look and two layout calls came out of the browser pass.**
Planned. D15 "an opt-in Home look, default unchanged".
Actual. The Home look also wraps its header chip under the title in a narrow card (the 3-up cell is about 300px at 1280 and the date chip truncated the title to "Fleet Capac..."). `!1054` adds a `wrapHeader` prop for the same need, so the resolution takes `wrapHeader || home`. The alerts row (Active Alerts beside the Fleet list or capacity) stacks at 1024 and goes two across from 1280, because at 1024 each card was under 300px and the plant names and badges collided.
Why. Seen in the browser at 1024 and 1280.
Likely doc impact. The Home layout note in the wiki.

## 2026-10-01 (build, browser pass and merge simulation)

**9. The Fleet list collision is on the base, not new.**
Planned. Not applicable.
Actual. At 1280 "Regen Center Grid Inverters" runs under its Warning badge and "1111 Wallabe Way" under Offline in the PlantCard rows. Measured on the base `838dda2b` at the same width with the same data, so it predates this branch and `PlantCard` is not in scope.
Why. Recorded for the filing gate.
Likely doc impact. A Bug candidate for PlantCard row layout at narrow widths.

## 2026-10-01 (build, browser pass and merge simulation)

**12. The review changed three calls and left two open.**
Planned. The ruled copy and states as written.
Actual. The untitled map keeps its old "No data available!" fallback, because Batch Commands and the Microgrids list page use it and may not change. Fleet Battery fails with Try again alone (card wording), because no range can change it. The Fleet Status donut keeps chart wording with Try again and Change date range, because its counts depend on the range. On Home the approved Production empty line wins over the Trends whole year line. Left open and reported. The Fleet Capacity Export tile still sums every returned bucket while Production now clips to the range, so on an hourly range they cover different windows (AC9 says no card changes its data). The Production cell is not styled by HomeCell before hydration, the same as Overview's chart cells, since GraphWrapper's ClientOnly fallback is an svg.
Why. Sixteen findings, of which five were dropped by the refuters and eleven stood. Nine of the eleven were fixed (the untitled fallback was reported three times, so seven distinct fixes), two are the open items above, and four of the dropped five were fixed anyway because the code or the test did read as the finding said.
Likely doc impact. D8 failed wording for the donut and battery, and a decision on the Export window.

## 2026-10-01 21:41 (round 2, Keith's feedback after his look, eight items)

**13. The Fleet Status donut no longer filters, and D7's filtered words are retired.**
Planned. D7 and the 2026-08-22 note kept the donut's click to filter, with "of N with a status" under a selection.
Actual. StatusDonut is rebuilt on the Overview donut. No selected state, no Clear filter, no aria-pressed rows, `filteredLabel` and FLEET_FILTERED_LABEL are gone. The legend is read only rows (ChartLegend `readOnly`), hover on a row or a ring segment swaps the centre to that status. DL-53 already ruled this, and the filter never filtered anything outside the card. Fallback if Keith wants hide a status toggles, the Overview legend behaviour, is described in the hand-back.
Why. Keith asked for the Overview and Trends donut in UI and UX. There is no Trends donut, the Overview ones are the pattern.
Likely doc impact. D7 and D8 wording, the AREA-BUILD-GUIDE section 7 item 2, AB#737's strip half (nothing left to strip on Home).

## 2026-10-01 21:41 (round 2, Keith's feedback after his look, eight items)

**14. Shared components gained opt ins beyond the plan.**
Planned. Home files plus the shared files the plan listed.
Actual. Donut `fluid`, ChartLegend `readOnly`, FleetMap `fitPadding` as a number or an uneven object and `instantFirstFit`, AlertStripRow `detail` and AlertStripCount, PlantCard `detail` (replaces `badges`) and an opt in ring (`accent` kept), PreviewCard `eyebrow` `loading` `loadingLabel`, EnergyGenerationChart `chartHeight`, ChartHeading `window`, `.quiet-scrollbar` in tailwind.css. Defaults render as before, proven by the existing suites and by a ten state byte comparison of Trends (54,813 bytes before and after).
Why. Each is the smallest shape that lets Home follow the brief without forking a component.
Likely doc impact. Component notes in the wiki, the DS icon and component queue is unchanged.

## 2026-10-01 21:41 (round 2, Keith's feedback after his look, eight items)

**15. D4 moved, Production's heading is in the card body.**
Planned. The total and plants reporting line live in GraphWrapper's subtitle slot.
Actual. The heading draws as the first child of the card body, so the help sits at the top right with the title. One range text follows the total, the picked label, or the chart's returned window when that differs from the pick or is a lone bucket. The "This range came back as one total" note is not drawn on Home. The plants reporting pill is plain text, the amber partial state is gone and a partial count shows a plus and a title.
Why. Keith's item 2. GraphWrapper and the Trends markup are untouched.
Likely doc impact. D4, the Production card note, the Bug 33 truthfulness note (the window now leads).

## 2026-10-01 21:41 (round 2, Keith's feedback after his look, eight items)

**16. The top row is two across from lg up, which departs from the breakpoint table.**
Planned. Three across from xl (the card band), Production the last of three.
Actual. Fleet Status and Fleet Battery side by side, Production on its own full width row, at every width from 1024. Measured top row at 1280, 312 and 412 tall where one row was 532. The donut sits beside its legend from a 440px cell and over it below that, so between 1024 and about 1190 those two cards are still taller than wide. The bottom bands stay three across from xl.
Why. Keith's item 8, shorter and more rectangular. The only way to make the donut card wider than tall is more width, which three across at xl cannot give.
Likely doc impact. The breakpoint table (xl card band), the Area 1 Home layout note.

## 2026-10-01 21:41 (round 2, Keith's feedback after his look, eight items)

**17. PlantCard's ring stays an opt in because the landing branch passes an accent.**
Planned. Remove the status ring from the Fleet avatars.
Actual. First built by removing `accent`, then found that AB#939's PlantsCards.tsx passes `accent` and `photo`, so the removal broke its typecheck without any textual conflict. The ring is now the `plant-card-avatar--ring` modifier, drawn only when a consumer passes an accent. Home passes none.
Why. A shared component with a second consumer on an open branch.
Likely doc impact. None, the merge recipe covers it.

## 2026-10-01 21:41 (round 2, Keith's feedback after his look, eight items)

**20. The map cannot fit every plant at a phone width.**
Planned. Item 3, every plant visible by default.
Actual. True at 700 and wider on both accounts with every marker clear of the controls. At 390 the frame is 359 wide and 85 of 107 plants fall outside, because FleetMap's minZoom of 2 stops the fit. The page has no navigation below 1024, so it is recorded rather than fixed. The one line fix is a minZoom prop.
Why. A measured limit.
Likely doc impact. The no navigation below 1024 defect entry.

## 2026-10-01 21:41 (round 2, Keith's feedback after his look, eight items)

**21. A test passed in the main folder and failed on a CRLF checkout.**
Planned. Not applicable.
Actual. The mutation baseline in a scratch worktree failed the donut source scan, a pattern with a newline, because the worktree checks out CRLF. Fixed by reading the source without carriage returns. A second test needed the map key from the untracked .env and was fixed. The whole suite now passes on a CRLF checkout with no .env.
Why. Found by checking the baseline before trusting a mutation result.
Likely doc impact. The testing notes, source scans must not depend on line endings or on .env.

## 2026-10-01 21:41 (round 2, Keith's feedback after his look, eight items)

**22. One 404 on a first load, not reproduced.**
Planned. Not applicable.
Actual. During the mutation run a first load of Home as the utility account at 1536 returned a bare 404 page. The same URL loaded on the next run. One in about thirty loads, with the machine busy, no cause found.
Why. Reported rather than dropped.
Likely doc impact. None unless it returns.

## 2026-10-01 22:00 (round 2b, Keith's second note after seeing the two across row)

**23. The top row goes back to three across from 1280, in widening columns. This supersedes entry 16.**
Planned. Entry 16, Fleet Status and Fleet Battery side by side over a full width Production.
Actual. One row from xl, columns 1fr, 1.15fr and 2fr, so Fleet Status is the thinnest, Fleet Battery a little wider and Production the widest. Two across with Production on its own row stays below 1280. The donut takes a third size tier so a 224px cell does not overflow its padding (192 under 260px, 208 from 260, 224 from 340). Measured top row height, 1280 467 with cells 224, 257 and 448, 1536 483 with 286, 328 and 571, 1920 459 with 378, 435 and 756, where one row of three equal cards was 532 at 1280. The stacked donut sets the height, so the cards are taller than wide, which he chose over the wider shorter pair.
Why. His note, three items in a row, graduated widths. The earlier call was mine and he overruled it.
Likely doc impact. The breakpoint table now differs from the build only in the unequal widths at xl, entry 16 can be dropped.

## 2026-10-02 00:03 (round 2c, his notes on Production, Fleet Capacity, the lists and the help hints)

**24. Every Home card carries a help hint.**
Planned. The 14:17 ruling gave a help hint to Production only, and the brief said no help icon on Grid Share.
Actual. Active Alerts, Fleet, Grid Share, Financial Impact, Fleet Capacity and Fleet Battery take the same HelpHint the donut and Production use, at the top right of the header, with new copy for each (section 3 of the hand-back).
Why. His note, make sure these cards have the question mark tooltips as well, with a screenshot of five of them.
Likely doc impact. The six lines need his approval before they go in the help copy table. The brief's no help icon on Grid Share is superseded.

## 2026-10-02 00:03 (round 2c, his notes on Production, Fleet Capacity, the lists and the help hints)

**25. Fleet Capacity sizes its figures by the tile and picks the tile shape by the card.**
Planned. Entry 8 and the first round 2c pass, upright tiles with the label above and an 18px figure below.
Actual. Each home tile is a named size container. The figure is 18, 28 or 38px by the tile's content width (under 5rem, from 5rem, from 7.5rem), the unit sits under it until 7.5rem, and from 15rem a tile is a row. The card picks the shape, upright 7 by 8 for three or four columns while it is 380 to 559 wide, compact landscape from 560, and a two column card is never upright. Measured, 1024 179 tall, 1280 302, 1536 208, 1920 255 on the aggregator, and 412 on the utility account at every width.
Why. His note, the tiles look off, enlarge the values by way bigger or restructure.
Likely doc impact. Container queries nest here for the first time, the card's at 380 and 560 and a named `tile` container inside. The card system's density table is unchanged and the nesting may want a line in the container query section. At 1280 the card is 13px taller than at the 22:00 build (302 against 289).

## 2026-10-02 00:03 (round 2c, his notes on Production, Fleet Capacity, the lists and the help hints)

**26. Production moves its plants reporting line beside the total, the total is 38px, the chart floor is 216.**
Planned. Entry 15 and the round 2 Production work, a plain neutral line under the total, the total at 28px, a chart floor of 200.
Actual. One flex row, total on the left and the line at the right on the figure's baseline, wrapping under the total when it does not fit. The total takes `display-xl`, the size the Fleet Battery figure uses. The chart floor is 216 and the chart is 233 to 265 tall. The top row did not change height.
Why. His note, put the line on the right in the same row as the value, make the chart slightly taller, make the value slightly bigger.
Likely doc impact. The Home Production section should describe the one row heading.

## 2026-10-02 00:03 (round 2c, his notes on Production, Fleet Capacity, the lists and the help hints)

**27. The Active Alerts list gets an end fade that follows the scroll.**
Planned. Nothing, the list had a short fade only when it was cut at the row cap.
Actual. The same 32px white fade the Fleet list has, shown while rows sit below the fold and eased out over 150ms at the end of the list. The Fleet fade is always on, so the two differ on purpose.
Why. His note, the same white end gradient as the Fleet list. An always on fade washes out the last row at the end of a list that is not cut.
Likely doc impact. If he wants them identical, the Fleet list follows the scroll or the alerts list goes always on, section 3 item 2.

## 2026-10-02 00:03 (round 2c, his notes on Production, Fleet Capacity, the lists and the help hints)

**28. The Fleet plant cards are flat.**
Planned. Entry 17, PlantCard with the shared card shadow.
Actual. `PlantCard` takes an opt in `flat` and the Fleet list passes it. The grey he called a background was the shadows stacking in the gaps and being cut by the scroller.
Why. His note, remove the background for the plant list in Fleet. An inset card in a card is flat in the card system.
Likely doc impact. None to the card system. Landing and other consumers keep the shadow.

## 2026-10-02 00:03 (round 2c, his notes on Production, Fleet Capacity, the lists and the help hints)

**29. Smaller items in the same round.**
Planned. Nothing.
Actual. The legend hover fades the other bars over 150ms (`fadeBars`, opt in). `fill` is an opt in prop on the energy chart so Production fills its card. Home gets 24px of bottom padding. Grid Share draws no sparkline from fewer than two points. The fixtures proxy returns monthly points for a year window by default.
Why. The Production, Grid Share and spacing notes in the same message.
Likely doc impact. None beyond the Production and Grid Share lines above. The merge recipe for the landing branch is rebuilt, `resolve-r2c.cjs`, because StatCard and PlantCard changed again.

## 2026-10-02 00:19 (round 2d, why Grid Share has no line on a year range, and the preview route)

**30. Grid Share draws no line on a year range with the live API.**
Planned. The Grid Share brief, a sparkline to the right of the figure.
Actual. The sparkline needs two buckets. The live grid endpoint returns one yearly bucket for 1 Jan to 31 Dec, six monthly for six months, five weekly for September and fourteen daily for two weeks. The card renders the figure and range alone for a year.
Why. His question, why is Grid Share not rendering, with a screenshot of a year range.
Likely doc impact. The Grid Share spec should say the line needs two buckets and what the card shows for one, which is his call in section 3 of the hand-back.

## 2026-10-02 00:19 (round 2d, why Grid Share has no line on a year range, and the preview route)

**31. A local preview route renders Grid Share in its full form.**
Planned. Nothing.
Actual. `app/routes/_.preview.grid-share/route.tsx`, excluded from git, real component and invented data, five states and the seven measured cell sizes.
Why. His request, render the full form into a custom route for a design pass.
Likely doc impact. None. If a second card wants the same, the route is the pattern, and it stays local because its data is invented.

## 2026-10-02 00:19 (round 2d, why Grid Share has no line on a year range, and the preview route)

**32. The sample data proxy was not in the path of the server he is using.**
Planned. Entry 19, chart test data through a local proxy.
Actual. The proxy runs and has passed zero requests, so the 5176 server is on the live API. Any sample data check has to read the proxy counters after a page load.
Why. Found while tracing his question.
Likely doc impact. The proxy's README says to restart the dev server with `UKI_API`, and a check that the proxy counters rise after a page load belongs in the recipe.

## 2026-10-02 00:48 (round 2e, the Grid Share line takes much more of the card)

**33. The Grid Share line takes the width the figure leaves.**
Planned. Entry 25 and the round 2 Grid Share work, a sparkline in the right column of a fixed fraction split, 3fr and 2fr then 11fr and 9fr.
Actual. `PreviewCard`'s body grid is `fit-content(60%)` and `minmax(0,1fr)`, so the text column takes only its content and the line takes the rest. The slot is 64px tall from a 560px card. Measured line slot 167 to 626px across the seven Home cells, 54 to 79 percent of the card.
Why. His note, a much wider line, especially on wider cards. The cap is 60 percent after an independent review showed 50 percent wrapped a 12 month range label on narrow cards.
Likely doc impact. The Grid Share section should say the line fills the remaining width. The sparkline's 3.6 percent side padding and the 32px gap are the remaining levers if he wants it wider.

## 2026-10-02 01:49 (round 2f, the Fleet Capacity tiles take the donut blue with white text)

**34. The Fleet Capacity tiles take the donut blue with white text.**
Planned. Entry 25, flat inset tiles on a pale grey, dark text.
Actual. Each home tile is `bg-gradient-to-b from-hue-sky-500 from-25% to-hue-sky-800` with white text. The top is the donut's `#009DE4` held to a quarter. The bottom is `#03587F`, deeper where the donut fades lighter, so only the top colour and the hold are shared with the donut. White measures 3.02 to 1 at the top and 7.76 at the bottom.
Why. His notes, the donut's blue gradient with light text, keep the blue and darken the bottom so white passes, then make the top lighter. The top went back to the donut's exact blue, which is the lightest that holds 3 to 1 for the large figures.
Likely doc impact. The Fleet Capacity section should record the 11px labels at 3.02 to 1 and the row layout units at 4.2 to 4.4 as accepted below AA, and that a lighter top needs a dark text colour. The home tile is no longer a grey inset tile, so the card system's inset tile row has a coloured exception here.