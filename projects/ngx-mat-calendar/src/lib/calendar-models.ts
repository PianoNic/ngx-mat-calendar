/** View modes available in the calendar. */
export type CalendarViewMode = 'day' | 'week' | 'month';

/** Event input interface — pass your events in this shape. */
export interface CalendarEvent {
  /** Unique identifier for the event. */
  id?: string | null;
  /** Display title. */
  title: string;
  /** Optional description. */
  description?: string | null;
  /** ISO date string or Date for the event start. */
  start: string | Date;
  /** ISO date string or Date for the event end. */
  end?: string | Date | null;
  /** Whether the event spans the entire day. */
  isAllDay?: boolean;
  /** Optional color override (CSS color value). */
  color?: string | null;
  /** Arbitrary data attached to the event. */
  data?: unknown;
}

/** Participant display model. */
export interface CalendarParticipant {
  name: string;
  email: string;
}

/** Internally normalized event. */
export interface NormalizedCalendarEvent {
  raw: CalendarEvent;
  title: string;
  description?: string | null;
  start: Date;
  end: Date;
  isAllDay: boolean;
  color?: string | null;
}

/** Positioned event for day/week time grids. */
export interface PositionedEvent {
  event: NormalizedCalendarEvent;
  top: number;
  height: number;
  left: number;
  width: number;
}

/** Day cell in the month grid. */
export interface CalendarDay {
  date: Date;
  inCurrentMonth: boolean;
}

/** Work hour slot definition. */
export interface WorkHourSlot {
  hour: number;
  label: string;
}

/** Labels that can be customized via the `labels` input. */
export interface CalendarLabels {
  today: string;
  day: string;
  week: string;
  month: string;
  allDay: string;
  noEvents: string;
  weekdays: [string, string, string, string, string, string, string];
}

/** Default English labels. */
export const DEFAULT_LABELS: CalendarLabels = {
  today: 'Today',
  day: 'Day',
  week: 'Week',
  month: 'Month',
  allDay: 'All day',
  noEvents: 'No events',
  weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
};

export const isCalendarEventValid = (event: CalendarEvent | null | undefined): boolean => {
  return !!(event && event.start);
};
