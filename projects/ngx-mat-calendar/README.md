# <p align="center">ngx-mat-calendar</p>

<p align="center">
  <strong>A Material 3 calendar component for Angular with day, week, and month views.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/ngx-mat-calendar"><img src="https://img.shields.io/npm/v/ngx-mat-calendar?color=5558d9" alt="npm version"/></a>
  <a href="https://github.com/PianoNic/ngx-mat-calendar/blob/main/LICENSE"><img src="https://img.shields.io/github/license/PianoNic/ngx-mat-calendar?color=5558d9"/></a>
  <a href="https://www.npmjs.com/package/ngx-mat-calendar"><img src="https://img.shields.io/npm/dm/ngx-mat-calendar?color=5558d9" alt="npm downloads"/></a>
</p>

## About

A drop-in calendar component built on Angular Material 3 design tokens. Fully standalone, signal-based, and ready for Angular 19+.

## Features

- **Three views** - Day, week, and month with smooth switching
- **Material 3** - Uses `--mat-sys-*` design tokens for theming
- **Time-positioned events** - Events placed at correct times with proper duration heights
- **Overlap handling** - Simultaneous events displayed side-by-side
- **Current time indicator** - Live red line showing current time (updates every 30s)
- **Customizable labels** - Override all text via `labels` input (i18n ready)
- **Configurable work hours** - Set `startHour` / `endHour` for day/week grids
- **Event colors** - Per-event color override via `color` property
- **Responsive** - Adapts to smaller screens
- **Accessible** - ARIA labels, keyboard navigation, screen reader friendly
- **Standalone** - No modules, just import and use

## Installation

```bash
npm install ngx-mat-calendar
```

> Requires `@angular/material` >= 19 with a Material 3 theme configured.

## Usage

```typescript
import { MatCalendarComponent, CalendarEvent } from 'ngx-mat-calendar';

@Component({
  imports: [MatCalendarComponent],
  template: `
    <mc-calendar
      [events]="events"
      [viewMode]="'week'"
      (eventClicked)="onEvent($event)"
    />
  `,
})
export class MyComponent {
  events: CalendarEvent[] = [
    {
      title: 'Team standup',
      start: '2026-03-26T09:00:00',
      end: '2026-03-26T09:30:00',
    },
    {
      title: 'Lunch',
      start: '2026-03-26T12:00:00',
      end: '2026-03-26T13:00:00',
      color: '#e8f5e9',
    },
  ];

  onEvent(event: CalendarEvent) {
    console.log('Clicked:', event);
  }
}
```

## Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `events` | `CalendarEvent[]` | `[]` | Events to display |
| `selectedDate` | `Date` | `new Date()` | Focused date |
| `viewMode` | `'day' \| 'week' \| 'month'` | `'month'` | Active view |
| `showViewToggle` | `boolean` | `true` | Show day/week/month toggle |
| `labels` | `Partial<CalendarLabels>` | English | Override button/label text |
| `startHour` | `number` | `9` | First hour in day/week grid |
| `endHour` | `number` | `18` | Last hour in day/week grid |
| `weekStartsOn` | `number` | `1` (Mon) | 0 = Sunday, 1 = Monday |

## Outputs

| Output | Type | Description |
|--------|------|-------------|
| `eventClicked` | `CalendarEvent` | Fired when an event is clicked |
| `dateSelected` | `Date` | Fired on date navigation |
| `viewModeChanged` | `CalendarViewMode` | Fired when view mode changes |

## CalendarEvent Interface

```typescript
interface CalendarEvent {
  id?: string | null;
  title: string;
  description?: string | null;
  start: string | Date;
  end?: string | Date | null;
  isAllDay?: boolean;
  color?: string | null;  // CSS color for this event
  data?: unknown;          // Attach any custom data
}
```

## Localization

```typescript
<mc-calendar
  [labels]="{
    today: 'Heute',
    day: 'Tag',
    week: 'Woche',
    month: 'Monat',
    allDay: 'Ganztags',
    noEvents: 'Keine Termine',
    weekdays: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
  }"
/>
```

## License

MIT
