import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  OnInit,
  output,
  signal,
  untracked,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  CalendarDay,
  CalendarEvent,
  CalendarLabels,
  CalendarViewMode,
  DEFAULT_LABELS,
  NormalizedCalendarEvent,
  PositionedEvent,
  WorkHourSlot,
  isCalendarEventValid,
} from './calendar-models';
import { CalendarUtilsService } from './calendar-utils.service';

@Component({
  selector: 'mc-calendar',
  imports: [MatButtonModule, MatIconModule, MatButtonToggleModule, MatTooltipModule, DatePipe],
  templateUrl: './ngx-m3-calendar.html',
  styleUrl: './ngx-m3-calendar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'mc-calendar-shell' },
})
export class MatCalendarComponent implements OnInit {
  private readonly utils = inject(CalendarUtilsService);
  private readonly destroyRef = inject(DestroyRef);

  // ─── Inputs ──────────────────────────────────────────
  /** Array of calendar events to display. */
  readonly events = input<CalendarEvent[]>([]);
  /** The currently selected/focused date. */
  readonly selectedDate = input<Date>(new Date());
  /** Active view mode. */
  readonly viewMode = input<CalendarViewMode>('month');
  /** Whether to show the day/week/month toggle. */
  readonly showViewToggle = input(true);
  /** Override default English labels. */
  readonly labels = input<Partial<CalendarLabels>>({});
  /** First visible hour in day/week views (default 9). */
  readonly startHour = input(9);
  /** Last visible hour in day/week views (default 18). */
  readonly endHour = input(18);
  /** Day the week starts on (0=Sun, 1=Mon, default 1). */
  readonly weekStartsOn = input(1);
  /** Whether dark mode is active — used to adjust custom event colors. */
  readonly darkMode = input(false);

  // ─── Outputs ─────────────────────────────────────────
  /** Emitted when an event is clicked. */
  readonly eventClicked = output<CalendarEvent>();
  /** Emitted when a date is selected (navigation). */
  readonly dateSelected = output<Date>();
  /** Emitted when the view mode changes. */
  readonly viewModeChanged = output<CalendarViewMode>();

  // ─── State ───────────────────────────────────────────
  readonly activeDate = signal<Date>(this.selectedDate());
  readonly currentViewMode = signal<CalendarViewMode>(this.viewMode());
  readonly now = signal(new Date());
  private nowTimer: ReturnType<typeof setInterval> | null = null;

  readonly resolvedLabels = computed<CalendarLabels>(() => ({ ...DEFAULT_LABELS, ...this.labels() }));
  readonly workHours = computed<WorkHourSlot[]>(() => this.utils.buildWorkHours(this.startHour(), this.endHour()));

  private readonly timeFormatter = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
  private readonly dayFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'short' });
  private readonly dateFormatter = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });
  private readonly longDateFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  constructor() {
    effect(() => {
      const incoming = this.selectedDate();
      if (incoming) {
        untracked(() => this.activeDate.set(new Date(incoming)));
      }
    });

    effect(() => {
      const incoming = this.viewMode();
      if (incoming) {
        untracked(() => this.currentViewMode.set(incoming));
      }
    });
  }

  ngOnInit(): void {
    this.nowTimer = setInterval(() => this.now.set(new Date()), 30_000);
    this.destroyRef.onDestroy(() => {
      if (this.nowTimer) clearInterval(this.nowTimer);
    });
  }

  // ─── Time indicator ──────────────────────────────────
  currentTimePosition(): number | null {
    const now = this.now();
    const hours = this.workHours();
    const startHour = hours[0].hour;
    const endHour = hours[hours.length - 1].hour + 1;
    const totalMinutes = (endHour - startHour) * 60;
    const nowMinutes = (now.getHours() - startHour) * 60 + now.getMinutes();
    if (nowMinutes < 0 || nowMinutes > totalMinutes) return null;
    return (nowMinutes / totalMinutes) * 100;
  }

  showTimeLineForDay(date: Date): boolean {
    return this.isToday(date) && this.currentTimePosition() !== null;
  }

  // ─── Computed ────────────────────────────────────────
  readonly normalizedEvents = computed<NormalizedCalendarEvent[]>(() => {
    return (this.events() ?? [])
      .filter(isCalendarEventValid)
      .map((e) => this.normalizeEvent(e))
      .filter((e): e is NormalizedCalendarEvent => Boolean(e));
  });

  readonly eventsByDay = computed(() => {
    const map = new Map<string, NormalizedCalendarEvent[]>();
    this.normalizedEvents().forEach((event) => {
      this.expandEventToDays(event.start, event.end).forEach((day) => {
        const key = this.utils.getDayKey(day);
        const existing = map.get(key) ?? [];
        existing.push(event);
        map.set(key, existing);
      });
    });
    return map;
  });

  readonly weekDays = computed(() => this.utils.getWeekDays(this.activeDate(), this.weekStartsOn()));
  readonly monthGrid = computed(() => this.utils.getMonthGrid(this.activeDate(), this.weekStartsOn()));

  readonly periodTitle = computed(() => {
    const mode = this.currentViewMode();
    if (mode === 'day') return this.longDateFormatter.format(this.activeDate());
    if (mode === 'week') {
      const week = this.weekDays();
      return `${this.dateFormatter.format(week[0])} – ${this.dateFormatter.format(week[6])}`;
    }
    return this.utils.getMonthTitle(this.activeDate());
  });

  // ─── Actions ─────────────────────────────────────────
  previous(): void {
    const mode = this.currentViewMode();
    if (mode === 'day') { this.shiftDays(-1); return; }
    if (mode === 'week') { this.shiftDays(-7); return; }
    this.shiftMonths(-1);
  }

  next(): void {
    const mode = this.currentViewMode();
    if (mode === 'day') { this.shiftDays(1); return; }
    if (mode === 'week') { this.shiftDays(7); return; }
    this.shiftMonths(1);
  }

  goToday(): void {
    const today = new Date();
    this.activeDate.set(today);
    this.dateSelected.emit(today);
  }

  changeView(mode: CalendarViewMode | string): void {
    if (!mode || (mode !== 'day' && mode !== 'week' && mode !== 'month')) return;
    if (mode === this.currentViewMode()) return;
    this.currentViewMode.set(mode);
    this.viewModeChanged.emit(mode);
  }

  selectDate(date: Date): void {
    this.activeDate.set(date);
    this.dateSelected.emit(date);
  }

  openEvent(event: NormalizedCalendarEvent): void {
    this.eventClicked.emit(event.raw);
  }

  // ─── Helpers ─────────────────────────────────────────
  eventsForDate(date: Date): NormalizedCalendarEvent[] {
    return this.eventsByDay().get(this.utils.getDayKey(date)) ?? [];
  }

  positionedEventsForDate(date: Date): PositionedEvent[] {
    const events = this.eventsForDate(date);
    if (events.length === 0) return [];

    const hours = this.workHours();
    const startHour = hours[0].hour;
    const endHour = hours[hours.length - 1].hour + 1;
    const totalMinutes = (endHour - startHour) * 60;

    const positioned: PositionedEvent[] = events.map((event) => {
      const eventStart = Math.max((event.start.getHours() - startHour) * 60 + event.start.getMinutes(), 0);
      const eventEnd = Math.min((event.end.getHours() - startHour) * 60 + event.end.getMinutes(), totalMinutes);
      const duration = Math.max(eventEnd - eventStart, 15);
      return { event, top: (eventStart / totalMinutes) * 100, height: (duration / totalMinutes) * 100, left: 0, width: 100 };
    });

    this.resolveOverlaps(positioned);
    return positioned;
  }

  formatEventTime(event: NormalizedCalendarEvent): string {
    if (event.isAllDay) return this.resolvedLabels().allDay;
    return `${this.timeFormatter.format(event.start)} – ${this.timeFormatter.format(event.end)}`;
  }

  formatDayLabel(date: Date): string { return this.dayFormatter.format(date); }
  formatDateLabel(date: Date): string { return this.dateFormatter.format(date); }
  truncateText(text: string, max = 25): string { return text.length > max ? text.substring(0, max) + '...' : text; }
  isToday(date: Date): boolean { return this.utils.isSameDay(new Date(), date); }
  trackByDate(_i: number, d: Date): string { return this.utils.getDayKey(d); }
  trackByDay(_i: number, d: CalendarDay): string { return this.utils.getDayKey(d.date); }
  trackByEvent(_i: number, e: NormalizedCalendarEvent): string { return `${e.raw.title}-${e.start.toISOString()}`; }

  /** Parses a hex color to RGB. */
  private parseHex(color: string): { r: number; g: number; b: number } | null {
    const hex = color.replace('#', '');
    if (hex.length < 6) return null;
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16),
    };
  }

  /** Returns a readable text color based on background luminance. */
  contrastText(color: string | null | undefined): string | null {
    if (!color) return null;
    const rgb = this.parseHex(color);
    if (!rgb) return null;
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.6 ? '#37474f' : '#e8eaed';
  }

  /** Returns a color adjusted for the current theme (darkened in dark mode). */
  adjustedColor(color: string | null | undefined): string | null {
    if (!color) return null;
    const rgb = this.parseHex(color);
    if (!rgb) return color;
    if (this.darkMode()) {
      const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
      if (luminance > 0.5) {
        // Shift towards a darker, more saturated version
        const max = Math.max(rgb.r, rgb.g, rgb.b);
        const factor = 0.45;
        // Boost the dominant channel slightly to preserve hue
        const r = Math.round(rgb.r * factor + (rgb.r === max ? 15 : 0));
        const g = Math.round(rgb.g * factor + (rgb.g === max ? 15 : 0));
        const b = Math.round(rgb.b * factor + (rgb.b === max ? 15 : 0));
        return `rgb(${Math.min(r, 255)}, ${Math.min(g, 255)}, ${Math.min(b, 255)})`;
      }
    }
    return color;
  }

  // ─── Private ─────────────────────────────────────────
  private normalizeEvent(event: CalendarEvent): NormalizedCalendarEvent | null {
    const start = this.utils.toLocalDate(event.start);
    if (!start) return null;
    const end = this.utils.toLocalDate(event.end ?? event.start) ?? start;
    return { raw: event, title: event.title ?? 'Untitled', description: event.description, start, end, isAllDay: Boolean(event.isAllDay), color: event.color };
  }

  private shiftDays(delta: number): void { this.selectDate(this.utils.addDays(this.activeDate(), delta)); }
  private shiftMonths(delta: number): void {
    const c = this.activeDate();
    this.selectDate(new Date(c.getFullYear(), c.getMonth() + delta, Math.min(c.getDate(), 28)));
  }

  private expandEventToDays(start: Date, end: Date): Date[] {
    const days: Date[] = [];
    let cursor = this.utils.startOfDay(start);
    const endDay = this.utils.startOfDay(end);
    while (cursor.getTime() <= endDay.getTime()) { days.push(cursor); cursor = this.utils.addDays(cursor, 1); }
    return days;
  }

  private resolveOverlaps(events: PositionedEvent[]): void {
    if (events.length <= 1) return;
    const sorted = [...events].sort((a, b) => a.top - b.top || b.height - a.height);
    const groups: PositionedEvent[][] = [];
    let group: PositionedEvent[] = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
      const cur = sorted[i];
      if (cur.top < Math.max(...group.map((e) => e.top + e.height))) {
        group.push(cur);
      } else {
        groups.push(group);
        group = [cur];
      }
    }
    groups.push(group);

    for (const g of groups) {
      const cols: PositionedEvent[][] = [];
      for (const pe of g) {
        let placed = false;
        for (const col of cols) {
          if (pe.top >= col[col.length - 1].top + col[col.length - 1].height) { col.push(pe); placed = true; break; }
        }
        if (!placed) cols.push([pe]);
      }
      const total = cols.length;
      cols.forEach((col, ci) => col.forEach((pe) => { pe.left = (ci / total) * 100; pe.width = 100 / total; }));
    }
  }
}
