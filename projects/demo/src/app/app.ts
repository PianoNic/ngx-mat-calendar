import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCalendarComponent, CalendarEvent, CalendarViewMode } from 'ngx-m3-calendar';

interface ThemeOption {
  name: string;
  primary: string;
  class: string;
}

@Component({
  selector: 'app-root',
  imports: [MatCalendarComponent, MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  events: CalendarEvent[] = this.generateSampleEvents();
  isDark = signal(false);
  currentTheme = signal<ThemeOption>({ name: 'Azure', primary: '#0078D4', class: '' });

  readonly themes: ThemeOption[] = [
    { name: 'Azure', primary: '#0078D4', class: '' },
    { name: 'Rose', primary: '#B5495B', class: 'theme-rose' },
    { name: 'Teal', primary: '#00897B', class: 'theme-teal' },
    { name: 'Violet', primary: '#7E57C2', class: 'theme-violet' },
  ];

  toggleDark(): void {
    this.isDark.update((v) => !v);
    document.documentElement.classList.toggle('dark', this.isDark());
  }

  setTheme(theme: ThemeOption): void {
    this.themes.forEach((t) => document.documentElement.classList.remove(t.class));
    if (theme.class) document.documentElement.classList.add(theme.class);
    this.currentTheme.set(theme);
  }

  onEventClicked(event: CalendarEvent): void {
    alert(`${event.title}\n${event.start} – ${event.end}`);
  }

  onViewChanged(mode: CalendarViewMode): void {
    console.log('View changed to:', mode);
  }

  onDateSelected(date: Date): void {
    console.log('Date selected:', date);
  }

  private generateSampleEvents(): CalendarEvent[] {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

    return [
      { title: 'Team Standup', start: this.makeDate(monday, 9, 0), end: this.makeDate(monday, 9, 30) },
      { title: 'Sprint Planning', start: this.makeDate(monday, 10, 0), end: this.makeDate(monday, 11, 30), color: '#E8F5E9' },
      { title: 'Design Review', start: this.makeDate(this.addDays(monday, 1), 14, 0), end: this.makeDate(this.addDays(monday, 1), 15, 0), color: '#E3F2FD' },
      { title: '1:1 with Manager', start: this.makeDate(this.addDays(monday, 1), 14, 30), end: this.makeDate(this.addDays(monday, 1), 15, 0), color: '#FFF3E0' },
      { title: 'Lunch & Learn', start: this.makeDate(this.addDays(monday, 2), 12, 0), end: this.makeDate(this.addDays(monday, 2), 13, 0) },
      { title: 'Code Review', start: this.makeDate(this.addDays(monday, 3), 11, 0), end: this.makeDate(this.addDays(monday, 3), 11, 30), color: '#FCE4EC' },
      { title: 'All-Hands Meeting', start: this.makeDate(this.addDays(monday, 3), 15, 0), end: this.makeDate(this.addDays(monday, 3), 16, 0), color: '#F3E5F5' },
      { title: 'Weekly Retro', start: this.makeDate(this.addDays(monday, 4), 16, 0), end: this.makeDate(this.addDays(monday, 4), 17, 0) },
    ];
  }

  private makeDate(base: Date, hours: number, minutes: number): string {
    const d = new Date(base);
    d.setHours(hours, minutes, 0, 0);
    return d.toISOString();
  }

  private addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }
}
