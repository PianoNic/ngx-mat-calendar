import { Injectable } from '@angular/core';
import { CalendarDay, WorkHourSlot } from './calendar-models';

@Injectable({ providedIn: 'root' })
export class CalendarUtilsService {
  buildWorkHours(startHour: number, endHour: number): WorkHourSlot[] {
    const hours: WorkHourSlot[] = [];
    for (let hour = startHour; hour < endHour; hour += 1) {
      hours.push({ hour, label: this.formatHourLabel(hour) });
    }
    return hours;
  }

  toLocalDate(value: string | Date | null | undefined): Date | null {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }

  isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  startOfDay(value: Date): Date {
    const copy = new Date(value);
    copy.setHours(0, 0, 0, 0);
    return copy;
  }

  addDays(value: Date, days: number): Date {
    const copy = new Date(value);
    copy.setDate(copy.getDate() + days);
    return copy;
  }

  startOfWeek(value: Date, weekStartsOn: number = 1): Date {
    const date = new Date(value);
    const day = (date.getDay() + 7 - weekStartsOn) % 7;
    date.setDate(date.getDate() - day);
    return this.startOfDay(date);
  }

  getWeekDays(anchor: Date, weekStartsOn: number = 1): Date[] {
    const start = this.startOfWeek(anchor, weekStartsOn);
    return Array.from({ length: 7 }, (_, index) => this.addDays(start, index));
  }

  getMonthGrid(anchor: Date, weekStartsOn: number = 1): CalendarDay[][] {
    const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);

    const firstWeekStart = this.startOfWeek(start, weekStartsOn);
    const lastWeekStart = this.startOfWeek(end, weekStartsOn);
    const lastWeekEnd = this.addDays(lastWeekStart, 6);

    const totalDays = Math.round((lastWeekEnd.getTime() - firstWeekStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const days: CalendarDay[] = Array.from({ length: totalDays }, (_, index) => {
      const date = this.addDays(firstWeekStart, index);
      return { date, inCurrentMonth: date.getMonth() === anchor.getMonth() };
    });

    const weeks: CalendarDay[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return weeks;
  }

  getDayKey(value: Date): string {
    const yyyy = value.getFullYear();
    const mm = `${value.getMonth() + 1}`.padStart(2, '0');
    const dd = `${value.getDate()}`.padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  formatHourLabel(hour: number): string {
    const date = new Date();
    date.setHours(hour, 0, 0, 0);
    return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(date);
  }

  getMonthTitle(value: Date): string {
    return new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(value);
  }
}
