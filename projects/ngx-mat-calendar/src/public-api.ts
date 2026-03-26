/*
 * Public API Surface of ngx-mat-calendar
 */

export { MatCalendarComponent } from './lib/ngx-mat-calendar';
export type {
  CalendarEvent,
  CalendarViewMode,
  CalendarLabels,
  CalendarDay,
  CalendarParticipant,
  NormalizedCalendarEvent,
  PositionedEvent,
  WorkHourSlot,
} from './lib/calendar-models';
export { DEFAULT_LABELS } from './lib/calendar-models';
export { CalendarUtilsService } from './lib/calendar-utils.service';
